import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCanvasStore } from '../store/useCanvasStore';
import { useScheduleStore } from '../store/useScheduleStore';
import { Plus, LayoutGrid, Trash2, Moon, Sun, Search, Layout, Settings, FolderOpen, ChevronRight, Clock, CalendarClock } from 'lucide-react';
import { AccountModal } from '../components/layout/AccountModal';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme, projectsList, loadAllProjects, createProject, deleteProject } = useCanvasStore();
  const [showAccount, setShowAccount] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Schedule Store
  const { schedulesList, loadAllSchedules, createSchedule, deleteSchedule } = useScheduleStore();
  const [isFetchingSchedules, setIsFetchingSchedules] = useState(true);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    loadAllProjects().finally(() => setIsFetching(false));
    loadAllSchedules().finally(() => setIsFetchingSchedules(false));
  }, [theme]);

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

  const filteredProjects = projectsList.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="w-screen h-screen flex relative overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Global Dynamic Backgrounds behind everything */}
      <div className="absolute top-[0%] left-[20%] w-[40vw] h-[40vw] rounded-full blur-[120px] opacity-10 pointer-events-none transition-all duration-1000" style={{ backgroundColor: 'var(--accent-primary)' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] rounded-full blur-[100px] opacity-10 pointer-events-none transition-all duration-1000" style={{ backgroundColor: 'var(--accent-secondary)' }} />

      {/* ================= LEFT SIDEBAR (MNC STANDARD) ================= */}
      <div className="w-64 h-full border-r flex flex-col z-20 relative backdrop-blur-xl" style={{ backgroundColor: 'var(--surface-lowest)', borderColor: 'var(--ghost-border)' }}>
        
        {/* Brand Header */}
        <div className="px-6 py-6 flex items-center gap-3 border-b border-transparent">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black shadow-md" style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}>D</div>
          <span className="font-black text-xl tracking-tight" style={{ color: 'var(--text-main)' }}>The Studio.</span>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex-1 px-4 py-4 flex flex-col gap-1.5 overflow-y-auto">
          <div className="text-xs font-bold uppercase tracking-wider mb-2 mt-2 px-2" style={{ color: 'var(--text-muted)' }}>Workspace</div>
          
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all w-full text-left font-bold shadow-sm" style={{ color: 'var(--accent-primary)', backgroundColor: 'var(--surface-high)' }}>
            <FolderOpen size={18} />
            Library
          </button>
          
          <button 
             onClick={() => setShowAccount(true)}
             className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all w-full text-left font-semibold group" style={{ color: 'var(--text-muted)' }}>
            <Settings size={18} className="group-hover:rotate-90 transition-transform" />
            Settings
          </button>
        </div>

        {/* Global Controls & Profile */}
        <div className="p-4 border-t flex flex-col gap-2" style={{ borderColor: 'var(--ghost-border)', backgroundColor: 'var(--surface-low)' }}>
          <button 
            onClick={toggleTheme} 
            className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors w-full"
          >
            <span className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>Theme Setup</span>
            <div className="p-1.5 rounded-lg shadow-sm" style={{ backgroundColor: 'var(--surface-high)', color: 'var(--text-main)' }}>
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </div>
          </button>

          <div 
            className="flex items-center gap-3 p-2 rounded-xl transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 mt-2" 
            onClick={() => setShowAccount(true)}
          >
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBM3UH6v76vwAaREvfIKYZG2W1f02g67Ru5KRbck5BEOWREjqJBid2rCLX_q94I_QkPdxqO8Xpp7VGpXqBwiONjDqQV5Yxm34zVN-zOjHvOVoJGyuUdSn9e92KjRUb-HRJdmGZtUKgYx8B4LKEycAlvlFhHfnpQgzPS-TmM7OKJ3BtgWED2yXngMObE7Sg0ERY3EfkZEVKGAldpvh_9WWNojH3Aofb40kmmmmHjHNVFhI2VFGfA84jK6iuhxCryp99RwaZ5aSgoMcw" 
              alt="Profile"
              className="w-9 h-9 rounded-full border-2 object-cover shadow-sm" 
              style={{ borderColor: 'var(--accent-primary)' }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate" style={{ color: 'var(--text-main)' }}>My Account</div>
              <div className="text-xs truncate opacity-70" style={{ color: 'var(--text-muted)' }}>Manage Preferences</div>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
          </div>
        </div>
      </div>

      {/* ================= RIGHT MAIN CONTENT (LIBRARY) ================= */}
      <div className="flex-1 h-full overflow-y-auto px-6 md:px-12 py-8 relative z-10 flex flex-col items-center">
        <div className="w-full max-w-6xl flex flex-col">
          
          {/* Top Navbar / Search */}
          <div className="flex justify-between items-center mb-10 w-full">
            <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-main)' }}>Library</h1>
            <div className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-full border shadow-sm backdrop-blur-md" style={{ backgroundColor: 'var(--surface-low)', borderColor: 'var(--ghost-border)' }}>
              <Search size={16} style={{ color: 'var(--text-muted)' }} />
              <input 
                type="text" placeholder="Search workspaces..." 
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-64" style={{ color: 'var(--text-main)' }}
              />
            </div>
          </div>
          
          {/* Workspaces Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8">
            {/* Create New Canvas */}
            <div 
              className="card flex flex-col items-center justify-center h-64 cursor-pointer hover:scale-[1.03] transition-all border-dashed border-2 group"
              style={{ borderColor: 'var(--ghost-border)', backgroundColor: 'var(--surface-lowest)' }}
              onClick={handleCreate}
            >
              <div className="w-16 h-16 rounded-2xl mb-4 flex items-center justify-center transition-all group-hover:rotate-90 group-hover:shadow-lg" style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}>
                <Plus size={32} />
              </div>
              <div className="font-bold text-xl" style={{ color: 'var(--text-main)' }}>New Canvas</div>
              <div className="text-sm mt-2 opacity-70" style={{ color: 'var(--text-muted)' }}>Initialize a blank environment</div>
            </div>

            {/* Create New Schedule */}
            <div 
              className="card flex flex-col items-center justify-center h-64 cursor-pointer hover:scale-[1.03] transition-all border-dashed border-2 group"
              style={{ borderColor: 'var(--accent-primary)', backgroundColor: 'var(--surface-lowest)', borderStyle: 'dashed' }}
              onClick={handleCreateSchedule}
            >
              <div className="w-16 h-16 rounded-2xl mb-4 flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-lg" style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', color: '#fff' }}>
                <CalendarClock size={32} />
              </div>
              <div className="font-bold text-xl" style={{ color: 'var(--text-main)' }}>New Schedule</div>
              <div className="text-sm mt-2 opacity-70" style={{ color: 'var(--text-muted)' }}>Plan your 24-hour day</div>
            </div>

            {/* Project List */}
            {isFetching ? (
              <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex items-center justify-center h-64 text-lg font-bold animate-pulse" style={{ color: 'var(--text-muted)' }}>
                Syncing Workspaces...
              </div>
            ) : filteredProjects.length === 0 ? (
               <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex items-center justify-center h-64 text-lg font-bold italic" style={{ color: 'var(--ghost-border)' }}>
                No workspaces found matching your criteria.
              </div>
            ) : (
              filteredProjects.map((file) => (
                <div 
                  key={file.id} 
                  className="card h-64 flex flex-col overflow-hidden cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group relative border" 
                  style={{ borderColor: 'var(--ghost-border)', backgroundColor: 'var(--surface-high)' }}
                  onClick={() => navigate(`/canvas/${file.id}`)}
                >
                  {/* Delete Button (visible on hover) */}
                  <button 
                    onClick={(e) => handleDelete(e, file.id)}
                    className="absolute top-4 right-4 bg-red-500/80 hover:bg-red-500 text-white p-2.5 rounded-xl opacity-0 group-hover:opacity-100 shadow-lg transition-all z-10 backdrop-blur-md transform scale-90 group-hover:scale-100"
                    title="Delete Workspace"
                  >
                    <Trash2 size={18} />
                  </button>

                  <div className="flex-1 flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: 'var(--surface-lowest)' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/10 z-0" />
                    <LayoutGrid size={72} style={{ color: 'var(--accent-primary)', opacity: 0.1 }} className="group-hover:scale-125 group-hover:opacity-20 transition-all duration-700 z-0" />
                  </div>
                  
                  <div className="p-6 backdrop-blur-md border-t relative z-10" style={{ backgroundColor: 'var(--surface-high)', borderColor: 'var(--ghost-border)' }}>
                    <div className="font-extrabold text-xl truncate mb-1" style={{ color: 'var(--text-main)' }}>{file.title}</div>
                    <div className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Edited: {new Date(file.updated_at).toLocaleDateString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ================= SCHEDULES SECTION ================= */}
          <div className="flex justify-between items-center mb-6 mt-4 w-full">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3" style={{ color: 'var(--text-main)' }}>
              <Clock size={22} style={{ color: 'var(--accent-primary)' }} />
              Schedules
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
            {isFetchingSchedules ? (
              <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex items-center justify-center h-40 text-lg font-bold animate-pulse" style={{ color: 'var(--text-muted)' }}>
                Syncing Schedules...
              </div>
            ) : schedulesList.length === 0 ? (
              <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex items-center justify-center h-40 text-base font-bold italic" style={{ color: 'var(--ghost-border)' }}>
                No schedules yet. Create one above!
              </div>
            ) : (
              schedulesList.map((sched) => (
                <div
                  key={sched.id}
                  className="card h-52 flex flex-col overflow-hidden cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group relative border"
                  style={{ borderColor: 'var(--ghost-border)', backgroundColor: 'var(--surface-high)' }}
                  onClick={() => navigate(`/schedule/${sched.id}`)}
                >
                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDeleteSchedule(e, sched.id)}
                    className="absolute top-4 right-4 bg-red-500/80 hover:bg-red-500 text-white p-2.5 rounded-xl opacity-0 group-hover:opacity-100 shadow-lg transition-all z-10 backdrop-blur-md transform scale-90 group-hover:scale-100"
                    title="Delete Schedule"
                  >
                    <Trash2 size={18} />
                  </button>

                  <div className="flex-1 flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: 'var(--surface-lowest)' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/10 z-0" />
                    <CalendarClock size={72} style={{ color: 'var(--accent-primary)', opacity: 0.1 }} className="group-hover:scale-125 group-hover:opacity-20 transition-all duration-700 z-0" />
                  </div>

                  <div className="p-5 backdrop-blur-md border-t relative z-10" style={{ backgroundColor: 'var(--surface-high)', borderColor: 'var(--ghost-border)' }}>
                    <div className="font-extrabold text-lg truncate mb-1" style={{ color: 'var(--text-main)' }}>{sched.title}</div>
                    <div className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Edited: {new Date(sched.updated_at).toLocaleDateString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {showAccount && <AccountModal onClose={() => setShowAccount(false)} />}
    </div>
  );
};
