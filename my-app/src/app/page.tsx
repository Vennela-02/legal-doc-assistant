'use client';

import React from 'react';
import { Upload, Send, FileText, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Custom hooks
import { useMessages } from './hooks/useMessages';
import { useDocumentState } from './hooks/useDocumentState';
import { useFileUpload } from './hooks/useFileUpload';
import { useChat } from './hooks/useChat';

export default function Home() {
  const { messages, addMessage, messagesEndRef } = useMessages();
  const { isDocumentUploaded, markDocumentAsUploaded } = useDocumentState();
  
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
    onDocumentUploaded: markDocumentAsUploaded
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Document Assistant</h1>
        </div>

        {/* Chat Container */}
        <Card className="overflow-hidden">
          {/* Chat Header */}
          <CardHeader className="bg-white border-b">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  <FileText className="w-6 h-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Legal Document Chatbot</h2>
                <p className="text-sm text-gray-500">
                  {isDocumentUploaded ? '📄 Document ready' : 'Upload a document to get started'}
                </p>
              </div>
              {(isUploading || isAsking) && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">
                    {isUploading ? 'Processing...' : 'Thinking...'}
                  </span>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Messages Area */}
            <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gray-50">
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
                    {message.type === 'bot' && message.content === '' && isAsking && (
                      <div className="flex items-center gap-2 text-blue-500">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span className="text-xs">AI is thinking...</span>
                      </div>
                    )}
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

            {/* File Upload Area */}
            <div className="p-4 border-t border-gray-200 bg-white">
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
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                <Button
                  variant="outline"
                  onClick={triggerFileInput}
                  className="gap-2"
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
                      Attach Document
                    </>
                  )}
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  Drop your document here or click to browse
                  <br />
                  <span className="text-xs text-gray-400">Supported: PDF, Word, PowerPoint, Text</span>
                </p>
              </div>
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
                      ? "Ask a question about your document..." 
                      : "Upload a document first..."
                  }
                  className="flex-1"
                  disabled={isAsking}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isAsking || !isDocumentUploaded}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}