import React, { useState, useEffect, useRef } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import InputArea from './components/InputArea';
import MessageBubble from './components/MessageBubble';
import { Message, Role, Attachment, InteractionMode } from './types';
import { sendMessageStream, resetSession } from './services/geminiService';
import { WELCOME_MESSAGE } from './constants';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initial welcome message
  useEffect(() => {
    setMessages([{
      id: 'welcome',
      role: Role.MODEL,
      text: WELCOME_MESSAGE,
      timestamp: Date.now()
    }]);
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string, attachments: Attachment[]) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      text,
      attachments,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Create a placeholder for the bot response
      const botMessageId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: botMessageId,
        role: Role.MODEL,
        text: '',
        timestamp: Date.now()
      }]);

      let fullResponse = '';
      const stream = sendMessageStream(text, attachments);

      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === botMessageId ? { ...msg, text: fullResponse } : msg
        ));
      }

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: Role.MODEL,
        text: "I encountered an error. Please check your API key configuration.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([{
      id: 'welcome',
      role: Role.MODEL,
      text: WELCOME_MESSAGE,
      timestamp: Date.now()
    }]);
    resetSession();
  };

  const handleModeSelect = (mode: InteractionMode) => {
    let promptText = "";
    switch (mode) {
      case InteractionMode.PROBLEM_SOLVING:
        promptText = "I'm stuck on a problem. Can you help me understand it without giving away the solution?";
        break;
      case InteractionMode.EDITORIAL:
        promptText = "I have an editorial/solution that I don't understand. Can you explain it to me step-by-step?";
        break;
      case InteractionMode.CODE_REVIEW:
        promptText = "I'd like you to review my code. Please check for complexity and potential bugs, but don't fix them for me immediately.";
        break;
      default:
        return;
    }
    handleSendMessage(promptText, []);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden selection:bg-indigo-500/30">
      
      {/* Sidebar */}
      <Sidebar 
        onClearChat={handleClearChat}
        onModeSelect={handleModeSelect}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative">
        
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-indigo-400">CodeSensei</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-400 hover:text-white"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-4xl mx-auto">
            {messages.map(msg => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-slate-500 text-sm ml-12 animate-pulse">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
                <span>Sensei is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm p-4">
          <InputArea 
            onSend={handleSendMessage} 
            isLoading={isLoading} 
            disabled={false}
          />
        </div>

      </div>
    </div>
  );
};

export default App;