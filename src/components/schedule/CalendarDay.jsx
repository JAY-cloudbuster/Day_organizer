import React, { useRef, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

const CalendarDay = ({ currentDate, events, onSelectDate, onDeleteEvent }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const scrollRef = useRef(null);

  useEffect(() => {
    // Scroll to current hour on mount
    const currentHour = new Date().getHours();
    const element = document.getElementById(`hour-${currentHour}`);
    if (element && scrollRef.current) {
      element.scrollIntoView({ block: 'center' });
    }
  }, [currentDate]);

  const getEventsForHour = (hour) => {
    return events.filter(event => {
      // Parse date ensuring local timezone is used
      let eventDate, eventHour;
      if (typeof event.date === 'string') {
        const parts = event.date.split('T');
        const dateParts = parts[0].split('-');
        eventDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
        const timeParts = parts[1]?.split(':') || ['09', '00'];
        eventHour = parseInt(timeParts[0]);
      } else {
        eventDate = new Date(event.date);
        eventHour = eventDate.getHours();
      }
      return (
        eventDate.getFullYear() === currentDate.getFullYear() &&
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getDate() === currentDate.getDate() &&
        eventHour === hour
      );
    });
  };

  const formatTime = (hour) => {
    if (hour === 0) return '12:00 AM';
    if (hour < 12) return `${hour}:00 AM`;
    if (hour === 12) return '12:00 PM';
    return `${hour - 12}:00 PM`;
  };

  const isToday = () => {
    const today = new Date();
    return currentDate.toDateString() === today.toDateString();
  };

  const currentHour = new Date().getHours();

  return (
    <div className="calendar-day">
      {/* Date Header */}
      <div className="calendar-day__header liquid-glass">
        <h2 className="calendar-day__title">
          {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </h2>
      </div>

      {/* Timeline */}
      <div className="calendar-day__timeline" ref={scrollRef}>
        {hours.map(hour => {
          const hourEvents = getEventsForHour(hour);
          const isCurrentHour = isToday() && hour === currentHour;

          return (
            <div
              key={hour}
              id={`hour-${hour}`}
              className={`calendar-day__hour ${isCurrentHour ? 'calendar-day__hour--now' : ''}`}
            >
              {isCurrentHour && <div className="calendar-day__now-indicator" />}

              <div className="calendar-day__time-label">
                {formatTime(hour)}
              </div>

              <div className="calendar-day__hour-content">
                <div className="calendar-day__hour-slot" onClick={() => onSelectDate(new Date(currentDate.setHours(hour)))}>
                  {hourEvents.map(event => (
                    <div
                      key={event.id}
                      className="calendar-day__event"
                      style={{ backgroundColor: event.color || '#3b82f6' }}
                    >
                      <div className="calendar-day__event-top">
                        <div className="calendar-day__event-title">{event.title}</div>
                        <button
                          className="calendar-day__event-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteEvent(event.id);
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      {event.description && (
                        <div className="calendar-day__event-desc">{event.description}</div>
                      )}
                      {event.time && (
                        <div className="calendar-day__event-time">{event.time}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarDay;
