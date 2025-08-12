import { useState } from 'react';

export const useDocumentState = () => {
  const [isDocumentUploaded, setIsDocumentUploaded] = useState<boolean>(false);

  const markDocumentAsUploaded = () => {
    setIsDocumentUploaded(true);
  };

  return {
    isDocumentUploaded,
    markDocumentAsUploaded
  };
};

export default useDocumentState;