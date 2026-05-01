import React from 'react';
import { useExecutionStore } from '../../store/useExecutionStore';
import { useCanvasStore } from '../../store/useCanvasStore';
import { Play, Pause, Square, FastForward } from 'lucide-react';

const formatTime = (totalSeconds) => {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export const ExecutionToolbar = () => {
  const { status, timeRemaining, start, pause, resume, stop, skip, activeElementId } = useExecutionStore();
  const { nodes, edges } = useCanvasStore();

  // Find the active element name/title
  let activeTitle = '';
  if (status !== 'idle' && status !== 'completed' && activeElementId) {
    const isNode = nodes.some(n => n.id === activeElementId);
    if (isNode) {
      const node = nodes.find(n => n.id === activeElementId);
      activeTitle = node.content.title || 'Task';
    } else {
      activeTitle = 'Break';
    }
  } else if (status === 'completed') {
    activeTitle = 'Workflow Completed!';
  } else {
    activeTitle = 'Ready to Start';
  }

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-4 p-2 pl-6 pr-4 rounded-full shadow-2xl border backdrop-blur-xl"
         style={{ backgroundColor: 'var(--surface-high)', borderColor: 'var(--ghost-border)', color: 'var(--text-main)' }}>
      
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--accent-primary)' }}>
          {status === 'running' ? 'Active' : status === 'paused' ? 'Paused' : 'Status'}
        </span>
        <span className="font-bold text-sm truncate max-w-[150px]">{activeTitle}</span>
      </div>

      <div className="w-px h-8 opacity-20 mx-2" style={{ backgroundColor: 'var(--text-muted)' }} />

      <div className="font-mono text-2xl font-black w-20 text-center tracking-tighter" style={{ color: status === 'running' ? 'var(--text-main)' : 'var(--text-muted)' }}>
        {status !== 'idle' ? formatTime(timeRemaining) : '00:00'}
      </div>

      <div className="w-px h-8 opacity-20 mx-2" style={{ backgroundColor: 'var(--text-muted)' }} />

      <div className="flex items-center gap-1">
        {status === 'idle' || status === 'completed' ? (
          <button onClick={start} className="w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg" style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}>
            <Play size={18} fill="currentColor" />
          </button>
        ) : status === 'running' ? (
          <button onClick={pause} className="w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 transition-transform bg-amber-500 shadow-lg text-white">
            <Pause size={18} fill="currentColor" />
          </button>
        ) : (
          <button onClick={resume} className="w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg" style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}>
            <Play size={18} fill="currentColor" />
          </button>
        )}

        {(status === 'running' || status === 'paused') && (
          <>
            <button onClick={skip} title="Skip to Next" className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors" style={{ color: 'var(--text-muted)' }}>
              <FastForward size={14} fill="currentColor" />
            </button>
            <button onClick={stop} title="Stop" className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-red-500">
              <Square size={14} fill="currentColor" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
