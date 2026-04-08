import React from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { MousePointer2, Hand, MessageSquarePlus, ZoomIn, ZoomOut, Unlink } from 'lucide-react';
import clsx from 'clsx';

export const FloatingToolbar = () => {
  const { zoom, setZoom, activeTool, setActiveTool, setConnectingFrom, connectingFrom } = useCanvasStore();

  return (
    <div className="glass-pill fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center p-2 z-50">
      
      <ToolButton 
        icon={<MousePointer2 size={18} />} 
        active={activeTool === 'select'} 
        toast="Select/Drag"
        onClick={() => { setActiveTool('select'); setConnectingFrom(null); }} 
      />
      <ToolButton 
        icon={<Hand size={18} />} 
        active={activeTool === 'pan'} 
        toast="Pan Canvas"
        onClick={() => setActiveTool('pan')} 
      />
      <ToolButton 
        icon={<MessageSquarePlus size={18} />} 
        active={activeTool === 'comment'} 
        toast="Add Comment (Click Canvas)"
        onClick={() => setActiveTool('comment')} 
      />
      
      {connectingFrom && (
        <button onClick={() => setConnectingFrom(null)} className="ml-2 text-xs font-bold text-red-500 flex items-center bg-red-100 px-2 py-1 rounded-full"><Unlink size={12} className="mr-1"/> Cancel Connect</button>
      )}

      <div className="w-px h-6 mx-2" style={{ backgroundColor: 'var(--ghost-border)' }} />
      
      <button 
        className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-black/10 dark:hover:bg-white/10"
        style={{ color: 'var(--text-muted)' }}
        onClick={() => setZoom(zoom * 1.1)}
      >
        <ZoomIn size={18} />
      </button>
      
      <div className="px-2 font-bold text-xs" style={{ color: 'var(--text-main)' }}>
        {Math.round(zoom * 100)}%
      </div>
      
      <button 
        className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-black/10 dark:hover:bg-white/10"
        style={{ color: 'var(--text-muted)' }}
        onClick={() => setZoom(zoom * 0.9)}
      >
        <ZoomOut size={18} />
      </button>
    </div>
  );
};

const ToolButton = ({ icon, active, onClick, toast }) => (
  <button 
    onClick={onClick}
    title={toast}
    className={clsx(
      "w-10 h-10 rounded-full flex items-center justify-center transition-all",
      active ? "shadow-md transform scale-105" : "hover:bg-black/5 dark:hover:bg-white/10"
    )}
    style={{ 
      backgroundColor: active ? 'var(--accent-primary)' : 'transparent',
      color: active ? '#fff' : 'var(--text-muted)'
    }}
  >
    {icon}
  </button>
);
