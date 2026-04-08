import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CanvasBoard } from '../components/canvas/CanvasBoard';
import { GlassNavbar } from '../components/layout/GlassNavbar';
import { Sidebar } from '../components/layout/Sidebar';
import { FloatingToolbar } from '../components/layout/FloatingToolbar';
import { useCanvasStore } from '../store/useCanvasStore';

export const Workspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { saveStatus, theme, loadProject, currentProjectTitle } = useCanvasStore();
  const [isIsolated, setIsIsolated] = useState(false);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (id) {
      loadProject(id);
      // Track rigorous visit timestamps for History dropdown
      const key = `canvas_visits_${id}`;
      const visits = JSON.parse(localStorage.getItem(key) || '[]');
      visits.unshift(new Date().toISOString());
      localStorage.setItem(key, JSON.stringify(visits.slice(0, 30)));
    }
  }, [id, loadProject]);

  return (
    <div className="w-screen h-screen overflow-hidden bg-transparent">
      {!isIsolated && <GlassNavbar />}
      {!isIsolated && <Sidebar />}
      
      <CanvasBoard />
      
      {!isIsolated && <FloatingToolbar />}
      
      {/* Visual Project Title */}
      {!isIsolated && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 glass-pill px-6 py-2 shadow-lg backdrop-blur-md font-bold" style={{ color: 'var(--text-main)' }}>
          {currentProjectTitle || 'Loading Workspace...'}
        </div>
      )}

      {/* Isolate Zen Mode Toggle */}
      <button 
        onClick={() => setIsIsolated(!isIsolated)}
        className="fixed z-[60] glass-pill px-5 py-2.5 font-black text-xs tracking-widest uppercase hover:scale-105 transition-all shadow-xl border flex items-center justify-center gap-2"
        style={{ 
          top: isIsolated ? '1.5rem' : '5.5rem', 
          right: '1.5rem', 
          color: 'var(--text-main)', 
          backgroundColor: 'var(--surface-high)',
          borderColor: 'var(--accent-primary)',
          color: 'var(--accent-primary)'
        }}
      >
        {isIsolated ? "<- Isolate!" : "Isolate! ->"}
      </button>

      {!isIsolated && (
        <div className="glass-pill fixed bottom-6 right-6 px-4 py-2 flex items-center gap-2 z-50 cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/dashboard')}>
          <div 
            className="w-2 h-2 rounded-full" 
            style={{ 
              backgroundColor: saveStatus === 'saving' ? '#eab308' : 'var(--accent-primary)',
              animation: saveStatus === 'saving' ? 'pulse 1s infinite' : 'none'
            }} 
          />
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            {saveStatus === 'saving' ? 'Saving...' : 'Saved'}
          </span>
        </div>
      )}
    </div>
  );
};
