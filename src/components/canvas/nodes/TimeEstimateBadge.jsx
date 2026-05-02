import React, { useState, useRef, useEffect } from 'react';
import { useCanvasStore } from '../../../store/useCanvasStore';
import { Clock, Check } from 'lucide-react';

/**
 * TimeEstimateBadge — An inline time-estimate footer strip for canvas nodes.
 * Renders inside each node card as an elegant, clickable bar.
 * - When no time is set: shows a subtle "Set time →" prompt
 * - When time is set: shows "⏳ 30min" with click-to-edit
 * - Inline editing (no window.prompt) with Enter/Escape/blur to confirm
 */
export const TimeEstimateBadge = ({ nodeId }) => {
  const timeEstimate = useCanvasStore(state => {
    const node = state.nodes.find(n => n.id === nodeId);
    return node?.timeEstimate || '';
  });
  const updateNodeTimeEstimate = useCanvasStore(state => state.updateNodeTimeEstimate);

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(timeEstimate);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const confirm = () => {
    const trimmed = draft.trim();
    if (trimmed) {
      updateNodeTimeEstimate(nodeId, trimmed);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      confirm();
    } else if (e.key === 'Escape') {
      setDraft(timeEstimate);
      setIsEditing(false);
    }
  };

  const startEdit = (e) => {
    e.stopPropagation();
    setDraft(timeEstimate);
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <div
        className="flex items-center gap-2 mt-3 pt-3 pointer-events-auto"
        style={{ borderTop: '1px solid var(--ghost-border)' }}
        onPointerDown={e => e.stopPropagation()}
      >
        <Clock size={13} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={confirm}
          placeholder="e.g. 30min, 1h, 2h30m"
          className="flex-1 text-xs bg-transparent outline-none font-semibold"
          style={{ color: 'var(--text-main)', minWidth: 0 }}
        />
        <button
          onPointerDown={e => { e.stopPropagation(); e.preventDefault(); confirm(); }}
          className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 hover:scale-110 transition-transform"
          style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
        >
          <Check size={12} />
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2 mt-3 pt-3 cursor-pointer pointer-events-auto group/timer"
      style={{ borderTop: '1px solid var(--ghost-border)' }}
      onClick={startEdit}
    >
      <Clock size={13} style={{ color: timeEstimate ? 'var(--accent-primary)' : 'var(--text-muted)', flexShrink: 0, opacity: timeEstimate ? 1 : 0.5 }} />
      {timeEstimate ? (
        <span className="text-xs font-bold group-hover/timer:underline" style={{ color: 'var(--accent-primary)' }}>
          {timeEstimate}
        </span>
      ) : (
        <span className="text-[10px] font-medium group-hover/timer:underline" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
          Set time →
        </span>
      )}
    </div>
  );
};
