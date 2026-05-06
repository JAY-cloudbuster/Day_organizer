import React from 'react';
import { Trash2 } from 'lucide-react';

const CalendarWeek = ({ currentDate, events, onSelectDate, onDeleteEvent }) => {
  // Get the start of the week (Sunday)
  const date = new Date(currentDate);
  const day = date.getDay();
  const diff = date.getDate() - day;
  const weekStart = new Date(date.setDate(diff));
  
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    weekDays.push(d);
  }

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventsForDateAndHour = (date, hour) => {
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
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate() &&
        eventHour === hour
      );
    });
  };

  const formatTime = (hour) => {
    return `${hour < 10 ? '0' : ''}${hour}:00`;
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="calendar-week">
      {/* Day Headers */}
      <div className="calendar-week__header">
        <div className="calendar-week__time-col" />
        {weekDays.map((date, idx) => (
          <div key={idx} className={`calendar-week__day-header ${isToday(date) ? 'calendar-week__day-header--today' : ''}`}>
            <div className="calendar-week__day-name">
              {date.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div className={`calendar-week__day-date ${isToday(date) ? 'calendar-week__day-date--today' : ''}`}>
              {date.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="calendar-week__body">
        {/* Time Column */}
        <div className="calendar-week__time-col">
          {hours.map(hour => (
            <div key={hour} className="calendar-week__time-label">
              {formatTime(hour)}
            </div>
          ))}
        </div>

        {/* Day Columns */}
        {weekDays.map((date, dayIdx) => (
          <div key={dayIdx} className="calendar-week__day-col">
            {hours.map(hour => {
              const dayEvents = getEventsForDateAndHour(date, hour);
              return (
                <div
                  key={`${dayIdx}-${hour}`}
                  className="calendar-week__hour-cell"
                  onClick={() => onSelectDate(new Date(date.setHours(hour)))}
                >
                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      className="calendar-week__event"
                      style={{ backgroundColor: event.color || '#3b82f6' }}
                    >
                      <div className="calendar-week__event-title">{event.title}</div>
                      {event.description && (
                        <div className="calendar-week__event-desc">{event.description}</div>
                      )}
                      <button
                        className="calendar-week__event-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteEvent(event.id);
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarWeek;
