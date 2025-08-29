import { useState } from 'react';

const API_BASE_URL = 'http://localhost:8000';

interface UseChatProps {
  onMessage: (type: 'bot' | 'user', content: string, isFile?: boolean, updateId?: number) => any;
  isDocumentUploaded: boolean;
}

export const useChat = ({ onMessage, isDocumentUploaded }: UseChatProps) => {
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isAsking, setIsAsking] = useState<boolean>(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    // Normalize for simple intent checks
    const normalized = inputMessage.replace(/[^\w\s]/g, '').trim().toLowerCase();

    // Check if it's a greeting - allow these even without documents
    const greetings = ["hi", "hello", "hey", "greetings", "good morning", "good afternoon", "good evening"];
    const isGreeting = greetings.some(g => normalized === g || normalized.startsWith(g + ' '));

    // Check if message contains URL (backend will handle this automatically)
    const urlPattern = /https?:\/\/\S+/;
    const containsUrl = urlPattern.test(inputMessage);

    // Do NOT block sending messages based on document presence; let backend handle fallback
    // Previous gating removed to rely on backend logic for greetings, summaries, and general queries

    // Set thinking state first
    setIsAsking(true);
    
    // Add user message
    onMessage('user', inputMessage);
    const userQuestion = inputMessage;
    setInputMessage('');

    // Small delay to ensure UI updates
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      // Create FormData for the API call
      const formData = new FormData();
      formData.append('question', userQuestion);

      const response = await fetch(`${API_BASE_URL}/ask`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        // Handle different error responses
        if (response.status === 500) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Server error occurred');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if response is JSON (no documents case) or streaming
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        // Handle JSON response (e.g., no documents message)
        const data = await response.json();
        onMessage('bot', data.message || 'No response received');
        return;
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('No response body');
      }

      // Create initial bot message for streaming
      const botMessage = onMessage('bot', '');
      const botMessageId = botMessage?.id;
      let accumulatedResponse = '';

      // Read the stream
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        accumulatedResponse += chunk;
        
        // Update the bot message with accumulated response
        if (botMessageId) {
          onMessage('bot', accumulatedResponse, false, botMessageId);
        }
      }

      // If no content was received, show error message
      if (!accumulatedResponse.trim()) {
        onMessage('bot', 'Sorry, I could not process your question. Please try again or check if the backend server is running properly.');
      }
      
    } catch (error) {
      console.error('Error asking question:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Provide more helpful error messages
      if (errorMessage.includes('fetch')) {
        onMessage('bot', '❌ Connection error: Unable to reach the backend server. Please make sure the server is running on http://localhost:8000');
      } else if (errorMessage.includes('500')) {
        onMessage('bot', `❌ Server error: ${errorMessage}. This might be due to missing API keys or server configuration issues.`);
      } else {
        onMessage('bot', `❌ Error: ${errorMessage}. Please try again or contact support if the issue persists.`);
      }
    } finally {
      setIsAsking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return {
    inputMessage,
    setInputMessage,
    isAsking,
    handleSendMessage,
    handleKeyPress
  };
};

export default useChat;