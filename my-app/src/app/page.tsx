'use client';

import React from 'react';
import { Send, Bot, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Components
import { NewsDialog } from '@/components/NewsDialog';
import { ScraperDialog } from '@/components/ScraperDialog';
import { FileUploadSection } from '@/components/FileUploadSection';
import { FileList } from '@/components/FileList';
import { ChatMessage } from '@/components/ChatMessage';

// Hooks
import { useMessages } from './hooks/useMessages';
import { useDocumentState } from './hooks/useDocumentState';
import { useFileUpload } from './hooks/useFileUpload';
import { useChat } from './hooks/useChat';
import { useFileManagement } from './hooks/useFileManagement';
import { useChatHistory } from './hooks/useChatHistory';
import { useNews } from './hooks/useNews';
import { useWebScraper } from './hooks/useWebScraper';

export default function Home() {
  const { messages, addMessage, clearMessages, messagesEndRef } = useMessages();
  
  const { files, isLoading: isLoadingFiles, isDeleting, deleteFile, fetchFiles } = useFileManagement({
    onMessage: addMessage
  });

  const { isDocumentUploaded } = useDocumentState(files);
  
  const fileUploadProps = useFileUpload({
    onMessage: addMessage,
    onDocumentUploaded: () => {},
    onRefreshFiles: fetchFiles
  });

  const chatProps = useChat({
    onMessage: addMessage,
    isDocumentUploaded
  });

  const { clearHistory, isClearing } = useChatHistory({
    onMessage: addMessage,
    onClearMessages: clearMessages,
    onRefreshFiles: fetchFiles
  });

  const { fetchNews, isLoadingNews } = useNews({
    onMessage: addMessage
  });

  // Wrapper to match NewsDialog's expected signature
  const handleFetchNews = async (query: string): Promise<void> => {
    await fetchNews(query);
  };

  const { scrapeUrl, isScraping } = useWebScraper({
    onMessage: addMessage
  });

  // Wrapper to match ScraperDialog's expected signature
  const handleScrapeUrl = async (url: string): Promise<void> => {
    const res = await scrapeUrl(url);
    if (res && (res as any).success) {
      await fetchFiles();
    }
  };

  const isAnyLoading = fileUploadProps.isUploading || chatProps.isAsking || isLoadingNews || isScraping;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto flex gap-4 h-screen">
        
        {/* Sidebar */}
        <div className="w-80 flex flex-col">
          <Card className="flex-1 overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
                <Button
                  onClick={clearHistory}
                  disabled={isClearing}
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:text-red-800 text-xs"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  {isClearing ? 'Clearing...' : 'Clear Chat'}
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <FileUploadSection {...fileUploadProps} />
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Additional Features</h3>
                <NewsDialog onFetchNews={handleFetchNews} isLoadingNews={isLoadingNews} />
                <ScraperDialog onScrapeUrl={handleScrapeUrl} isScraping={isScraping} />
              </div>

              <FileList 
                files={files}
                isLoadingFiles={isLoadingFiles}
                isDeleting={isDeleting}
                onDeleteFile={deleteFile}
              />
            </CardContent>
          </Card>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <Card className="flex-1 overflow-hidden flex flex-col">
            
            {/* Chat Header */}
            <CardHeader className="bg-white border-b">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    <Bot className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Legal AI Assistant</h2>
                  <p className="text-sm text-gray-500">
                    {isDocumentUploaded ? `📄 ${files.length} document(s) ready` : 'Upload a document to get started'}
                  </p>
                </div>
                {isAnyLoading && (
                  <div className="flex items-center gap-2 text-blue-600 ml-auto">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">
                      {fileUploadProps.isUploading ? 'Processing...' : 
                       chatProps.isAsking ? 'Thinking...' :
                       isLoadingNews ? 'Fetching news...' :
                       isScraping ? 'Scraping...' : 'Working...'}
                    </span>
                  </div>
                )}
              </div>
            </CardHeader>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-end gap-3">
                <Input
                  value={chatProps.inputMessage}
                  onChange={(e) => chatProps.setInputMessage(e.target.value)}
                  onKeyPress={chatProps.handleKeyPress}
                  placeholder={
                    isDocumentUploaded 
                      ? "Ask a question about your documents or paste a URL..." 
                      : "Say hi, upload a document, or paste a URL to begin..."
                  }
                  className="flex-1"
                  disabled={chatProps.isAsking}
                />
                <Button
                  onClick={chatProps.handleSendMessage}
                  disabled={!chatProps.inputMessage.trim() || chatProps.isAsking}
                  size="icon"
                >
                  {chatProps.isAsking ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Tip: You can paste URLs directly in chat for automatic scraping, or use the buttons above for news and web scraping.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}