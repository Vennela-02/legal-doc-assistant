import { useState, useRef } from 'react';

const API_BASE_URL = 'http://localhost:8000';

interface UseFileUploadProps {
  onMessage: (type: 'bot' | 'user', content: string, isFile?: boolean, updateId?: number) => any;
  onDocumentUploaded: () => void;
}

export const useFileUpload = ({ onMessage, onDocumentUploaded }: UseFileUploadProps) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Check for supported file types
    const supportedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ];

    // Filter supported files first
    const validFiles = files.filter(file => {
      if (!supportedTypes.includes(file.type)) {
        onMessage('bot', `Please upload a supported file format: PDF, Word (.doc/.docx), PowerPoint (.ppt/.pptx), or Text (.txt). File: ${file.name}`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setIsUploading(true);
    try {
      // Upload all valid files at once (backend supports multiple files)
      const formData = new FormData();
      validFiles.forEach(file => {
        formData.append('files', file);
      });

      // Add upload message
      const fileNames = validFiles.map(f => f.name).join(', ');
      onMessage('user', `📄 Uploading: ${fileNames}`, true);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        onMessage('bot', `❌ Error uploading files`);
        return;
      }

      const data = await response.json();
      
      // Handle response based on backend structure
      if (data.results && Array.isArray(data.results)) {
        data.results.forEach((result: any) => {
          if (result.status === 'uploaded') {
            onMessage('bot', `✅ Document "${result.file_name}" uploaded and processed successfully!`);
          } else if (result.status === 'skipped') {
            onMessage('bot', `⚠️ Document "${result.file_name}" was skipped (already exists)`);
          }
        });
      } else {
        onMessage('bot', `✅ Documents uploaded successfully! You can now ask questions about them.`);
      }
      
      onDocumentUploaded();
    } catch (error) {
      console.error('Error uploading file:', error);
      onMessage('bot', 'Sorry, there was an error uploading your file(s). Please make sure the backend server is running and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const event = { target: { files } } as React.ChangeEvent<HTMLInputElement>;
      handleFileUpload(event);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return {
    isUploading,
    isDragging,
    fileInputRef,
    handleFileUpload,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    triggerFileInput
  };
};

export default useFileUpload;