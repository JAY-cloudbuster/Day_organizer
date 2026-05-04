import React, { useEffect, useState } from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { MousePointer2, Hand, MessageSquarePlus, ZoomIn, ZoomOut, Unlink, Trash2, Wand2 } from 'lucide-react';

export const ContextMenu = () => {
  const { zoom, setZoom, activeTool, setActiveTool, setConnectingFrom, connectingFrom, clearCanvas, organizeChaos } = useCanvasStore();
  const [pos, setPos] = useState(null);

  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      setPos({ x: e.clientX, y: e.clientY });
    };

    const handleClick = () => {
      if (pos) setPos(null);
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('click', handleClick);
    };
  }, [pos]);

  if (!pos) return null;

  const tools = [
    { id: 'select', icon: <MousePointer2 size={16} />, label: 'Select' },
    { id: 'pan', icon: <Hand size={16} />, label: 'Pan' },
    { id: 'comment', icon: <MessageSquarePlus size={16} />, label: 'Comment' },
    { id: 'zoomIn', icon: <ZoomIn size={16} />, label: 'Zoom In', action: () => setZoom(zoom * 1.1) },
    { id: 'zoomOut', icon: <ZoomOut size={16} />, label: 'Zoom Out', action: () => setZoom(zoom * 0.9) },
    { id: 'organize', icon: <Wand2 size={16} />, label: 'Organize', action: organizeChaos },
    { id: 'clear', icon: <Trash2 size={16} />, label: 'Clear', action: clearCanvas },
  ];

  return (
    <div 
      className="fixed z-[100] glass-panel p-2 rounded-2xl shadow-2xl flex flex-col gap-1 border border-white/10"
      style={{ left: pos.x, top: pos.y, backgroundColor: 'var(--surface-high)' }}
      onClick={(e) => e.stopPropagation()}
    >
      {tools.map(tool => (
        <button
          key={tool.id}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-black/10 dark:hover:bg-white/10"
          style={{ 
            color: activeTool === tool.id ? 'var(--accent-primary)' : 'var(--text-main)',
            backgroundColor: activeTool === tool.id ? 'rgba(0,0,0,0.05)' : 'transparent'
          }}
          onClick={() => {
            if (tool.action) {
              tool.action();
            } else {
              setActiveTool(tool.id);
              if (tool.id === 'select') setConnectingFrom(null);
            }
            setPos(null);
          }}
        >
          {tool.icon}
          <span className="font-semibold">{tool.label}</span>
        </button>
      ))}
      {connectingFrom && (
        <button 
          onClick={() => { setConnectingFrom(null); setPos(null); }} 
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10"
        >
          <Unlink size={16} />
          <span className="font-semibold">Cancel Connect</span>
        </button>
      )}
    </div>
  );
};
