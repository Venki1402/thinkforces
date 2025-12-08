import React, { useState, useRef, KeyboardEvent } from 'react';
import { Send, Paperclip, X, Image as ImageIcon } from 'lucide-react';
import { Attachment } from '../types';

interface InputAreaProps {
  onSend: (text: string, attachments: Attachment[]) => void;
  isLoading: boolean;
  disabled: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSend, isLoading, disabled }) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if ((!text.trim() && attachments.length === 0) || isLoading || disabled) return;
    onSend(text, attachments);
    setText('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files: File[] = Array.from(e.target.files);

      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setAttachments(prev => [...prev, {
              mimeType: file.type,
              data: reader.result as string
            }]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
    setText(target.value);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Attachment Preview */}
      {attachments.length > 0 && (
        <div className="flex gap-3 mb-3 overflow-x-auto pb-2 px-1">
          {attachments.map((att, idx) => (
            <div key={idx} className="relative group shrink-0">
              {att.mimeType.startsWith('image/') ? (
                <div className="w-16 h-16 rounded-lg overflow-hidden border border-dark-border">
                  <img src={att.data} alt="preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg bg-dark-surface border border-dark-border flex items-center justify-center">
                  <span className="text-xs text-dark-muted">FILE</span>
                </div>
              )}
              <button
                onClick={() => removeAttachment(idx)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-sm hover:bg-red-600 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className={`relative flex items-end gap-2 bg-dark-surface p-3 rounded-2xl border transition-colors ${disabled ? 'border-dark-border opacity-50' : 'border-dark-border focus-within:border-brand'
        }`}>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isLoading}
          className="p-2 text-dark-muted hover:text-brand transition-colors rounded-lg hover:bg-dark-border"
          title="Attach image or code"
        >
          <Paperclip size={20} />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
          multiple
        />

        <textarea
          ref={textareaRef}
          value={text}
          onChange={autoResize}
          onKeyDown={handleKeyDown}
          disabled={disabled || isLoading}
          placeholder={disabled ? "Connecting..." : "Describe your problem, paste code, or upload an image..."}
          className="flex-1 bg-transparent text-dark-text placeholder-dark-muted text-sm md:text-base resize-none outline-none max-h-[200px] py-2"
          rows={1}
        />

        <button
          onClick={handleSend}
          disabled={(!text.trim() && attachments.length === 0) || isLoading || disabled}
          className={`p-2 rounded-lg transition-all ${(!text.trim() && attachments.length === 0) || isLoading || disabled
            ? 'bg-dark-border text-dark-muted cursor-not-allowed'
            : 'bg-brand text-white hover:bg-brand-hover shadow-lg shadow-brand/20'
            }`}
        >
          <Send size={20} />
        </button>
      </div>
      <div className="text-center mt-2">
        <p className="text-xs text-dark-muted">
          ThinkForces may produce inaccurate information. Verify code before execution.
        </p>
      </div>
    </div>
  );
};

export default InputArea;