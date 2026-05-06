import React from 'react';
import { X, Trash2 } from 'lucide-react';

const CalendarMonth = ({ currentDate, events, onSelectDate, onDeleteEvent }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  const getEventsForDate = (date) => {
    if (!date) return [];
    return events.filter(event => {
      // Parse date ensuring local timezone is used
      let eventDate;
      if (typeof event.date === 'string') {
        const parts = event.date.split('T')[0].split('-');
        eventDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      } else {
        eventDate = new Date(event.date);
      }
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      );
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date && date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return date && date.toDateString() === currentDate.toDateString();
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="calendar-month">
      {/* Week Header */}
      <div className="calendar-month__header">
        {weekDays.map(day => (
          <div key={day} className="calendar-month__weekday">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="calendar-month__grid">
        {days.map((date, idx) => {
          const dateEvents = getEventsForDate(date);
          const today = isToday(date);
          
          return (
            <div
              key={idx}
              className={`calendar-day-cell ${!date ? 'calendar-day-cell--empty' : ''} ${today ? 'calendar-day-cell--today' : ''}`}
              onClick={() => date && onSelectDate(date)}
            >
              {date && (
                <>
                  <div className={`calendar-day-cell__date ${today ? 'calendar-day-cell__date--today' : ''}`}>
                    {date.getDate()}
                  </div>
                  <div className="calendar-day-cell__events">
                    {dateEvents.slice(0, 2).map(event => (
                      <div 
                        key={event.id}
                        className="calendar-day-cell__event"
                        style={{ backgroundColor: event.color || '#3b82f6' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="calendar-day-cell__event-title">{event.title}</span>
                      </div>
                    ))}
                    {dateEvents.length > 2 && (
                      <div className="calendar-day-cell__more">
                        +{dateEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarMonth;
