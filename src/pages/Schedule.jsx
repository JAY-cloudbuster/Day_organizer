import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useScheduleStore, SCHEDULE_TEMPLATES } from '../store/useScheduleStore';
import { useCanvasStore } from '../store/useCanvasStore';
import { ArrowLeft, Moon, Sun, Clock, FileText, Copy, StopCircle, Play, X, Columns } from 'lucide-react';
import { ScheduleBoard } from '../components/schedule/ScheduleBoard';

export const Schedule = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useCanvasStore();
  const {
    loadSchedule,
    currentScheduleTitle,
    updateTitle,
    saveStatus,
    resetSchedule,
    blocks,
    applyTemplate,
    activeTimerBlockId,
    clearTimer,
    schedulesList,
    loadAllSchedules,
    loadComparisonSchedule,
    showComparison,
    closeComparison,
    comparisonBlocks,
    comparisonTitle
  } = useScheduleStore();

  const [showTemplates, setShowTemplates] = useState(false);
  const [showCompareMenu, setShowCompareMenu] = useState(false);

  // Focus Timer State
  const [timerSeconds, setTimerSeconds] = useState(0);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (id) {
      loadSchedule(id);
      loadAllSchedules();
    }
    return () => resetSchedule();
  }, [id, loadSchedule, resetSchedule, loadAllSchedules]);

  // Focus Timer Logic
  useEffect(() => {
    let interval = null;
    if (activeTimerBlockId) {
      setTimerSeconds(0);
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    } else {
      setTimerSeconds(0);
    }
    return () => clearInterval(interval);
  }, [activeTimerBlockId]);

  const activeTimerBlock = blocks.find(b => b.id === activeTimerBlockId);

  const formatTimer = (s) => {
    const m = Math.floor(s / 60);
    const secs = s % 60;
    return `${m}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const filledBlocks = blocks.filter(b => !b.hidden && b.text.trim().length > 0).length;
  const visibleBlocks = blocks.filter(b => !b.hidden).length;
  const progress = visibleBlocks > 0 ? (filledBlocks / visibleBlocks) * 100 : 0;
  const isComplete = filledBlocks === visibleBlocks && visibleBlocks > 0;

  return (
    <div className={`schedule-page ${showComparison ? 'schedule-page--comparing' : ''}`} style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Ambient Orbs */}
      <div className="schedule-orb schedule-orb--1" style={{ backgroundColor: 'var(--accent-primary)' }} />
      <div className="schedule-orb schedule-orb--2" style={{ backgroundColor: 'var(--accent-secondary)' }} />

      {/* Top Navbar */}
      <nav className="glass-panel schedule-topbar">
        <div className="schedule-topbar__left">
          <button className="schedule-topbar__back" onClick={() => navigate('/dashboard')} title="Back to Dashboard" style={{ color: 'var(--text-muted)' }}>
            <ArrowLeft size={20} />
          </button>
          <div className="schedule-topbar__divider" />
          <div className="schedule-topbar__brand">
            <div className="schedule-topbar__icon">
              <Clock size={16} />
            </div>
            <input
              className="schedule-topbar__title"
              value={currentScheduleTitle || ''}
              onChange={(e) => updateTitle(e.target.value)}
              placeholder="Loading Schedule..."
              style={{ color: 'var(--text-main)' }}
            />
          </div>
        </div>

        {/* Center: Celebration Progress */}
        <div className="schedule-topbar__center">
          <div className="sched-progress-wrapper" title={`${filledBlocks}/${visibleBlocks} Blocks Planned`}>
            <div className="sched-progress-bar" style={{ width: `${progress}%`, backgroundColor: isComplete ? '#22c55e' : 'var(--accent-primary)' }} />
            {isComplete && <div className="sched-progress-confetti">🎉 Fully Planned! 🔒</div>}
          </div>
        </div>

        <div className="schedule-topbar__right relative">
          {/* Templates Menu */}
          <div className="relative">
            <button className="schedule-topbar__btn" onClick={() => setShowTemplates(!showTemplates)} title="Templates" style={{ color: 'var(--text-muted)' }}>
              <FileText size={18} />
            </button>
            {showTemplates && (
              <div className="sched-dropdown glass-panel">
                <div className="sched-dropdown__header" style={{ color: 'var(--text-muted)' }}>Quick Templates</div>
                {SCHEDULE_TEMPLATES.map(tpl => (
                  <button key={tpl.id} className="sched-dropdown__item" onClick={() => { applyTemplate(tpl.data); setShowTemplates(false); }}>
                    <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{tpl.name}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{tpl.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Compare Menu */}
          <div className="relative">
            <button className="schedule-topbar__btn" onClick={() => setShowCompareMenu(!showCompareMenu)} title="Compare" style={{ color: 'var(--text-muted)' }}>
              <Columns size={18} />
            </button>
            {showCompareMenu && (
              <div className="sched-dropdown glass-panel">
                <div className="sched-dropdown__header" style={{ color: 'var(--text-muted)' }}>Compare With...</div>
                {schedulesList.filter(s => s.id !== id).map(s => (
                  <button key={s.id} className="sched-dropdown__item" onClick={() => { loadComparisonSchedule(s.id); setShowCompareMenu(false); }}>
                    <span style={{ color: 'var(--text-main)' }}>{s.title}</span>
                  </button>
                ))}
                {schedulesList.filter(s => s.id !== id).length === 0 && (
                  <div style={{ padding: '8px 12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>No other schedules found.</div>
                )}
              </div>
            )}
          </div>

          <div className="schedule-topbar__save">
            <div className="schedule-topbar__save-dot" style={{ backgroundColor: saveStatus === 'saving' ? '#eab308' : 'var(--accent-primary)', animation: saveStatus === 'saving' ? 'pulse 1s infinite' : 'none' }} />
            <span className="schedule-topbar__save-text" style={{ color: 'var(--text-muted)' }}>{saveStatus === 'saving' ? 'Saving...' : 'Saved'}</span>
          </div>

          <div className="schedule-topbar__divider" />
          <button className="schedule-topbar__theme" onClick={toggleTheme} title="Toggle Theme" style={{ color: 'var(--text-muted)' }}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="schedule-content">
        {/* Left: Main Schedule */}
        <div className="schedule-main-pane">
          <ScheduleBoard isCompare={false} />
        </div>

        {/* Right: Comparison Pane */}
        {showComparison && (
          <div className="schedule-compare-pane">
            <div className="schedule-compare-header glass-panel">
              <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{comparisonTitle}</span>
              <button onClick={closeComparison} style={{ color: 'var(--text-muted)' }}><X size={16} /></button>
            </div>
            {/* Minimal read-only board for comparison */}
            <div className="schedule-board-wrapper" style={{ margin: 0, border: 'none', borderRadius: 0, borderLeft: '1px solid var(--ghost-border)' }}>
              <div className="schedule-board" style={{ minWidth: '100%', minHeight: '100%' }}>
                <div className="schedule-board__grid" style={{ minWidth: '100%', minHeight: '100%' }} />
                {comparisonBlocks.filter(b => !b.hidden).map(b => (
                   <div key={b.id} className="sched-block sched-block--readonly" style={{ left: b.x, top: b.y, backgroundColor: b.color || 'var(--surface-lowest)', minHeight: `${130 + ((b.spanHours||1) - 1) * 56}px` }}>
                     <div className="sched-block__badge" style={{ backgroundColor: 'var(--accent-primary)' }}>{b.hour < 10 ? `0${b.hour}` : b.hour}</div>
                     <div className="sched-block__header" style={{ paddingLeft: '12px', cursor: 'default' }}>
                       <span className="sched-block__label" style={{ color: 'var(--text-main)' }}>{b.label} {b.spanHours > 1 && <span className="sched-block__span-pill">{b.spanHours}h</span>}</span>
                     </div>
                     <div className="sched-block__body">
                       <div style={{ color: 'var(--text-main)', fontSize: '0.82rem', padding: '8px', opacity: 0.8 }}>{b.text || 'Empty'}</div>
                     </div>
                   </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Focus Timer Widget */}
      {activeTimerBlockId && activeTimerBlock && (
        <div className="sched-timer-widget glass-panel">
          <div className="sched-timer__info">
            <div className="sched-timer__label" style={{ color: 'var(--text-muted)' }}>Focusing on:</div>
            <div className="sched-timer__task" style={{ color: 'var(--text-main)' }}>{activeTimerBlock.text || 'Untitled Block'}</div>
          </div>
          <div className="sched-timer__time" style={{ color: 'var(--accent-primary)' }}>
            {formatTimer(timerSeconds)}
          </div>
          <button className="sched-timer__stop" onClick={clearTimer}>
            <StopCircle size={24} color="#ef4444" />
          </button>
        </div>
      )}
    </div>
  );
};
