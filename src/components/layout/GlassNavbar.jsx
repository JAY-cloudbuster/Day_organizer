import React, { useState } from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { useExecutionStore } from '../../store/useExecutionStore';
import { Moon, Sun, History, Share2, Loader2, Play, Pause, Square, FastForward, Maximize, Minimize, Volume2, VolumeX } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toPng } from 'html-to-image';
import { toggleBrownNoise } from '../../utils/haptics';
import clsx from 'clsx';

const formatTime = (totalSeconds) => {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export const GlassNavbar = () => {
  const { id } = useParams();
  const { theme, toggleTheme, currentProjectTitle, saveStatus, isIsolated, setIsIsolated } = useCanvasStore();
  const { status, timeRemaining, start, pause, resume, stop, skip, activeElementId } = useExecutionStore();
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const isRunning = status === 'running';
  const isActive = status !== 'idle' && status !== 'completed';

  React.useEffect(() => {
    toggleBrownNoise(audioEnabled && isRunning);
  }, [audioEnabled, isRunning]);

  const handleShare = async () => {
    setIsExporting(true);
    try {
      const element = document.querySelector('.canvas-viewport');
      if (!element) throw new Error("Viewport not found");
      
      const dataUrl = await toPng(element, { 
        backgroundColor: theme === 'dark' ? '#09090b' : '#ffffff',
        pixelRatio: 2
      });
      
      const link = document.createElement('a');
      link.download = `canvas-${currentProjectTitle || id}.png`;
      link.href = dataUrl;
      link.click();
    } catch(err) {
      console.error(err);
      alert('Failed to generate Canvas export.');
    } finally {
      setIsExporting(false);
    }
  };

  const isRunning = status === 'running';
  const isActive = status !== 'idle' && status !== 'completed';

  return (
    <nav className={clsx(
      "glass-panel fixed top-4 left-1/2 -translate-x-1/2 h-14 px-4 flex items-center gap-4 z-50 rounded-full transition-all duration-500 overflow-hidden group shadow-2xl border",
      isActive ? "w-[400px]" : "w-[120px] hover:w-[450px]"
    )} style={{ borderColor: 'var(--ghost-border)', backgroundColor: 'var(--surface-high)' }}>
      
      {/* ── Save Status Dot (Always visible) ── */}
      <div 
        className="w-3 h-3 rounded-full shrink-0 shadow-sm"
        style={{
          backgroundColor: saveStatus === 'saving' ? '#eab308' : '#22c55e',
          animation: saveStatus === 'saving' ? 'pulse 1s infinite' : 'none',
        }}
        title={saveStatus === 'saving' ? 'Saving...' : 'Saved'}
      />

      {/* ── Timer / Title (Always visible if active, otherwise visible on hover) ── */}
      <div className={clsx(
        "flex items-center gap-3 whitespace-nowrap overflow-hidden transition-opacity duration-300",
        !isActive && "opacity-0 group-hover:opacity-100"
      )}>
        {isActive ? (
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-black tracking-tighter" style={{ color: isRunning ? 'var(--text-main)' : 'var(--text-muted)' }}>
              {formatTime(timeRemaining)}
            </span>
            <div className="w-px h-4 bg-gray-500/30" />
            
            <button onClick={isRunning ? pause : resume} className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10" style={{ color: 'var(--text-main)' }}>
              {isRunning ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button onClick={skip} className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10" style={{ color: 'var(--text-main)' }}>
              <FastForward size={14} />
            </button>
            <button onClick={stop} className="p-1 rounded hover:bg-red-500/20 text-red-500">
              <Square size={14} />
            </button>
          </div>
        ) : (
          <span className="font-bold text-sm" style={{ color: 'var(--text-main)' }}>
            {currentProjectTitle || "Workspace"}
          </span>
        )}
      </div>

      {/* ── Actions (Visible on hover) ── */}
      <div className="flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300 shrink-0">
        {!isActive && (
          <button onClick={start} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors" title="Start Timer" style={{ color: 'var(--accent-primary)' }}>
            <Play size={16} />
          </button>
        )}
        <button onClick={handleShare} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors" title="Export Image" style={{ color: 'var(--text-muted)' }}>
          {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />}
        </button>
        <button onClick={() => setAudioEnabled(!audioEnabled)} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors" title="Focus Audio" style={{ color: audioEnabled ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
          {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors" title="Toggle Theme" style={{ color: 'var(--text-muted)' }}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button onClick={() => setIsIsolated(!isIsolated)} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors" title="Zen Mode" style={{ color: 'var(--text-muted)' }}>
          {isIsolated ? <Minimize size={16} /> : <Maximize size={16} />}
        </button>
      </div>

    </nav>
  );
};
