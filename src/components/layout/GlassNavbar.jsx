import React, { useState } from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { Moon, Sun, History, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AccountModal } from './AccountModal';

export const GlassNavbar = () => {
  const { theme, toggleTheme } = useCanvasStore();
  const navigate = useNavigate();
  const [showAccount, setShowAccount] = useState(false);

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
          defaultValue="Untitled Plan"
          className="bg-transparent border-none outline-none font-bold text-xl w-48 focus:border-b-2"
          style={{ color: 'var(--text-main)', borderBottomColor: 'var(--accent-primary)' }}
        />
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <NavButton icon={<History size={18} />} label="History" />
        <NavButton icon={<Share2 size={18} />} label="Share" />
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
