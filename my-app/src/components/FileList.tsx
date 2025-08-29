import React from 'react';
import { FileText, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileItem {
  file_id: string;
  file_name: string;
}

interface FileListProps {
  files: FileItem[];
  isLoadingFiles: boolean;
  isDeleting: string | null;
  onDeleteFile: (fileName: string) => void;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  isLoadingFiles,
  isDeleting,
  onDeleteFile
}) => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700">Uploaded Files</h3>
      {isLoadingFiles ? (
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading files...</span>
        </div>
      ) : files.length > 0 ? (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {files.map((file) => (
            <div key={file.file_id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="text-sm text-gray-700 truncate" title={file.file_name}>
                  {file.file_name}
                </span>
              </div>
              <Button
                onClick={() => onDeleteFile(file.file_name)}
                disabled={isDeleting === file.file_name}
                size="sm"
                variant="ghost"
                className="text-red-600 hover:text-red-800 flex-shrink-0"
                title={`Delete ${file.file_name}`}
              >
                {isDeleting === file.file_name ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No files uploaded yet</p>
      )}
    </div>
  );
};
