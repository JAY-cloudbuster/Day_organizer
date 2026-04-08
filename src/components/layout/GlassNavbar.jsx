import React, { useState } from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { Moon, Sun, History, Share2, Loader2, Download } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { AccountModal } from './AccountModal';
import { toPng } from 'html-to-image';

export const GlassNavbar = () => {
  const { id } = useParams();
  const { theme, toggleTheme, currentProjectTitle } = useCanvasStore();
  const navigate = useNavigate();
  const [showAccount, setShowAccount] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleShare = async () => {
    setIsExporting(true);
    try {
      const element = document.querySelector('.canvas-viewport');
      if (!element) throw new Error("Viewport not found");
      
      const dataUrl = await toPng(element, { 
        backgroundColor: theme === 'dark' ? '#09090b' : '#ffffff',
        pixelRatio: 2,
        filter: (node) => !node.classList?.contains('glass-navbar') // optional filter out UI elements if tagged
      });
      
      const link = document.createElement('a');
      link.download = `canvas-${currentProjectTitle || id}.png`;
      link.href = dataUrl;
      link.click();
    } catch(err) {
      console.error(err);
      alert('Failed to generate Canvas export.');
    } finally {
      setIsExporting(false);
    }
  };

  const visits = JSON.parse(localStorage.getItem(`canvas_visits_${id}`) || '[]');

  return (
    <nav className="glass-panel fixed top-0 left-0 right-0 h-16 m-4 mt-2 px-6 flex items-center justify-between z-50">
      <div className="flex items-center gap-6">
        <button className="flex items-center gap-2 hover:opacity-70 transition-opacity" onClick={() => navigate('/dashboard')}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold"
               style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}>
            D
          </div>
          <span className="font-bold text-lg hidden sm:block" style={{ color: 'var(--accent-primary)' }}>Daily Canvas</span>
        </button>
        
        <div className="w-px h-6 bg-gray-300 opacity-30" />
        
        <input 
          value={currentProjectTitle || "Loading Plan..."}
          readOnly
          className="bg-transparent border-none outline-none font-bold text-xl w-48 text-ellipsis cursor-default"
          style={{ color: 'var(--text-main)' }}
        />
      </div>

      <div className="flex items-center gap-2 sm:gap-4 relative">
        <NavButton 
          icon={<History size={18} />} 
          label="History" 
          onClick={() => setShowHistory(!showHistory)} 
        />
        
        {/* History Dropdown Panel */}
        {showHistory && (
          <div className="absolute top-12 right-1/2 translate-x-1/4 w-72 max-h-96 overflow-y-auto glass-panel p-4 rounded-xl shadow-2xl z-50 border" style={{ borderColor: 'var(--ghost-border)', backgroundColor: 'var(--surface-high)' }}>
            <h3 className="font-bold mb-3 border-b pb-2 text-sm uppercase tracking-widest" style={{ color: 'var(--text-main)', borderColor: 'var(--ghost-border)' }}>Access Logs</h3>
            {visits.length === 0 ? (
              <div className="text-sm italic" style={{ color: 'var(--text-muted)' }}>No previous visits logged.</div>
            ) : (
              <div className="flex flex-col gap-2">
                {visits.map((isoString, idx) => {
                  const d = new Date(isoString);
                  return (
                    <div key={idx} className="flex justify-between items-center text-xs p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5" style={{ color: 'var(--text-main)' }}>
                      <span className="font-semibold">{d.toLocaleDateString()}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <NavButton 
          icon={isExporting ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />} 
          label={isExporting ? "Exporting..." : "Share"} 
          onClick={handleShare}
        />
        <div className="w-px h-6 bg-gray-300 opacity-30 mx-1" />
        <NavButton 
          icon={theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />} 
          onClick={toggleTheme} 
        />
        <img 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBM3UH6v76vwAaREvfIKYZG2W1f02g67Ru5KRbck5BEOWREjqJBid2rCLX_q94I_QkPdxqO8Xpp7VGpXqBwiONjDqQV5Yxm34zVN-zOjHvOVoJGyuUdSn9e92KjRUb-HRJdmGZtUKgYx8B4LKEycAlvlFhHfnpQgzPS-TmM7OKJ3BtgWED2yXngMObE7Sg0ERY3EfkZEVKGAldpvh_9WWNojH3Aofb40kmmmmHjHNVFhI2VFGfA84jK6iuhxCryp99RwaZ5aSgoMcw"
          alt="Profile"
          className="w-8 h-8 rounded-full border cursor-pointer hover:shadow-md transition-shadow ml-2 object-cover"
          style={{ borderColor: 'var(--ghost-border)' }}
          onClick={() => setShowAccount(true)}
        />
      </div>
      {showAccount && <AccountModal onClose={() => setShowAccount(false)} />}
    </nav>
  );
};

const NavButton = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
    style={{ color: 'var(--text-muted)' }}
  >
    {icon}
    {label && <span className="text-sm font-medium hidden md:block">{label}</span>}
  </button>
);
