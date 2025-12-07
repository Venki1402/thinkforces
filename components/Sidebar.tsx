import React from 'react';
import { Trash2, BookOpen, Search, Code, BrainCircuit } from 'lucide-react';
import { InteractionMode } from '../types';

interface SidebarProps {
  onClearChat: () => void;
  onModeSelect: (mode: InteractionMode) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClearChat, onModeSelect, isOpen, setIsOpen }) => {
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
      <div className={`fixed inset-y-0 left-0 w-72 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 z-50 flex flex-col ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 md:static`}>
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3 text-indigo-400 mb-2">
            <BrainCircuit size={28} />
            <h1 className="text-xl font-bold tracking-tight text-white">CodeSensei</h1>
          </div>
          <p className="text-xs text-slate-400">Gemini 3 Pro Powered Tutor</p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-8">
          
          {/* Modes */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
              Quick Actions
            </h3>
            <div className="space-y-1">
              <button 
                onClick={() => { onModeSelect(InteractionMode.PROBLEM_SOLVING); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-left"
              >
                <Search size={16} className="text-blue-400" />
                Problem Solving
              </button>
              <button 
                onClick={() => { onModeSelect(InteractionMode.EDITORIAL); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-left"
              >
                <BookOpen size={16} className="text-emerald-400" />
                Editorial Explainer
              </button>
              <button 
                onClick={() => { onModeSelect(InteractionMode.CODE_REVIEW); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-left"
              >
                <Code size={16} className="text-purple-400" />
                Code Review
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800">
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