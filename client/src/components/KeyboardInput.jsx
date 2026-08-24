import React, { useState } from 'react';
import { Keyboard, Send, Delete, CornerDownLeft, X } from 'lucide-react';

export default function KeyboardInput({ onSendText, onKeyPress, disabled }) {
  const [text, setText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending || disabled) return;

    setSending(true);
    await onSendText(text);
    setText('');
    setSending(false);
  };

  const handleBackspace = () => {
    onKeyPress('Backspace');
  };

  const handleEnter = () => {
    onKeyPress('Enter');
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 my-2 shadow-inner">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-purple-400 transition-colors"
        >
          <Keyboard className="w-4 h-4 text-purple-400" />
          <span>Roku Keyboard & Text Input</span>
        </button>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
          {isOpen ? 'Active' : 'Tap to expand'}
        </span>
      </div>

      {isOpen && (
        <div className="space-y-2 pt-1 animate-in fade-in duration-200">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={disabled || sending}
              placeholder="Type search terms or logins..."
              className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!text || sending || disabled}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-xl font-medium text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-purple-600/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>

          <div className="flex gap-2 justify-end pt-1">
            <button
              onClick={handleBackspace}
              disabled={disabled}
              className="remote-btn flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 rounded-lg text-xs text-slate-300"
            >
              <Delete className="w-3.5 h-3.5 text-red-400" />
              <span>Backspace</span>
            </button>
            <button
              onClick={handleEnter}
              disabled={disabled}
              className="remote-btn flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 rounded-lg text-xs text-slate-300"
            >
              <CornerDownLeft className="w-3.5 h-3.5 text-green-400" />
              <span>Enter</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
