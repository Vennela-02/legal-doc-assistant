'use client';

import React from 'react';
import { Upload, Send, FileText, Bot, User, Loader2, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';


// Custom hooks
import { useMessages } from './hooks/useMessages';
import { useDocumentState } from './hooks/useDocumentState';
import { useFileUpload } from './hooks/useFileUpload';
import { useChat } from './hooks/useChat';
import { useFileManagement } from './hooks/useFileManagement';
import { useChatHistory } from './hooks/useChatHistory';

export default function Home() {
  const { messages, addMessage, clearMessages, messagesEndRef } = useMessages();
  
  const { files, isLoading: isLoadingFiles, isDeleting, deleteFile, fetchFiles } = useFileManagement({
    onMessage: addMessage
  });

  const { isDocumentUploaded } = useDocumentState(files);
  
  const {
    isUploading,
    isDragging,
    fileInputRef,
    handleFileUpload,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    triggerFileInput
  } = useFileUpload({
    onMessage: addMessage,
    onDocumentUploaded: () => {}, // Document state now managed by file list
    onRefreshFiles: fetchFiles
  });

  const {
    inputMessage,
    setInputMessage,
    isAsking,
    handleSendMessage,
    handleKeyPress
  } = useChat({
    onMessage: addMessage,
    isDocumentUploaded
  });

  const { clearHistory, clearAll, isClearing, isClearingAll } = useChatHistory({
    onMessage: addMessage,
    onClearMessages: clearMessages,
    onRefreshFiles: fetchFiles
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto flex gap-4 h-screen">
        {/* Sidebar */}
        <div className="w-80 flex flex-col">
          <Card className="flex-1 overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
                <div className="flex flex-col gap-1">
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
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* File Upload Area */}
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

              {/* File List */}
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
                          <span className="text-sm text-gray-700 truncate">{file.file_name}</span>
                        </div>
                        <Button
                          onClick={() => deleteFile(file.file_name)}
                          disabled={isDeleting === file.file_name}
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-800 flex-shrink-0"
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
                {(isUploading || isAsking) && (
                  <div className="flex items-center gap-2 text-blue-600 ml-auto">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">
                      {isUploading ? 'Processing...' : 'Thinking...'}
                    </span>
                  </div>
                )}
              </div>
            </CardHeader>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className={`${
                      message.type === 'bot' 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {message.type === 'bot' ? (
                        <Bot className="w-4 h-4" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-900 shadow-sm border border-gray-200'
                  } ${message.isFile ? 'bg-green-100 text-green-800 border-green-200' : ''}`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-2 ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-end gap-3">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    isDocumentUploaded 
                      ? "Ask a question about your documents..." 
                      : "Say hi or upload a document to begin..."
                  }
                  className="flex-1"
                  disabled={isAsking}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isAsking}
                  size="icon"
                >
                  {isAsking ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}