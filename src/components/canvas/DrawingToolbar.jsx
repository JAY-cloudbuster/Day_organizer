import React from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { Undo2, Redo2, Type, Pencil, PenTool, Highlighter, Eraser, Pointer, Sparkles, X } from 'lucide-react';
import clsx from 'clsx';

export const DrawingToolbar = () => {
  const { 
    activeTool, drawTool, setDrawTool, 
    drawColor, setDrawColor, 
    undo, redo, historyIndex, drawHistory 
  } = useCanvasStore();

  if (activeTool !== 'draw') return null;

  const tools = [
    { id: 'text', icon: <Type size={18} />, label: 'Text' },
    { id: 'pencil', icon: <Pencil size={18} />, label: 'Pencil' },
    { id: 'pen', icon: <PenTool size={18} />, label: 'Fine Pen' },
    { id: 'highlighter', icon: <Highlighter size={18} />, label: 'Highlighter' },
    { id: 'eraser', icon: <Eraser size={18} />, label: 'Eraser' },
    { id: 'laser', icon: <Pointer size={18} />, label: 'Laser' }
  ];

  const standardColors = ['#000000', '#ffffff', '#3b82f6', '#22c55e', '#eab308', '#ef4444'];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-4 p-3 glass-pill animate-in slide-in-from-bottom-8">
      
      {/* Undo/Redo */}
      <div className="flex items-center gap-1">
        <button 
          onClick={undo}
          disabled={historyIndex < 0}
          className="p-3 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors disabled:opacity-30"
          style={{ color: 'var(--text-main)' }}
        >
          <Undo2 size={16} />
        </button>
        <button 
          onClick={redo}
          disabled={historyIndex >= drawHistory.length - 1}
          className="p-3 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors disabled:opacity-30"
          style={{ color: 'var(--text-main)' }}
        >
          <Redo2 size={16} />
        </button>
      </div>

      <div className="w-px h-8 bg-black/10 dark:bg-white/10" />

      {/* Tools */}
      <div className="flex items-center gap-2">
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => setDrawTool(tool.id)}
            className={clsx(
              "relative p-3 rounded-2xl transition-all duration-300",
              drawTool === tool.id ? "bg-black/10 dark:bg-white/10 scale-110 shadow-inner" : "hover:bg-black/5 dark:hover:bg-white/5"
            )}
            title={tool.label}
            style={{ color: drawTool === tool.id ? (drawTool === 'eraser' ? '#ef4444' : 'var(--text-main)') : 'var(--text-muted)' }}
          >
            {tool.icon}
            {drawTool === tool.id && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-current" />}
          </button>
        ))}
      </div>

      <div className="w-px h-8 bg-black/10 dark:bg-white/10" />

      {/* Colors */}
      <div className="flex items-center gap-2 px-2">
        {standardColors.map(color => (
          <button
            key={color}
            onClick={() => setDrawColor(color)}
            className={clsx(
              "w-6 h-6 rounded-full transition-transform",
              drawColor === color ? "scale-125 ring-2 ring-offset-2 ring-blue-500 shadow-lg" : "hover:scale-110 shadow-sm",
              color === '#000000' && "dark:ring-offset-gray-900",
              color === '#ffffff' && "ring-offset-white"
            )}
            style={{ backgroundColor: color, border: color === '#ffffff' ? '1px solid #e5e7eb' : 'none' }}
          />
        ))}
        <div className="relative">
          <input 
            type="color" 
            value={drawColor}
            onChange={(e) => setDrawColor(e.target.value)}
            className="w-6 h-6 rounded-full opacity-0 absolute inset-0 cursor-pointer"
          />
          <div 
            className="w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-tr from-purple-500 via-pink-500 to-yellow-500 shadow-sm"
          >
            <Sparkles size={10} color="white" />
          </div>
        </div>
      </div>
    </div>
  );
};
