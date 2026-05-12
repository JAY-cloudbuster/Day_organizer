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
  const [actionModal, setActionModal] = useState(null);

  // Schedule Store
  const { schedulesList, loadAllSchedules, createSchedule, deleteSchedule } = useScheduleStore();
  const [isFetchingSchedules, setIsFetchingSchedules] = useState(true);

  useEffect(() => {
    document.body.setAttribute('data-theme', 'dark');
    loadAllProjects().finally(() => setIsFetching(false));
    loadAllSchedules().finally(() => setIsFetchingSchedules(false));
  }, []);

  const handleCreateSchedule = () => {
    setActionModal({
      type: 'prompt',
      title: 'New Schedule',
      placeholder: 'My Daily Schedule',
      onConfirm: (title) => {
        createSchedule(title || 'My Daily Schedule', navigate);
        setActionModal(null);
      }
    });
  };

  const handleDeleteSchedule = (e, id) => {
    e.stopPropagation();
    setActionModal({
      type: 'confirm',
      title: 'Delete Schedule?',
      desc: 'Are you sure you want to delete this schedule permanently? This action cannot be undone.',
      onConfirm: () => {
        deleteSchedule(id);
        setActionModal(null);
      }
    });
  };

  const handleCreate = () => {
    setActionModal({
      type: 'prompt',
      title: 'New Canvas',
      placeholder: 'My Master Plan',
      onConfirm: (title) => {
        createProject(title || 'My Master Plan', navigate);
        setActionModal(null);
      }
    });
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    setActionModal({
      type: 'confirm',
      title: 'Delete Canvas?',
      desc: 'Are you sure you want to delete this canvas permanently? This action cannot be undone.',
      onConfirm: () => {
        deleteProject(id);
        setActionModal(null);
      }
    });
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

            <div className="flex flex-col gap-10">
              
              {/* ── Canvas Ecosystem Hub ── */}
              <div 
                className="liquid-glass animate-blur-fade-up flex flex-col gap-6" 
                style={{ padding: '2rem', borderRadius: '40px', ...fadeStyle(200) }}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black tracking-tight flex items-center gap-3" style={{ color: 'var(--text-main)' }}>
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                      <Grip size={24} />
                    </div>
                    Canvas Ecosystem
                  </h2>
                  <div className="px-4 py-1.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-500">
                    {filteredProjects.length} Workspaces
                  </div>
                </div>

                <div className="dash-grid">
                  {/* Create New Canvas */}
                  <div className="dash-card dash-card--create liquid-glass card-glow animate-stagger" style={{ animationDelay: '0.1s' }} onClick={handleCreate}>
                    <div className="dash-card__create-icon">
                      <Plus size={32} />
                    </div>
                    <div className="dash-card__create-title">New Canvas</div>
                    <div className="dash-card__create-sub">Initialize a blank environment</div>
                  </div>

                  {/* Project Cards */}
                  {isFetching ? (
                    <div className="dash-empty">Syncing Workspaces...</div>
                  ) : filteredProjects.length === 0 ? (
                    <div className="dash-empty" style={{ gridColumn: 'span 2' }}>No canvases found.</div>
                  ) : (
                    filteredProjects.map((file, idx) => (
                      <div
                        key={file.id}
                        className="dash-card liquid-glass animate-stagger"
                        style={{ animationDelay: `${0.15 + idx * 0.07}s` }}
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
              </div>

              {/* ── Schedule Ecosystem Hub ── */}
              <div 
                className="liquid-glass animate-blur-fade-up flex flex-col gap-6" 
                style={{ padding: '2rem', borderRadius: '40px', ...fadeStyle(400) }}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black tracking-tight flex items-center gap-3" style={{ color: 'var(--text-main)' }}>
                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                      <CalendarClock size={24} />
                    </div>
                    Schedule Ecosystem
                  </h2>
                  <div className="px-4 py-1.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-500">
                    {filteredSchedules.length} Plans
                  </div>
                </div>

                <div className="dash-grid">
                  {/* Create New Schedule */}
                  <div className="dash-card dash-card--create dash-card--schedule liquid-glass card-glow animate-stagger" style={{ animationDelay: '0.1s' }} onClick={handleCreateSchedule}>
                    <div className="dash-card__create-icon dash-card__create-icon--schedule">
                      <Plus size={32} />
                    </div>
                    <div className="dash-card__create-title">New Schedule</div>
                    <div className="dash-card__create-sub">Plan your 24-hour day</div>
                  </div>

                  {/* Schedule Cards */}
                  {isFetchingSchedules ? (
                    <div className="dash-empty">Syncing Schedules...</div>
                  ) : filteredSchedules.length === 0 ? (
                    <div className="dash-empty" style={{ gridColumn: 'span 2' }}>No schedules yet. Create one!</div>
                  ) : (
                    filteredSchedules.map((sched, idx) => (
                      <div
                        key={sched.id}
                        className="dash-card liquid-glass animate-stagger"
                        style={{ animationDelay: `${0.15 + idx * 0.07}s` }}
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

            </div>

          </div>
        </main>
      </div>

      {showAccount && <AccountModal onClose={() => setShowAccount(false)} />}

      {/* ── Action Modal ── */}
      {actionModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 transition-all" onClick={() => setActionModal(null)}>
          <div 
            className="liquid-glass w-full max-w-md p-8 rounded-[32px] flex flex-col gap-6 animate-in zoom-in-95 duration-300 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-2xl font-black" style={{ color: 'var(--text-main)' }}>{actionModal.title}</h3>
            
            {actionModal.desc && (
              <p className="text-sm font-semibold opacity-70" style={{ color: 'var(--text-muted)' }}>{actionModal.desc}</p>
            )}

            {actionModal.type === 'prompt' && (
              <input 
                autoFocus
                type="text"
                id="action-modal-input"
                placeholder={actionModal.placeholder}
                className="liquid-glass w-full p-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500/50 font-bold"
                style={{ color: 'var(--text-main)' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') actionModal.onConfirm(e.target.value);
                  if (e.key === 'Escape') setActionModal(null);
                }}
              />
            )}

            <div className="flex justify-end gap-3 mt-4">
              <button 
                onClick={() => setActionModal(null)}
                className="px-6 py-3 rounded-xl font-bold transition-all hover:bg-black/10 dark:hover:bg-white/10"
                style={{ color: 'var(--text-muted)' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (actionModal.type === 'prompt') {
                    const val = document.getElementById('action-modal-input')?.value;
                    actionModal.onConfirm(val);
                  } else {
                    actionModal.onConfirm();
                  }
                }}
                className={`px-6 py-3 rounded-xl font-bold text-white transition-all shadow-lg hover:-translate-y-0.5 ${
                  actionModal.type === 'confirm' ? "bg-red-500 hover:bg-red-600 shadow-red-500/20" : "bg-blue-500 hover:bg-blue-600 shadow-blue-500/20"
                }`}
              >
                {actionModal.type === 'confirm' ? 'Delete' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
