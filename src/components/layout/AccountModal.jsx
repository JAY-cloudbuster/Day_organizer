import React, { useState, useEffect } from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { X, Lock, Trash2, Mail, Activity, LogOut, Loader2 } from 'lucide-react';

export const AccountModal = ({ onClose }) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const { authToken, logout } = useCanvasStore();
  const [profile, setProfile] = useState(null);
  
  // Password Mode Forms
  const [passMode, setPassMode] = useState(false);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [loadingPass, setLoadingPass] = useState(false);
  const [loadingDel, setLoadingDel] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await res.json();
        if (data.user) setProfile(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, [authToken]);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if(loadingPass) return;
    setLoadingPass(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/update-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({ currentPassword: oldPass, newPassword: newPass })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setMsg({ text: 'Password successfully updated!', type: 'success' });
      setPassMode(false); setOldPass(''); setNewPass('');
    } catch(err) {
      setMsg({ text: err.message, type: 'error' });
    } finally {
      setLoadingPass(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm("WARNING: This will permanently delete your account and ALL your canvas workspaces. This action cannot be undone. Proceed?");
    if (!confirmDelete) return;

    setLoadingDel(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/delete`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        logout();
      }
    } catch(err) {
      setMsg({ text: 'Failed to delete account.', type: 'error' });
    } finally {
      setLoadingDel(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-md p-8 relative flex flex-col gap-6" style={{ backgroundColor: 'var(--surface-main)' }}>
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
          <X size={24} />
        </button>

        <div className="flex flex-col items-center border-b pb-6" style={{ borderColor: 'var(--ghost-border)' }}>
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBM3UH6v76vwAaREvfIKYZG2W1f02g67Ru5KRbck5BEOWREjqJBid2rCLX_q94I_QkPdxqO8Xpp7VGpXqBwiONjDqQV5Yxm34zVN-zOjHvOVoJGyuUdSn9e92KjRUb-HRJdmGZtUKgYx8B4LKEycAlvlFhHfnpQgzPS-TmM7OKJ3BtgWED2yXngMObE7Sg0ERY3EfkZEVKGAldpvh_9WWNojH3Aofb40kmmmmHjHNVFhI2VFGfA84jK6iuhxCryp99RwaZ5aSgoMcw"
            alt="Profile"
            className="w-20 h-20 rounded-full border-4 shadow-lg object-cover mb-4"
            style={{ borderColor: 'var(--accent-primary)' }}
          />
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>Account Settings</h2>
        </div>

        {msg.text && (
          <div className={`p-3 rounded-md text-sm text-center ${msg.type === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
            {msg.text}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--surface-high)' }}>
            <Mail className="text-gray-400" />
            <div className="font-medium truncate" style={{ color: 'var(--text-main)' }}>{profile.user.email}</div>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--surface-high)' }}>
            <div className="flex items-center gap-4">
              <Activity className="text-gray-400" />
              <span style={{ color: 'var(--text-main)' }}>Active Workspaces</span>
            </div>
            <span className="font-bold text-lg" style={{ color: 'var(--accent-primary)' }}>{profile.stats.projects}</span>
          </div>
        </div>

        {passMode ? (
          <form onSubmit={handleUpdatePassword} className="flex flex-col gap-3 mt-4 border p-4 rounded-lg" style={{ borderColor: 'var(--ghost-border)' }}>
            <h3 className="font-bold text-sm" style={{ color: 'var(--text-muted)' }}>Change Password</h3>
            <input 
              type="password" placeholder="Current Password" required minLength={6}
              value={oldPass} onChange={e => setOldPass(e.target.value)}
              className="p-3 rounded border outline-none" style={{ backgroundColor: 'var(--surface-low)', borderColor: 'var(--ghost-border)', color: 'var(--text-main)' }}
            />
            <input 
              type="password" placeholder="New Password" required minLength={6}
              value={newPass} onChange={e => setNewPass(e.target.value)}
              className="p-3 rounded border outline-none" style={{ backgroundColor: 'var(--surface-low)', borderColor: 'var(--ghost-border)', color: 'var(--text-main)' }}
            />
            <div className="flex justify-end gap-2 mt-2">
              <button type="button" onClick={() => setPassMode(false)} className="px-4 py-2 text-sm rounded hover:bg-gray-800 transition-colors" style={{ color: 'var(--text-muted)' }}>Cancel</button>
              <button type="submit" disabled={loadingPass} className="px-4 py-2 text-sm rounded font-bold flex items-center gap-2 hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}>
                {loadingPass && <Loader2 size={16} className="animate-spin" />}
                Save
              </button>
            </div>
          </form>
        ) : (
          <button 
            onClick={() => setPassMode(true)}
            className="flex items-center gap-3 p-4 rounded-xl transition-colors hover:brightness-125"
            style={{ backgroundColor: 'var(--surface-high)', color: 'var(--text-main)' }}
          >
            <Lock className="text-blue-400" size={20} />
            <span className="font-bold">Change Password</span>
          </button>
        )}

        <button 
          onClick={() => { logout(); onClose(); }}
          className="flex items-center gap-3 p-4 rounded-xl transition-colors hover:brightness-125 border border-transparent hover:border-gray-500"
          style={{ backgroundColor: 'var(--surface-high)', color: 'var(--text-main)' }}
        >
          <LogOut className="text-gray-400" size={20} />
          <span className="font-bold">Sign Out</span>
        </button>

        <div className="border-t pt-4 mt-2" style={{ borderColor: 'var(--ghost-border)' }}>
          <button 
            disabled={loadingDel}
            onClick={handleDeleteAccount}
            className="flex items-center justify-center gap-2 text-red-500 hover:text-red-400 text-sm font-bold mx-auto transition-colors disabled:opacity-50"
          >
            {loadingDel ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Destroy Account & Data
          </button>
        </div>

      </div>
    </div>
  );
};
