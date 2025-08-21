import { useState, useEffect } from 'react';

interface FileItem {
  file_id: string;
  file_name: string;
}

export const useDocumentState = (files: FileItem[] = []) => {
  const [isDocumentUploaded, setIsDocumentUploaded] = useState<boolean>(false);

  // Update document state based on files list
  useEffect(() => {
    setIsDocumentUploaded(files.length > 0);
  }, [files]);

  const markDocumentAsUploaded = () => {
    setIsDocumentUploaded(true);
  };

  const markDocumentAsNotUploaded = () => {
    setIsDocumentUploaded(false);
  };

  return {
    isDocumentUploaded,
    markDocumentAsUploaded,
    markDocumentAsNotUploaded
  };
};

export default useDocumentState;