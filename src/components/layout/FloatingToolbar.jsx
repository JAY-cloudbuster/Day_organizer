import React, { useState, useEffect, useRef } from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { useExecutionStore } from '../../store/useExecutionStore';
import { MousePointer2, Hand, MessageSquarePlus, ZoomIn, ZoomOut, Unlink, Play, Pause, Square, FastForward, Timer, Trash2, Volume2, VolumeX } from 'lucide-react';
import clsx from 'clsx';

const formatTime = (totalSeconds) => {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export const FloatingToolbar = () => {
  const { zoom, setZoom, activeTool, setActiveTool, setConnectingFrom, connectingFrom, nodes, edges, clearCanvas } = useCanvasStore();
  const { status, timeRemaining, start, pause, resume, stop, skip, activeElementId } = useExecutionStore();

  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioCtxRef = useRef(null);
  const noiseNodeRef = useRef(null);

  const isActive = status === 'running' || status === 'paused';
  const isRunning = status === 'running';

  useEffect(() => {
    if (audioEnabled && isRunning) {
      if (!audioCtxRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioContext();
        const bufferSize = audioCtxRef.current.sampleRate * 2;
        const buffer = audioCtxRef.current.createBuffer(1, bufferSize, audioCtxRef.current.sampleRate);
        const output = buffer.getChannelData(0);
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5; 
        }
        noiseNodeRef.current = audioCtxRef.current.createBufferSource();
        noiseNodeRef.current.buffer = buffer;
        noiseNodeRef.current.loop = true;
        
        const filter = audioCtxRef.current.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400; // Deep spatial focus rumble
        
        noiseNodeRef.current.connect(filter);
        filter.connect(audioCtxRef.current.destination);
        noiseNodeRef.current.start();
      }
    } else {
      if (noiseNodeRef.current) {
        noiseNodeRef.current.stop();
        noiseNodeRef.current.disconnect();
        noiseNodeRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    }
  }, [audioEnabled, isRunning]);

  // Derive active task title
  let activeTitle = '';
  if (status !== 'idle' && status !== 'completed' && activeElementId) {
    const isNode = nodes.some(n => n.id === activeElementId);
    if (isNode) {
      const node = nodes.find(n => n.id === activeElementId);
      activeTitle = node?.content?.title || 'Task';
    } else {
      activeTitle = 'Break';
    }
  } else if (status === 'completed') {
    activeTitle = 'Done!';
  }

  return (
    <div className="glass-pill fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center p-2 z-50"
         style={{ gap: '2px' }}>
      
      {/* ── Tool Section ── */}
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
      
      {/* ── Zoom Section ── */}
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

      <div className="w-px h-6 mx-2" style={{ backgroundColor: 'var(--ghost-border)' }} />

      {/* ── Clear Canvas ── */}
      <button 
        className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-red-500/20 text-red-500"
        title="Clear Canvas"
        onClick={clearCanvas}
      >
        <Trash2 size={16} />
      </button>

      <div className="w-px h-6 mx-2" style={{ backgroundColor: 'var(--ghost-border)' }} />

      {/* ── Execution Section (integrated into dock) ── */}
      {isActive && (
        <>
          {/* Active task label */}
          <div className="flex flex-col items-start px-2" style={{ maxWidth: '120px' }}>
            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: isRunning ? '#22c55e' : '#eab308' }}>
              {isRunning ? 'Running' : 'Paused'}
            </span>
            <span className="text-[11px] font-bold truncate w-full" style={{ color: 'var(--text-main)' }}>
              {activeTitle}
            </span>
          </div>

          {/* Countdown timer */}
          <div 
            className="font-mono text-lg font-black tracking-tighter px-2 tabular-nums"
            style={{ color: isRunning ? 'var(--text-main)' : 'var(--text-muted)', minWidth: '52px', textAlign: 'center' }}
          >
            {formatTime(timeRemaining)}
          </div>

          <div className="w-px h-6 mx-1" style={{ backgroundColor: 'var(--ghost-border)' }} />
        </>
      )}

      {/* Play/Pause/Resume button — always visible */}
      {status === 'idle' || status === 'completed' ? (
        <button 
          onClick={start} 
          title="Start Workflow"
          className="w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-md"
          style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
        >
          <Play size={16} fill="currentColor" />
        </button>
      ) : isRunning ? (
        <button 
          onClick={pause} 
          title="Pause"
          className="w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-md bg-amber-500 text-white"
        >
          <Pause size={16} fill="currentColor" />
        </button>
      ) : (
        <button 
          onClick={resume} 
          title="Resume"
          className="w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-md"
          style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
        >
          <Play size={16} fill="currentColor" />
        </button>
      )}

      {/* Skip & Stop — only when active */}
      {isActive && (
        <>
          <button 
            onClick={() => setAudioEnabled(!audioEnabled)} 
            title="Toggle Focus Audio" 
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors" 
            style={{ color: audioEnabled ? 'var(--accent-primary)' : 'var(--text-muted)' }}
          >
            {audioEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
          <button 
            onClick={skip} 
            title="Skip to Next" 
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors" 
            style={{ color: 'var(--text-muted)' }}
          >
            <FastForward size={14} fill="currentColor" />
          </button>
          <button 
            onClick={stop} 
            title="Stop" 
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-500/20 transition-colors text-red-500"
          >
            <Square size={14} fill="currentColor" />
          </button>
        </>
      )}
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
