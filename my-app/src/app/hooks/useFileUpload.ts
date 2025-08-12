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
    const file = event.target.files?.[0];
    if (!file) return;

    // Check for supported file types
    const supportedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ];

    if (!supportedTypes.includes(file.type)) {
      onMessage('bot', 'Please upload a supported file format: PDF, Word (.doc/.docx), PowerPoint (.ppt/.pptx), or Text (.txt).');
      return;
    }

    // Add upload message with appropriate emoji
    let emoji = '📄';
    if (file.type.includes('word')) emoji = '📝';
    else if (file.type.includes('presentation')) emoji = '📊';
    else if (file.type === 'text/plain') emoji = '📃';
    
    onMessage('user', `${emoji} Uploading: ${file.name}`, true);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Add success message
      onMessage('bot', `✅ Document "${file.name}" uploaded and processed successfully! You can now ask questions about it.`);
      onDocumentUploaded();
      
    } catch (error) {
      console.error('Error uploading file:', error);
      onMessage('bot', 'Sorry, there was an error uploading your file. Please make sure the backend server is running and try again.');
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