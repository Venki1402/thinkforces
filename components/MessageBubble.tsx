import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, Role } from '../types';
import { Bot, User, Code2 } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-indigo-600' : 'bg-emerald-600'
        }`}>
          {isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
        </div>

        {/* Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-4 py-3 rounded-2xl shadow-md overflow-hidden ${
            isUser 
              ? 'bg-indigo-600 text-white rounded-tr-none' 
              : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
          }`}>
            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {message.attachments.map((att, idx) => (
                  <div key={idx} className="relative group">
                    {att.mimeType.startsWith('image/') ? (
                      <img 
                        src={att.data} 
                        alt="attachment" 
                        className="max-h-48 rounded-lg border border-white/20" 
                      />
                    ) : (
                      <div className="flex items-center gap-2 bg-white/10 p-2 rounded text-sm">
                        <Code2 size={16} />
                        <span>Code Snippet</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Text Content */}
            <div className={`prose prose-invert max-w-none text-sm md:text-base leading-relaxed break-words
              prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-700 prose-pre:rounded-lg
              prose-code:text-indigo-300 prose-code:bg-slate-900/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              ${isUser ? 'prose-headings:text-white prose-p:text-white prose-strong:text-white' : ''}
            `}>
              <ReactMarkdown>{message.text}</ReactMarkdown>
            </div>
          </div>
          <span className="text-xs text-slate-500 mt-1 px-1">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;