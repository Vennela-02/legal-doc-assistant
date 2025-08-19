import { useState, useEffect, useRef } from 'react';

interface Message {
  id: number;
  type: 'bot' | 'user';
  content: string;
  timestamp: string;
  isFile?: boolean;
}

// Counter to ensure unique IDs
let messageIdCounter = 1;

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: messageIdCounter++,
      type: 'bot',
      content: "Hello! I'm your legal AI assistant. Upload a document (PDF, Word, PowerPoint, or Text) and ask me questions about it. How can I help you today?",
      timestamp: '3:37:55 PM'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (type: 'bot' | 'user', content: string, isFile: boolean = false, updateId?: number): Message | undefined => {
    if (updateId) {
      // Update existing message for streaming
      setMessages(prev => 
        prev.map(msg => 
          msg.id === updateId 
            ? { ...msg, content }
            : msg
        )
      );
      // Return the updated message (we need to find it from current state)
      const currentMessages = messages;
      return currentMessages.find(msg => msg.id === updateId);
    } else {
      // Create new message with unique ID
      const newMessage = {
        id: messageIdCounter++,
        type,
        content,
        timestamp: new Date().toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        }),
        isFile
      };
      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    }
  };

  const clearMessages = () => {
    setMessages([
      {
        id: messageIdCounter++,
        type: 'bot',
        content: "Hello! I'm your legal AI assistant. Upload a document (PDF, Word, PowerPoint, or Text) and ask me questions about it. How can I help you today?",
        timestamp: new Date().toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        })
      }
    ]);
  };

  return {
    messages,
    addMessage,
    clearMessages,
    messagesEndRef
  };
};

export default useMessages;