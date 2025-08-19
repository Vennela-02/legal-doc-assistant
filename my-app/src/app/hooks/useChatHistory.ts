import { useState } from 'react';

const API_BASE_URL = 'http://localhost:8000';

interface UseChatHistoryProps {
  onMessage: (type: 'bot' | 'user', content: string, isFile?: boolean, updateId?: number) => any;
  onClearMessages: () => void;
  onRefreshFiles?: () => void;
}

export const useChatHistory = ({ onMessage, onClearMessages, onRefreshFiles }: UseChatHistoryProps) => {
  const [isClearing, setIsClearing] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);

  const clearHistory = async () => {
    setIsClearing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/clear`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        onClearMessages();
        return { success: true, message: result.message };
      } else {
        throw new Error(result.error || 'Clear history failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Clear history failed';
      onMessage('bot', `❌ Error clearing history: ${errorMessage}`);
      return { success: false, error: errorMessage };
    } finally {
      setIsClearing(false);
    }
  };

  const clearAll = async () => {
    setIsClearingAll(true);
    try {
      // Since backend doesn't have /clear_all endpoint, we'll clear chat history only
      // and inform user that individual file deletion is available
      const response = await fetch(`${API_BASE_URL}/clear`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        onClearMessages();
        onMessage('bot', '🗑️ Chat history cleared. To remove documents, please delete them individually from the file list.');
        return { success: true, message: result.message };
      } else {
        throw new Error(result.error || 'Clear failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Clear failed';
      onMessage('bot', `❌ Error clearing chat history: ${errorMessage}`);
      return { success: false, error: errorMessage };
    } finally {
      setIsClearingAll(false);
    }
  };

  return {
    clearHistory,
    clearAll,
    isClearing,
    isClearingAll,
  };
};

export default useChatHistory;