import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useScheduleStore, SCHEDULE_TEMPLATES } from '../store/useScheduleStore';
import { useCanvasStore } from '../store/useCanvasStore';
import { ArrowLeft, Clock, FileText, StopCircle, X, LayoutGrid } from 'lucide-react';
import { ScheduleBoard } from '../components/schedule/ScheduleBoard';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4';

export const Schedule = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useCanvasStore();
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
  const [timerSeconds, setTimerSeconds] = useState(0);

  useEffect(() => {
    document.body.setAttribute('data-theme', 'dark');
  }, []);

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
    <div className="landing-page">
      {/* ── Background Video ── */}
      <video className="landing-video-bg" src={VIDEO_URL} autoPlay loop muted playsInline />
      <div className="landing-blur-overlay" />

      {/* ── Schedule Wrapper ── */}
      <div className={`sched-cinematic ${showComparison ? 'sched-cinematic--comparing' : ''}`}>

        {/* ── Top Navbar ── */}
        <nav className="sched-cinematic__topbar liquid-glass">
          <div className="sched-cinematic__left">
            <button className="sched-cinematic__back" onClick={() => navigate('/dashboard')} title="Back">
              <ArrowLeft size={20} />
            </button>
            <div className="sched-cinematic__divider" />
            <div className="sched-cinematic__brand">
              <div className="sched-cinematic__icon"><Clock size={16} /></div>
              <input
                className="sched-cinematic__title-input"
                value={currentScheduleTitle || ''}
                onChange={(e) => updateTitle(e.target.value)}
                placeholder="Loading Schedule..."
              />
            </div>
          </div>

          {/* Center: Progress */}
          <div className="sched-cinematic__center">
            <div className="sched-cinematic__progress" title={`${filledBlocks}/${visibleBlocks} Blocks Planned`}>
              <div className="sched-cinematic__progress-bar" style={{ width: `${progress}%`, backgroundColor: isComplete ? '#22c55e' : 'rgba(255,255,255,0.6)' }} />
              {isComplete && <div className="sched-cinematic__confetti">🎉 Fully Planned!</div>}
            </div>
          </div>

          <div className="sched-cinematic__right">
            {/* Templates */}
            <div className="sched-cinematic__dropdown-wrap">
              <button className="sched-cinematic__btn" onClick={() => setShowTemplates(!showTemplates)} title="Templates">
                <FileText size={18} />
              </button>
              {showTemplates && (
                <div className="sched-cinematic__dropdown liquid-glass">
                  <div className="sched-cinematic__dropdown-header">Quick Templates</div>
                  {SCHEDULE_TEMPLATES.map(tpl => (
                    <button key={tpl.id} className="sched-cinematic__dropdown-item" onClick={() => { applyTemplate(tpl.data); setShowTemplates(false); }}>
                      <span className="sched-cinematic__dropdown-name">{tpl.name}</span>
                      <span className="sched-cinematic__dropdown-desc">{tpl.desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Compare */}
            <div className="sched-cinematic__dropdown-wrap">
              <button className="sched-cinematic__btn" onClick={() => setShowCompareMenu(!showCompareMenu)} title="Compare">
                <LayoutGrid size={18} />
              </button>
              {showCompareMenu && (
                <div className="sched-cinematic__dropdown liquid-glass">
                  <div className="sched-cinematic__dropdown-header">Compare With...</div>
                  {schedulesList.filter(s => s.id !== id).map(s => (
                    <button key={s.id} className="sched-cinematic__dropdown-item" onClick={() => { loadComparisonSchedule(s.id); setShowCompareMenu(false); }}>
                      <span className="sched-cinematic__dropdown-name">{s.title}</span>
                    </button>
                  ))}
                  {schedulesList.filter(s => s.id !== id).length === 0 && (
                    <div className="sched-cinematic__dropdown-empty">No other schedules found.</div>
                  )}
                </div>
              )}
            </div>

            {/* Save Indicator */}
            <div className="sched-cinematic__save">
              <div className="sched-cinematic__save-dot" style={{ backgroundColor: saveStatus === 'saving' ? '#eab308' : '#22c55e', animation: saveStatus === 'saving' ? 'pulse 1s infinite' : 'none' }} />
              <span className="sched-cinematic__save-text">{saveStatus === 'saving' ? 'Saving...' : 'Saved'}</span>
            </div>
          </div>
        </nav>

        {/* ── Content ── */}
        <div className="sched-cinematic__content">
          <div className="sched-cinematic__main">
            <ScheduleBoard isCompare={false} />
          </div>

          {showComparison && (
            <div className="sched-cinematic__compare">
              <div className="sched-cinematic__compare-header liquid-glass">
                <span>{comparisonTitle}</span>
                <button onClick={closeComparison}><X size={16} /></button>
              </div>
              <div className="schedule-board-wrapper" style={{ margin: 0, border: 'none', borderRadius: 0, borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
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
          <div className="sched-cinematic__timer liquid-glass">
            <div className="sched-cinematic__timer-info">
              <div className="sched-cinematic__timer-label">Focusing on:</div>
              <div className="sched-cinematic__timer-task">{activeTimerBlock.text || 'Untitled Block'}</div>
            </div>
            <div className="sched-cinematic__timer-time">{formatTimer(timerSeconds)}</div>
            <button className="sched-cinematic__timer-stop" onClick={clearTimer}>
              <StopCircle size={24} color="#ef4444" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
