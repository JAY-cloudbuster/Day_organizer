import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCanvasStore } from '../store/useCanvasStore';
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, Settings, Search } from 'lucide-react';
import CalendarMonth from '../components/schedule/CalendarMonth';
import CalendarWeek from '../components/schedule/CalendarWeek';
import CalendarDay from '../components/schedule/CalendarDay';
import EventModal from '../components/schedule/EventModal';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4';

export const Schedule = () => {
  const navigate = useNavigate();
  const { theme } = useCanvasStore();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day'
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    document.body.setAttribute('data-theme', 'dark');
    // Load events from localStorage
    const saved = localStorage.getItem('calendar_events');
    if (saved) setEvents(JSON.parse(saved));
  }, []);

  const handleAddEvent = (event) => {
    // Format date as YYYY-MM-DD for consistent storage
    const eventDate = event.date instanceof Date ? event.date : new Date(event.date);
    const dateStr = eventDate.toLocaleDateString('en-CA'); // Returns YYYY-MM-DD format
    const timeStr = `${String(eventDate.getHours()).padStart(2, '0')}:${String(eventDate.getMinutes()).padStart(2, '0')}`;
    const fullDateString = `${dateStr}T${timeStr}`;
    
    const newEvent = {
      ...event,
      id: Date.now().toString(),
      date: fullDateString
    };
    
    const newEvents = [...events, newEvent];
    setEvents(newEvents);
    localStorage.setItem('calendar_events', JSON.stringify(newEvents));
    setShowEventModal(false);
  };

  const handleDeleteEvent = (eventId) => {
    const newEvents = events.filter(e => e.id !== eventId);
    setEvents(newEvents);
    localStorage.setItem('calendar_events', JSON.stringify(newEvents));
  };

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') newDate.setMonth(newDate.getMonth() - 1);
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() - 7);
    else newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + 1);
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() + 7);
    else newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="landing-page">
      {/* ── Background Video ── */}
      <video className="landing-video-bg" src={VIDEO_URL} autoPlay loop muted playsInline />
      <div className="landing-blur-overlay" />

      {/* ── Calendar Wrapper ── */}
      <div className="calendar-container">
        {/* ── Top Navigation Bar ── */}
        <nav className="calendar-topbar liquid-glass">
          <div className="calendar-topbar__left">
            <button className="calendar-topbar__back" onClick={() => navigate('/dashboard')} title="Back to Dashboard">
              <ArrowLeft size={20} />
            </button>
            <div className="calendar-topbar__divider" />
            <h1 className="calendar-topbar__title">Calendar</h1>
          </div>

          <div className="calendar-topbar__center">
            <button className="calendar-topbar__nav-btn" onClick={handlePrevious}>
              <ChevronLeft size={20} />
            </button>
            <button className="calendar-topbar__today-btn" onClick={handleToday}>
              Today
            </button>
            <button className="calendar-topbar__nav-btn" onClick={handleNext}>
              <ChevronRight size={20} />
            </button>
            <div className="calendar-topbar__date-display">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
          </div>

          <div className="calendar-topbar__right">
            <div className="calendar-topbar__view-switcher">
              <button 
                className={`calendar-view-btn ${viewMode === 'day' ? 'active' : ''}`}
                onClick={() => setViewMode('day')}
              >
                Day
              </button>
              <button 
                className={`calendar-view-btn ${viewMode === 'week' ? 'active' : ''}`}
                onClick={() => setViewMode('week')}
              >
                Week
              </button>
              <button 
                className={`calendar-view-btn ${viewMode === 'month' ? 'active' : ''}`}
                onClick={() => setViewMode('month')}
              >
                Month
              </button>
            </div>
            <button 
              className="calendar-topbar__add-btn" 
              onClick={() => {
                setSelectedDate(currentDate);
                setShowEventModal(true);
              }}
              title="Add Event"
            >
              <Plus size={20} />
            </button>
          </div>
        </nav>

        {/* ── Calendar Content ── */}
        <div className="calendar-content">
          {viewMode === 'month' && <CalendarMonth currentDate={currentDate} events={events} onSelectDate={(date) => { setSelectedDate(date); setShowEventModal(true); }} onDeleteEvent={handleDeleteEvent} />}
          {viewMode === 'week' && <CalendarWeek currentDate={currentDate} events={events} onSelectDate={(date) => { setSelectedDate(date); setShowEventModal(true); }} onDeleteEvent={handleDeleteEvent} />}
          {viewMode === 'day' && <CalendarDay currentDate={currentDate} events={events} onSelectDate={(date) => { setSelectedDate(date); setShowEventModal(true); }} onDeleteEvent={handleDeleteEvent} />}
        </div>

        {/* Event Modal */}
        {showEventModal && (
          <EventModal 
            date={selectedDate}
            onAdd={handleAddEvent}
            onClose={() => setShowEventModal(false)}
          />
        )}
      </div>
    </div>
  );
};
