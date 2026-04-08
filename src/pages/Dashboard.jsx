import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCanvasStore } from '../store/useCanvasStore';
import { Plus, LayoutGrid, Trash2, Moon, Sun, Search, Layout } from 'lucide-react';
import { AccountModal } from '../components/layout/AccountModal';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme, projectsList, loadAllProjects, createProject, deleteProject } = useCanvasStore();
  const [showAccount, setShowAccount] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    loadAllProjects().finally(() => setIsFetching(false));
  }, [theme]);

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
    <div className="w-screen h-screen overflow-y-auto p-6 md:p-12 flex flex-col items-center relative" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Dynamic Background */}
      <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full blur-[120px] opacity-20 pointer-events-none transition-all duration-1000" style={{ backgroundColor: 'var(--accent-primary)' }} />
      <div className="fixed bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] rounded-full blur-[100px] opacity-20 pointer-events-none transition-all duration-1000" style={{ backgroundColor: 'var(--accent-secondary)' }} />

      <div className="w-full max-w-6xl flex flex-col z-10">
        
        {/* Top Navbar */}
        <div className="flex justify-between items-center mb-12 glass-panel p-4 rounded-2xl sticky top-0 backdrop-blur-xl border" style={{ borderColor: 'var(--ghost-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl shadow-lg" style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}>D</div>
            <div className="text-2xl font-black tracking-tight hidden sm:block" style={{ color: 'var(--text-main)' }}>Daily Canvas</div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border bg-opacity-50" style={{ backgroundColor: 'var(--surface-high)', borderColor: 'var(--ghost-border)' }}>
              <Search size={16} style={{ color: 'var(--text-muted)' }} />
              <input 
                type="text" placeholder="Search workspaces..." 
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-48" style={{ color: 'var(--text-main)' }}
              />
            </div>
            
            <button onClick={toggleTheme} className="p-2 rounded-full hover:scale-110 transition-transform" style={{ backgroundColor: 'var(--surface-high)', color: 'var(--text-main)' }} title="Toggle Theme">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBM3UH6v76vwAaREvfIKYZG2W1f02g67Ru5KRbck5BEOWREjqJBid2rCLX_q94I_QkPdxqO8Xpp7VGpXqBwiONjDqQV5Yxm34zVN-zOjHvOVoJGyuUdSn9e92KjRUb-HRJdmGZtUKgYx8B4LKEycAlvlFhHfnpQgzPS-TmM7OKJ3BtgWED2yXngMObE7Sg0ERY3EfkZEVKGAldpvh_9WWNojH3Aofb40kmmmmHjHNVFhI2VFGfA84jK6iuhxCryp99RwaZ5aSgoMcw"
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 cursor-pointer object-cover transition-transform hover:scale-110 shadow-md"
              style={{ borderColor: 'var(--accent-primary)' }}
              onClick={() => setShowAccount(true)}
            />
          </div>
        </div>

        {/* Hero Section */}
        <div className="mb-12 px-4">
          <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight" style={{ color: 'var(--text-main)' }}>
            Welcome to the <span style={{ color: 'var(--accent-primary)' }}>Studio.</span>
          </h1>
          <p className="text-lg md:text-xl max-w-2xl" style={{ color: 'var(--text-muted)' }}>
            Design your logic flows, map out architectural nodes, and plan your entire workflow seamlessly in your private Daily Canvas environment.
          </p>
        </div>
        
        {/* Workspaces Grid */}
        <div className="flex items-center gap-3 mb-6 px-4">
          <Layout className="text-gray-400" size={24} />
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>Your Workspaces</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 pb-20">
          {/* Create New Node */}
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

          {/* Project List */}
          {isFetching ? (
            <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex items-center justify-center h-64 text-lg font-bold animate-pulse" style={{ color: 'var(--text-muted)' }}>
              Syncing Workspaces...
            </div>
          ) : filteredProjects.length === 0 ? (
             <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex items-center justify-center h-64 text-lg font-bold italic" style={{ color: 'var(--ghost-border)' }}>
              No workspaces found.
            </div>
          ) : (
            filteredProjects.map((file) => (
              <div 
                key={file.id} 
                className="card h-64 flex flex-col overflow-hidden cursor-pointer shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group relative border" 
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
      </div>
      {showAccount && <AccountModal onClose={() => setShowAccount(false)} />}
    </div>
  );
};
