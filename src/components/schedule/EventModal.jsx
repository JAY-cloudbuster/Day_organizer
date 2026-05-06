import React, { useState } from 'react';
import { X } from 'lucide-react';

const EVENT_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
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

    setTitle('');
    setDescription('');
    setStartTime('09:00');
    setEndTime('10:00');
    setColor('#3b82f6');
  };

  const dateStr = date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="event-modal-overlay" onClick={onClose}>
      <div className="event-modal liquid-glass" onClick={(e) => e.stopPropagation()}>
        <div className="event-modal__header">
          <h2 className="event-modal__title">Create Event</h2>
          <button className="event-modal__close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form className="event-modal__form" onSubmit={handleSubmit}>
          {/* Title */}
          <div className="event-modal__group">
            <label className="event-modal__label">Event Title *</label>
            <input
              type="text"
              className="event-modal__input"
              placeholder="Event name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="event-modal__group">
            <label className="event-modal__label">Description</label>
            <textarea
              className="event-modal__textarea"
              placeholder="Add details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
            />
          </div>

          {/* Date Display */}
          <div className="event-modal__group">
            <label className="event-modal__label">Date</label>
            <div className="event-modal__date-display">{dateStr}</div>
          </div>

          {/* Time */}
          <div className="event-modal__row">
            <div className="event-modal__group">
              <label className="event-modal__label">Start Time</label>
              <input
                type="time"
                className="event-modal__input"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="event-modal__group">
              <label className="event-modal__label">End Time</label>
              <input
                type="time"
                className="event-modal__input"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* Color Picker */}
          <div className="event-modal__group">
            <label className="event-modal__label">Color</label>
            <div className="event-modal__color-picker">
              {EVENT_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`event-modal__color-option ${color === c ? 'event-modal__color-option--active' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="event-modal__actions">
            <button type="button" className="event-modal__btn event-modal__btn--secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="event-modal__btn event-modal__btn--primary">
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
