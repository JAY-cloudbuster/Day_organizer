import React, { useState, useEffect } from 'react';
import { useModalStore } from '../../store/useModalStore';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export const GlobalModal = () => {
  const { isOpen, title, message, type, defaultValue, placeholder, onConfirm, onCancel, closeModal } = useModalStore();
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      setInputValue(defaultValue || '');
    }
  }, [isOpen, defaultValue]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) onConfirm(type === 'input' ? inputValue : true);
    closeModal();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    closeModal();
  };

  const icons = {
    warning: <AlertTriangle size={24} className="text-amber-500" />,
    input: <Info size={24} className="text-blue-500" />,
    confirm: <CheckCircle2 size={24} className="text-green-500" />,
    info: <Info size={24} className="text-blue-500" />
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
      <div 
        className="glass-panel w-full max-w-md p-6 rounded-2xl shadow-2xl flex flex-col gap-4 transform scale-100 transition-transform"
        style={{ backgroundColor: 'var(--surface-high)', borderColor: 'var(--ghost-border)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icons[type]}
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>{title}</h2>
          </div>
          <button onClick={handleCancel} className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
            <X size={18} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
        
        {message && (
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {message}
          </p>
        )}

        {type === 'input' && (
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
            autoFocus
            className="w-full mt-2 p-3 rounded-lg border outline-none focus:ring-2 focus:ring-blue-500/50 bg-black/5 dark:bg-white/5 transition-all text-sm"
            style={{ color: 'var(--text-main)', borderColor: 'var(--ghost-border)' }}
          />
        )}

        <div className="flex justify-end gap-3 mt-4">
          {(type === 'confirm' || type === 'input' || type === 'warning') && (
            <button 
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: 'var(--text-muted)' }}
            >
              Cancel
            </button>
          )}
          <button 
            onClick={handleConfirm}
            className="px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-transform active:scale-95"
            style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
          >
            {type === 'info' ? 'Got it' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};
