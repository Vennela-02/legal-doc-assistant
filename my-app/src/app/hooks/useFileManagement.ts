import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:8000';

interface FileItem {
  file_id: string;
  file_name: string;
}

interface UseFileManagementProps {
  onMessage: (type: 'bot' | 'user', content: string, isFile?: boolean, updateId?: number) => any;
}

export const useFileManagement = ({ onMessage }: UseFileManagementProps) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/files`);
      const data = await response.json();
      
      if (response.ok) {
        setFiles(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch files:', data.error);
        setFiles([]);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFile = async (fileName: string) => {
    setIsDeleting(fileName);
    try {
      const response = await fetch(`${API_BASE_URL}/delete/${encodeURIComponent(fileName)}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        onMessage('bot', `🗑️ File "${fileName}" deleted successfully.`);
        await fetchFiles(); // Refresh file list
        return { success: true, message: result.message };
      } else {
        throw new Error(result.error || 'Delete failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Delete failed';
      onMessage('bot', `❌ Error deleting file: ${errorMessage}`);
      return { success: false, error: errorMessage };
    } finally {
      setIsDeleting(null);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return {
    files,
    isLoading,
    isDeleting,
    fetchFiles,
    deleteFile,
  };
};

export default useFileManagement;