import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CanvasBoard } from '../components/canvas/CanvasBoard';
import { GlassNavbar } from '../components/layout/GlassNavbar';
import { Sidebar } from '../components/layout/Sidebar';
import { ContextMenu } from '../components/canvas/ContextMenu';
import { Minimap } from '../components/canvas/Minimap';
import { GlobalModal } from '../components/layout/GlobalModal';
import { useCanvasStore } from '../store/useCanvasStore';
import { useExecutionStore } from '../store/useExecutionStore';
import { Minimize } from 'lucide-react';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4';

export const Workspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme, loadProject, currentProjectTitle, isIsolated, setIsIsolated } = useCanvasStore();
  const { status } = useExecutionStore();

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);

    const handleMouseMove = (e) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [theme]);

  useEffect(() => {
    if (id) {
      loadProject(id);
      const key = `canvas_visits_${id}`;
      const visits = JSON.parse(localStorage.getItem(key) || '[]');
      visits.unshift(new Date().toISOString());
      localStorage.setItem(key, JSON.stringify(visits.slice(0, 30)));
    }
  }, [id, loadProject]);

  return (
    <div className="workspace-cinematic">
      {/* ── Background Video (dimmed for canvas readability) ── */}
      <video
        className="workspace-cinematic__video"
        src={VIDEO_URL}
        autoPlay
        loop
        muted
        playsInline
      />
      <div className={`mesh-background ${status === 'running' ? 'running' : ''}`} />

      {/* ── Canvas Layer ── */}
      <div className="workspace-cinematic__content">
        <GlobalModal />
        {!isIsolated && <GlassNavbar />}
        <Sidebar />

        <CanvasBoard />

        {!isIsolated && <ContextMenu />}
        {!isIsolated && <Minimap />}

        {isIsolated && (
          <button
            onClick={() => setIsIsolated(false)}
            className="fixed top-6 right-6 z-50 p-3 rounded-full glass-panel shadow-2xl transition-all hover:scale-105 active:scale-95"
            title="Exit Full Screen"
            style={{ 
              color: 'var(--text-main)', 
              borderColor: 'var(--ghost-border)', 
              backgroundColor: 'var(--surface-high)' 
            }}
          >
            <Minimize size={20} />
          </button>
        )}
      </div>
    </div>
  );
};
