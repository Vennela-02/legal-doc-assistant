import React from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadSectionProps {
  isUploading: boolean;
  isDragging: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  triggerFileInput: () => void;
}

export const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  isUploading,
  isDragging,
  fileInputRef,
  handleFileUpload,
  handleDrop,
  handleDragOver,
  handleDragLeave,
  triggerFileInput
}) => {
  return (
    <div
      className={`border-2 border-dashed rounded-xl p-4 text-center transition-all duration-200 ${
        isDragging
          ? 'border-blue-400 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400'
      } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain"
        onChange={handleFileUpload}
        className="hidden"
        disabled={isUploading}
      />
      <Button
        variant="outline"
        onClick={triggerFileInput}
        className="w-full gap-2"
        disabled={isUploading}
      >
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            Upload Document
          </>
        )}
      </Button>
      <p className="text-xs text-gray-500 mt-2">
        PDF, Word, PowerPoint, Text
      </p>
    </div>
  );
};
