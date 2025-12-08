import React from 'react';
import { Trash2, BookOpen, Search, Code, BrainCircuit, Key, Check, X } from 'lucide-react';
import { setCustomApiKey } from '../services/geminiService';
import { InteractionMode } from '../types';

interface SidebarProps {
  onClearChat: () => void;
  onModeSelect: (mode: InteractionMode) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClearChat, onModeSelect, isOpen, setIsOpen }) => {
  const [showApiKeyInput, setShowApiKeyInput] = React.useState(false);
  const [apiKey, setApiKey] = React.useState('');

  React.useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) setApiKey(storedKey);
  }, []);

  const handleSaveApiKey = () => {
    setCustomApiKey(apiKey);
    setShowApiKeyInput(false);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 w-72 bg-dark-surface border-r border-dark-border transform transition-transform duration-300 z-50 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:static`}>

        {/* Header */}
        <div className="p-6 border-b border-dark-border">
          <div className="flex items-center gap-3 text-brand mb-2">
            <BrainCircuit size={28} />
            <h1 className="text-xl font-bold tracking-tight text-white">ThinkForces</h1>
          </div>
          <p className="text-xs text-dark-muted">Gemini 3 Pro Powered Tutor</p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-8">

          {/* Modes */}
          <div>
            <h3 className="text-xs font-semibold text-dark-muted uppercase tracking-wider mb-3 px-2">
              Quick Actions
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => { onModeSelect(InteractionMode.PROBLEM_SOLVING); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-dark-text hover:text-white hover:bg-dark-border rounded-lg transition-colors text-left"
              >
                <Search size={16} className="text-brand" />
                Problem Solving
              </button>
              <button
                onClick={() => { onModeSelect(InteractionMode.EDITORIAL); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-dark-text hover:text-white hover:bg-dark-border rounded-lg transition-colors text-left"
              >
                <BookOpen size={16} className="text-brand" />
                Editorial Explainer
              </button>
              <button
                onClick={() => { onModeSelect(InteractionMode.CODE_REVIEW); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-dark-text hover:text-white hover:bg-dark-border rounded-lg transition-colors text-left"
              >
                <Code size={16} className="text-brand" />
                Code Review
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-dark-border space-y-3">
          {showApiKeyInput ? (
            <div className="bg-dark-bg p-3 rounded-lg border border-dark-border">
              <label className="text-xs text-dark-muted block mb-2">Enter Gemini API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-dark-surface border border-dark-border rounded px-2 py-1 text-sm text-white mb-2 focus:border-brand outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveApiKey}
                  className="flex-1 flex items-center justify-center gap-1 bg-brand hover:bg-brand-hover text-white text-xs py-1.5 rounded transition-colors"
                >
                  <Check size={14} /> Save
                </button>
                <button
                  onClick={() => setShowApiKeyInput(false)}
                  className="flex-1 flex items-center justify-center gap-1 bg-dark-surface hover:bg-dark-border text-dark-text text-xs py-1.5 rounded transition-colors border border-dark-border"
                >
                  <X size={14} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowApiKeyInput(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-dark-muted hover:text-white hover:bg-dark-border rounded-lg transition-colors border border-transparent"
            >
              <Key size={16} />
              {apiKey ? 'Change API Key' : 'Set API Key'}
            </button>
          )}
          <button
            onClick={() => { onClearChat(); setIsOpen(false); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors border border-transparent hover:border-red-400/20"
          >
            <Trash2 size={16} />
            Clear Conversation
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;