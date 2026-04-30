import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useScheduleStore } from '../../store/useScheduleStore';
import { GripVertical, Palette, Check, Merge, Scissors, Play } from 'lucide-react';

const BLOCK_COLORS = [
  { label: 'Default', value: '' },
  { label: 'Sky', value: 'rgba(56, 189, 248, 0.18)' },
  { label: 'Emerald', value: 'rgba(52, 211, 153, 0.18)' },
  { label: 'Amber', value: 'rgba(251, 191, 36, 0.18)' },
  { label: 'Rose', value: 'rgba(251, 113, 133, 0.18)' },
  { label: 'Violet', value: 'rgba(167, 139, 250, 0.18)' },
  { label: 'Cyan', value: 'rgba(34, 211, 238, 0.18)' },
  { label: 'Lime', value: 'rgba(163, 230, 53, 0.18)' },
  { label: 'Orange', value: 'rgba(251, 146, 60, 0.18)' },
  { label: 'Fuchsia', value: 'rgba(232, 121, 249, 0.18)' },
];

export const ScheduleBlock = ({ block }) => {
  const updateBlockText = useScheduleStore(s => s.updateBlockText);
  const updateBlockColor = useScheduleStore(s => s.updateBlockColor);
  const updateBlockPosition = useScheduleStore(s => s.updateBlockPosition);
  const mergeBlockForward = useScheduleStore(s => s.mergeBlockForward);
  const splitBlock = useScheduleStore(s => s.splitBlock);
  const setActiveTimer = useScheduleStore(s => s.setActiveTimer);
  const activeTimerBlockId = useScheduleStore(s => s.activeTimerBlockId);

  const [showColors, setShowColors] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const startRef = useRef({ x: 0, y: 0, bx: 0, by: 0 });

  // If hidden, don't render
  if (block.hidden) return null;

  // Live Hour Pulse — update every minute
  useEffect(() => {
    const update = () => setCurrentHour(new Date().getHours());
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  const spanHours = block.spanHours || 1;
  const isNow = currentHour >= block.hour && currentHour < block.hour + spanHours;
  const isTimerActive = activeTimerBlockId === block.id;

  const onPointerDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    startRef.current = { x: e.clientX, y: e.clientY, bx: block.x, by: block.y };

    const onMove = (ev) => {
      updateBlockPosition(block.id,
        Math.max(0, startRef.current.bx + ev.clientX - startRef.current.x),
        Math.max(0, startRef.current.by + ev.clientY - startRef.current.y)
      );
    };
    const onUp = () => {
      setIsDragging(false);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, [block.id, block.x, block.y, updateBlockPosition]);

  const activeColor = block.color || 'var(--surface-lowest)';
  const blockHeight = 130 + (spanHours - 1) * 56;

  return (
    <div
      className={`sched-block ${isDragging ? 'sched-block--dragging' : ''} ${isNow ? 'sched-block--now' : ''} ${isTimerActive ? 'sched-block--timer' : ''}`}
      style={{ left: block.x, top: block.y, backgroundColor: activeColor, minHeight: `${blockHeight}px` }}
    >
      {/* NOW Badge */}
      {isNow && (
        <div className="sched-block__now-badge">
          <span className="sched-block__now-dot" />
          NOW
        </div>
      )}

      {/* Hour Badge */}
      <div className="sched-block__badge" style={{ backgroundColor: 'var(--accent-primary)' }}>
        {block.hour < 10 ? `0${block.hour}` : block.hour}
      </div>

      {/* Header — Drag Handle */}
      <div className="sched-block__header" onPointerDown={onPointerDown} style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
        <GripVertical size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <span className="sched-block__label" style={{ color: 'var(--text-main)' }}>
          {block.label}
          {spanHours > 1 && <span className="sched-block__span-pill">{spanHours}h</span>}
        </span>
        <div className="sched-block__header-actions">
          <button className="sched-block__icon-btn" onPointerDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); setShowColors(!showColors); }} title="Color" style={{ color: 'var(--text-muted)' }}>
            <Palette size={13} />
          </button>
          <button className="sched-block__icon-btn" onPointerDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); setActiveTimer(block.id); }} title="Start Timer" style={{ color: isTimerActive ? '#22c55e' : 'var(--text-muted)' }}>
            <Play size={13} fill={isTimerActive ? '#22c55e' : 'none'} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="sched-block__body">
        <textarea className="sched-block__textarea" value={block.text} onChange={e => updateBlockText(block.id, e.target.value)} placeholder="What's planned?" style={{ color: 'var(--text-main)', minHeight: `${Math.max(48, blockHeight - 82)}px` }} />
      </div>

      {/* Merge / Split Buttons */}
      <div className="sched-block__merge-actions">
        {spanHours > 1 && (
          <button className="sched-block__merge-btn sched-block__merge-btn--split" onClick={() => splitBlock(block.id)} title="Split last hour">
            <Scissors size={12} /> Split
          </button>
        )}
        {block.hour + spanHours < 24 && (
          <button className="sched-block__merge-btn" onClick={() => mergeBlockForward(block.id)} title="Merge with next hour">
            <Merge size={12} /> Merge
          </button>
        )}
      </div>

      {/* Color Picker */}
      {showColors && (
        <div className="sched-color-picker glass-panel" onPointerDown={e => e.stopPropagation()}>
          {BLOCK_COLORS.map(c => (
            <button key={c.label} className="sched-color-picker__swatch" onClick={() => { updateBlockColor(block.id, c.value); setShowColors(false); }} title={c.label}
              style={{ backgroundColor: c.value || 'var(--surface-lowest)', borderColor: block.color === c.value ? 'var(--accent-primary)' : 'var(--ghost-border)' }}>
              {block.color === c.value && <Check size={10} color="var(--accent-primary)" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
