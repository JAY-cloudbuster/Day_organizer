import React, { useState, useEffect, useRef } from 'react';
import { useCanvasStore } from '../../../store/useCanvasStore';
import { TimeEstimateBadge } from './TimeEstimateBadge';
import { Play, Pause, RotateCcw } from 'lucide-react';
import clsx from 'clsx';

export const TimerNode = ({ node }) => {
  const updateNodeContent = useCanvasStore(state => state.updateNodeContent);
  const { title, initialTime = 25 * 60, timeRemaining, isRunning = false } = node.content;

  const currentRemaining = timeRemaining !== undefined ? timeRemaining : initialTime;
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRunning && currentRemaining > 0) {
      timerRef.current = setInterval(() => {
        updateNodeContent(node.id, { timeRemaining: currentRemaining - 1 });
      }, 1000);
    } else if (currentRemaining === 0 && isRunning) {
      updateNodeContent(node.id, { isRunning: false });
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, currentRemaining, node.id, updateNodeContent]);

  const toggleTimer = () => {
    updateNodeContent(node.id, { isRunning: !isRunning });
  };

  const resetTimer = () => {
    updateNodeContent(node.id, { isRunning: false, timeRemaining: initialTime });
  };

  const updateInitialTime = (minutes) => {
    const secs = Math.max(1, parseInt(minutes, 10)) * 60;
    updateNodeContent(node.id, { initialTime: secs, timeRemaining: secs, isRunning: false });
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const progress = (currentRemaining / initialTime) * 100;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="card w-[280px] overflow-hidden cursor-grab active:cursor-grabbing border-none flex flex-col bg-transparent backdrop-blur-xl" style={{ color: 'var(--text-main)', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
      <div className="p-3 border-b border-black/10 flex items-center justify-between" style={{ backgroundColor: 'var(--surface-high)' }}>
        <input 
          value={title}
          placeholder="Timer Name..."
          onChange={(e) => updateNodeContent(node.id, { title: e.target.value })}
          className="text-sm font-bold bg-transparent border-none outline-none w-32 pointer-events-auto"
        />
        <div className="flex items-center gap-1 pointer-events-auto">
          <input 
            type="number"
            value={initialTime / 60}
            onChange={(e) => updateInitialTime(e.target.value)}
            className="w-10 text-xs text-right bg-black/5 dark:bg-white/5 rounded border-none outline-none"
            min="1"
            max="120"
          />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>min</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-6 pointer-events-auto relative">
        <svg width="150" height="150" className="transform -rotate-90">
          <circle 
            cx="75" cy="75" r={radius} 
            stroke="var(--ghost-border)" strokeWidth="8" fill="none" 
          />
          <circle 
            cx="75" cy="75" r={radius} 
            stroke={currentRemaining < 60 ? "#ef4444" : "var(--accent-primary)"} 
            strokeWidth="8" 
            fill="none" 
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-black font-mono tracking-tighter" style={{ color: currentRemaining < 60 ? "#ef4444" : "var(--text-main)" }}>
            {formatTime(currentRemaining)}
          </span>
        </div>
      </div>

      <div className="p-3 flex justify-center gap-4 border-t pointer-events-auto" style={{ borderColor: 'var(--ghost-border)', backgroundColor: 'var(--surface-lowest)' }}>
        <button onClick={toggleTimer} className={clsx("p-3 rounded-full shadow-lg text-white transition-transform active:scale-95", isRunning ? "bg-amber-500 hover:bg-amber-600" : "bg-blue-500 hover:bg-blue-600")}>
          {isRunning ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
        </button>
        <button onClick={resetTimer} className="p-3 rounded-full shadow-md bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-transform active:scale-95 text-gray-700 dark:text-gray-300">
          <RotateCcw size={18} />
        </button>
      </div>
    </div>
  );
};
