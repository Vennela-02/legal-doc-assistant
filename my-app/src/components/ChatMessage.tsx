import React from 'react';
import { Bot, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MarkdownRenderer } from '@/components/ui/markdown';

interface Message {
  id: number;
  type: 'bot' | 'user';
  content: string;
  timestamp: string;
  isFile?: boolean;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div
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
        {message.type === 'bot' && !message.isFile ? (
          <MarkdownRenderer 
            content={message.content} 
            className="text-sm leading-relaxed"
          />
        ) : (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        )}
        <p className={`text-xs mt-2 ${
          message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
        }`}>
          {message.timestamp}
        </p>
      </div>
    </div>
  );
};
