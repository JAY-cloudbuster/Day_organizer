import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCanvasStore } from '../store/useCanvasStore';
import { useScheduleStore } from '../store/useScheduleStore';
import { Plus, LayoutGrid, Trash2, Search, FolderOpen, Settings, ChevronRight, Clock, CalendarClock, LogOut, Grip } from 'lucide-react';
import { AccountModal } from '../components/layout/AccountModal';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4';

const fadeStyle = (delayMs) => ({
  animationDelay: `${delayMs}ms`,
});

export const Dashboard = () => {
  const navigate = useNavigate();
  const { projectsList, loadAllProjects, createProject, deleteProject, setAuthToken } = useCanvasStore();
  const [showAccount, setShowAccount] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Schedule Store
  const { schedulesList, loadAllSchedules, createSchedule, deleteSchedule } = useScheduleStore();
  const [isFetchingSchedules, setIsFetchingSchedules] = useState(true);

  useEffect(() => {
    document.body.setAttribute('data-theme', 'dark');
    loadAllProjects().finally(() => setIsFetching(false));
    loadAllSchedules().finally(() => setIsFetchingSchedules(false));
  }, []);

  const handleCreateSchedule = () => {
    const title = prompt('Enter schedule name:', 'My Daily Schedule');
    if (title) createSchedule(title, navigate);
  };

  const handleDeleteSchedule = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this schedule permanently?')) {
      deleteSchedule(id);
    }
  };

  const handleCreate = () => {
    const title = prompt("Enter project name:", "My Master Plan");
    if (title) createProject(title, navigate);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this canvas permanently?")) {
      deleteProject(id);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    navigate('/');
  };

  const filteredProjects = projectsList.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredSchedules = schedulesList.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="landing-page">
      {/* ── Background Video ── */}
      <video className="landing-video-bg" src={VIDEO_URL} autoPlay loop muted playsInline />
      <div className="landing-blur-overlay" />

      {/* ── Dashboard Layout ── */}
      <div className="dash-layout">

        {/* ── Sidebar ── */}
        <aside className="dash-sidebar liquid-glass animate-blur-fade-up" style={fadeStyle(0)}>
          {/* Brand */}
          <div className="dash-sidebar__brand">
            <div className="dash-sidebar__logo">D</div>
            <span className="dash-sidebar__title">The Studio.</span>
          </div>

          {/* Navigation */}
          <div className="dash-sidebar__nav">
            <div className="dash-sidebar__section-label">Workspace</div>
            <button className="dash-sidebar__link dash-sidebar__link--active">
              <FolderOpen size={18} />
              Library
            </button>
            <button className="dash-sidebar__link" onClick={() => setShowAccount(true)}>
              <Settings size={18} />
              Settings
            </button>
          </div>

          {/* Footer */}
          <div className="dash-sidebar__footer">
            <button className="dash-sidebar__link" onClick={handleLogout}>
              <LogOut size={18} />
              Sign Out
            </button>
            <div className="dash-sidebar__profile" onClick={() => setShowAccount(true)}>
              <div className="dash-sidebar__avatar">DC</div>
              <div className="dash-sidebar__profile-info">
                <div className="dash-sidebar__profile-name">My Account</div>
                <div className="dash-sidebar__profile-sub">Manage Preferences</div>
              </div>
              <ChevronRight size={14} style={{ opacity: 0.5 }} />
            </div>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="dash-main">
          {/* Top Bar */}
          <div className="dash-topbar animate-blur-fade-up" style={fadeStyle(100)}>
            <h1 className="dash-topbar__title">Library</h1>
            <div className="dash-search liquid-glass">
              <Search size={16} style={{ opacity: 0.5 }} />
              <input
                type="text"
                placeholder="Search workspaces..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="dash-search__input"
              />
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="dash-scroll">

            {/* ── Canvas Section ── */}
            <div className="dash-section animate-blur-fade-up" style={fadeStyle(200)}>
              <h2 className="dash-section__title">
                <Grip size={20} style={{ opacity: 0.6 }} />
                Canvases
              </h2>
            </div>

            <div className="dash-grid animate-blur-fade-up" style={fadeStyle(300)}>
              {/* Create New Canvas */}
              <div className="dash-card dash-card--create liquid-glass" onClick={handleCreate}>
                <div className="dash-card__create-icon">
                  <Plus size={32} />
                </div>
                <div className="dash-card__create-title">New Canvas</div>
                <div className="dash-card__create-sub">Initialize a blank environment</div>
              </div>

              {/* Create New Schedule */}
              <div className="dash-card dash-card--create dash-card--schedule liquid-glass" onClick={handleCreateSchedule}>
                <div className="dash-card__create-icon dash-card__create-icon--schedule">
                  <CalendarClock size={32} />
                </div>
                <div className="dash-card__create-title">New Schedule</div>
                <div className="dash-card__create-sub">Plan your 24-hour day</div>
              </div>

              {/* Project Cards */}
              {isFetching ? (
                <div className="dash-empty">Syncing Workspaces...</div>
              ) : filteredProjects.length === 0 ? (
                <div className="dash-empty">No canvases found.</div>
              ) : (
                filteredProjects.map((file) => (
                  <div
                    key={file.id}
                    className="dash-card liquid-glass"
                    onClick={() => navigate(`/canvas/${file.id}`)}
                  >
                    <button
                      onClick={(e) => handleDelete(e, file.id)}
                      className="dash-card__delete"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="dash-card__preview">
                      <LayoutGrid size={56} style={{ opacity: 0.1 }} />
                    </div>
                    <div className="dash-card__info">
                      <div className="dash-card__name">{file.title}</div>
                      <div className="dash-card__date">
                        {new Date(file.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ── Schedules Section ── */}
            <div className="dash-section animate-blur-fade-up" style={fadeStyle(400)}>
              <h2 className="dash-section__title">
                <Clock size={20} style={{ opacity: 0.6 }} />
                Schedules
              </h2>
            </div>

            <div className="dash-grid animate-blur-fade-up" style={fadeStyle(500)}>
              {isFetchingSchedules ? (
                <div className="dash-empty">Syncing Schedules...</div>
              ) : filteredSchedules.length === 0 ? (
                <div className="dash-empty">No schedules yet. Create one above!</div>
              ) : (
                filteredSchedules.map((sched) => (
                  <div
                    key={sched.id}
                    className="dash-card liquid-glass"
                    onClick={() => navigate(`/schedule/${sched.id}`)}
                  >
                    <button
                      onClick={(e) => handleDeleteSchedule(e, sched.id)}
                      className="dash-card__delete"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="dash-card__preview">
                      <CalendarClock size={56} style={{ opacity: 0.1 }} />
                    </div>
                    <div className="dash-card__info">
                      <div className="dash-card__name">{sched.title}</div>
                      <div className="dash-card__date">
                        {new Date(sched.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </main>
      </div>

      {showAccount && <AccountModal onClose={() => setShowAccount(false)} />}
    </div>
  );
};
