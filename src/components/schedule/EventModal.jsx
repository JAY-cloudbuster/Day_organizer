import React, { useState } from 'react';
import { X, Calendar, Clock, AlignLeft, Type, Sparkles } from 'lucide-react';
import clsx from 'clsx';

const EVENT_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
  '#8b5cf6', '#ec4899', '#06b6d4', '#f97316',
];

const EventModal = ({ date, onAdd, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [color, setColor] = useState('#3b82f6');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const [startHour, startMin] = startTime.split(':').map(Number);
    const eventDate = new Date(date);
    eventDate.setHours(startHour, startMin, 0, 0);

    onAdd({
      title: title.trim(),
      description: description.trim(),
      date: eventDate,
      time: `${startTime} - ${endTime}`,
      color,
    });
  };

  const dateStr = date?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 transition-all duration-500 p-4" onClick={onClose}>
      {/* Animated Gradient Background Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] opacity-30 pointer-events-none" 
        style={{ backgroundColor: color, transition: 'background-color 0.5s ease' }} 
      />
      
      <div 
        className="liquid-glass relative w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-300"
        style={{ borderRadius: '32px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b flex items-center justify-between border-white/10">
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-[20px] flex items-center justify-center text-white shadow-lg" 
              style={{ backgroundColor: color, transition: 'background-color 0.3s ease' }}
            >
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-main)' }}>New Event</h2>
              <p className="text-xs font-semibold opacity-60 uppercase tracking-widest mt-1" style={{ color: 'var(--text-muted)' }}>{dateStr}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
            <X size={20} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
          {/* Title */}
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
              <Type size={18} />
            </div>
            <input
              type="text"
              required
              className="liquid-glass w-full pl-12 pr-4 py-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-bold"
              style={{ color: 'var(--text-main)' }}
              placeholder="Event Title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {/* Time Row */}
          <div className="flex gap-4">
            <div className="flex-1 relative group">
               <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                 <Clock size={18} />
               </div>
               <input
                 type="time"
                 required
                 className="liquid-glass w-full pl-12 pr-4 py-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-bold"
                 style={{ color: 'var(--text-main)' }}
                 value={startTime}
                 onChange={(e) => setStartTime(e.target.value)}
               />
            </div>
            <div className="flex items-center justify-center opacity-50" style={{ color: 'var(--text-muted)' }}>—</div>
            <div className="flex-1 relative group">
               <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                 <Clock size={18} />
               </div>
               <input
                 type="time"
                 required
                 className="liquid-glass w-full pl-12 pr-4 py-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-bold"
                 style={{ color: 'var(--text-main)' }}
                 value={endTime}
                 onChange={(e) => setEndTime(e.target.value)}
               />
            </div>
          </div>

          {/* Description */}
          <div className="relative group">
            <div className="absolute left-4 top-4 text-gray-400 group-focus-within:text-blue-500 transition-colors">
              <AlignLeft size={18} />
            </div>
            <textarea
              className="liquid-glass w-full pl-12 pr-4 py-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm resize-none"
              style={{ color: 'var(--text-main)', minHeight: '100px' }}
              placeholder="Add some details about this event..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Color Picker */}
          <div className="mt-2">
            <label className="text-[10px] font-bold uppercase tracking-widest mb-3 block opacity-50" style={{ color: 'var(--text-muted)' }}>Theme Color</label>
            <div className="flex items-center gap-3">
              {EVENT_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={clsx(
                    "w-8 h-8 rounded-full transition-all duration-300 relative",
                    color === c ? "scale-110 shadow-xl" : "hover:scale-110 opacity-60 hover:opacity-100"
                  )}
                  style={{ 
                    backgroundColor: c, 
                    boxShadow: color === c ? `0 0 0 2px var(--surface-high), 0 0 0 4px ${c}` : 'none' 
                  }}
                />
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="mt-6">
            <button 
              type="submit" 
              className="w-full py-4 rounded-2xl font-black text-white text-[15px] tracking-[0.2em] uppercase transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0 active:scale-[0.98]"
              style={{ 
                background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                boxShadow: `0 10px 30px -10px ${color}`
              }}
            >
              Commit it
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EventModal;
