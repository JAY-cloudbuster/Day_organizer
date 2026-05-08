import React, { useState, useEffect } from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { X, Lock, Trash2, Mail, Activity, LogOut, Loader2, User, Settings as SettingsIcon, Link as LinkIcon, CreditCard, Monitor, Type, MoveRight, Sparkles, Key, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

export const AccountModal = ({ onClose }) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const { 
    authToken, logout, 
    theme, toggleTheme,
    fontStyle, textSize, arrowStyle, updateSettings
  } = useCanvasStore();
  
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('account');
  
  // Password Mode Forms
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [loadingPass, setLoadingPass] = useState(false);
  const [loadingDel, setLoadingDel] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);

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
      setOldPass(''); setNewPass('');
    } catch(err) {
      setMsg({ text: err.message, type: 'error' });
    } finally {
      setLoadingPass(false);
    }
  };

  const handleDeleteAccount = async () => {
    setConfirmModal(true);
  };

  const executeDeleteAccount = async () => {
    setConfirmModal(false);

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

  const TABS = [
    { id: 'account', label: 'My Account', icon: <User size={18} /> },
    { id: 'preferences', label: 'Preferences', icon: <SettingsIcon size={18} /> },
    { id: 'integrations', label: 'Integrations', icon: <LinkIcon size={18} /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard size={18} /> },
  ];

  if (!profile) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 transition-all duration-500 p-4" onClick={onClose}>
      
      <div 
        className="liquid-glass w-full max-w-5xl h-[85vh] flex overflow-hidden animate-in zoom-in-95 duration-300" 
        style={{ borderRadius: '24px' }}
        onClick={e => e.stopPropagation()}
      >
        
        {/* Sidebar */}
        <div className="w-64 border-r bg-black/10 dark:bg-white/5 flex flex-col" style={{ borderColor: 'var(--ghost-border)' }}>
          <div className="p-6 pb-2">
            <h2 className="text-xl font-black tracking-tight" style={{ color: 'var(--text-main)' }}>Settings</h2>
            <div className="text-xs font-semibold opacity-50 uppercase tracking-widest mt-1" style={{ color: 'var(--text-muted)' }}>Workspace & Account</div>
          </div>
          
          <div className="flex flex-col gap-1 p-4 flex-1">
            {TABS.map(tab => (
              <button 
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setMsg({text:'', type:''}); }}
                className={clsx(
                  "flex items-center gap-3 w-full p-3 rounded-xl transition-all font-semibold text-sm",
                  activeTab === tab.id 
                    ? "bg-black/10 dark:bg-white/10 shadow-sm" 
                    : "hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100"
                )}
                style={{ color: activeTab === tab.id ? 'var(--text-main)' : 'var(--text-muted)' }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-4 border-t" style={{ borderColor: 'var(--ghost-border)' }}>
            <button 
              onClick={() => { logout(); onClose(); }}
              className="flex items-center gap-3 w-full p-3 rounded-xl transition-all font-semibold text-sm hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100"
              style={{ color: 'var(--text-main)' }}
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto relative p-10">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
            <X size={20} style={{ color: 'var(--text-muted)' }} />
          </button>

          {msg.text && (
            <div className={clsx(
              "mb-8 p-4 rounded-xl text-sm font-bold border flex items-center gap-3 animate-in slide-in-from-top-4",
              msg.type === 'error' ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-green-500/10 border-green-500/20 text-green-500"
            )}>
              {msg.type === 'error' ? <Trash2 size={18} /> : <CheckCircle2 size={18} />}
              {msg.text}
            </div>
          )}

          {activeTab === 'account' && (
            <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-3xl font-black mb-8" style={{ color: 'var(--text-main)' }}>My Account</h3>
              
              <div className="flex items-center gap-6 mb-10">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBM3UH6v76vwAaREvfIKYZG2W1f02g67Ru5KRbck5BEOWREjqJBid2rCLX_q94I_QkPdxqO8Xpp7VGpXqBwiONjDqQV5Yxm34zVN-zOjHvOVoJGyuUdSn9e92KjRUb-HRJdmGZtUKgYx8B4LKEycAlvlFhHfnpQgzPS-TmM7OKJ3BtgWED2yXngMObE7Sg0ERY3EfkZEVKGAldpvh_9WWNojH3Aofb40kmmmmHjHNVFhI2VFGfA84jK6iuhxCryp99RwaZ5aSgoMcw"
                  alt="Profile"
                  className="w-24 h-24 rounded-full border-4 shadow-xl object-cover"
                  style={{ borderColor: 'var(--ghost-border)' }}
                />
                <div>
                  <div className="text-xl font-bold mb-1" style={{ color: 'var(--text-main)' }}>{profile.user.email}</div>
                  <div className="flex items-center gap-2 text-sm font-semibold opacity-70" style={{ color: 'var(--text-muted)' }}>
                    <Activity size={14} />
                    {profile.stats.projects} Active Workspaces
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                {/* Password Section */}
                <section>
                  <h4 className="text-sm font-bold uppercase tracking-widest opacity-50 mb-4" style={{ color: 'var(--text-muted)' }}>Security</h4>
                  <form onSubmit={handleUpdatePassword} className="liquid-glass p-6 rounded-[24px] flex flex-col gap-4">
                    <div className="flex items-center gap-3 mb-2" style={{ color: 'var(--text-main)' }}>
                      <Lock size={18} className="text-blue-500" />
                      <span className="font-bold">Change Password</span>
                    </div>
                    <div className="flex gap-4">
                      <input 
                        type="password" placeholder="Current Password" required minLength={6}
                        value={oldPass} onChange={e => setOldPass(e.target.value)}
                        className="flex-1 p-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500/50 bg-black/5 dark:bg-white/5 font-semibold text-sm"
                        style={{ color: 'var(--text-main)' }}
                      />
                      <input 
                        type="password" placeholder="New Password" required minLength={6}
                        value={newPass} onChange={e => setNewPass(e.target.value)}
                        className="flex-1 p-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500/50 bg-black/5 dark:bg-white/5 font-semibold text-sm"
                        style={{ color: 'var(--text-main)' }}
                      />
                    </div>
                    <div className="flex justify-end mt-2">
                      <button type="submit" disabled={loadingPass} className="px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-lg bg-blue-500 text-white">
                        {loadingPass ? <Loader2 size={16} className="animate-spin" /> : 'Update Password'}
                      </button>
                    </div>
                  </form>
                </section>

                {/* Danger Zone */}
                <section>
                  <h4 className="text-sm font-bold uppercase tracking-widest text-red-500/70 mb-4">Danger Zone</h4>
                  <div className="border border-red-500/20 bg-red-500/5 p-6 rounded-[24px] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-red-500 mb-1">Destroy Account & Data</div>
                      <div className="text-sm text-red-500/70 font-semibold">Permanently delete your account and all canvases. This cannot be undone.</div>
                    </div>
                    <button 
                      disabled={loadingDel}
                      onClick={handleDeleteAccount}
                      className="px-6 py-3 rounded-xl font-bold flex items-center gap-2 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                    >
                      {loadingDel ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                      Destroy Account
                    </button>
                  </div>
                </section>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-3xl font-black mb-8" style={{ color: 'var(--text-main)' }}>Preferences</h3>
              
              <div className="space-y-8">
                {/* Theme */}
                <section>
                  <h4 className="text-sm font-bold uppercase tracking-widest opacity-50 mb-4" style={{ color: 'var(--text-muted)' }}>Appearance</h4>
                  <div className="liquid-glass p-6 rounded-[24px]">
                    <div className="flex items-center gap-3 mb-6" style={{ color: 'var(--text-main)' }}>
                      <Monitor size={18} className="text-purple-500" />
                      <span className="font-bold">App Theme</span>
                    </div>
                    <div className="flex gap-4">
                      {['dark', 'light'].map(t => (
                        <button 
                          key={t}
                          onClick={() => { toggleTheme(); updateSettings({ theme: t }); document.body.setAttribute('data-theme', t); localStorage.setItem('app_theme', t); }}
                          className={clsx(
                            "flex-1 p-4 rounded-xl border-2 font-bold capitalize transition-all",
                            theme === t ? "border-purple-500 bg-purple-500/10 text-purple-500" : "border-transparent bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10"
                          )}
                          style={{ color: theme === t ? '' : 'var(--text-main)' }}
                        >
                          {t} Mode
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Typography */}
                <section>
                  <h4 className="text-sm font-bold uppercase tracking-widest opacity-50 mb-4" style={{ color: 'var(--text-muted)' }}>Typography</h4>
                  <div className="liquid-glass p-6 rounded-[24px] space-y-8">
                    
                    <div>
                      <div className="flex items-center gap-3 mb-4" style={{ color: 'var(--text-main)' }}>
                        <Type size={18} className="text-green-500" />
                        <span className="font-bold">Font Family</span>
                      </div>
                      <select 
                        value={fontStyle}
                        onChange={(e) => updateSettings({ fontStyle: e.target.value })}
                        className="w-full p-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-green-500/50 bg-black/5 dark:bg-white/5 font-semibold text-sm appearance-none"
                        style={{ color: 'var(--text-main)', fontFamily: fontStyle }}
                      >
                        <option value="'Inter', sans-serif">Inter (Default)</option>
                        <option value="'Courier New', monospace">Courier New (Monospace)</option>
                        <option value="'Georgia', serif">Georgia (Serif)</option>
                        <option value="'Comic Sans MS', cursive">Comic Sans (Playful)</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center gap-3 mb-4" style={{ color: 'var(--text-main)' }}>
                        <Type size={18} className="text-green-500" />
                        <span className="font-bold">Base Text Size</span>
                      </div>
                      <div className="flex gap-4">
                        {['small', 'medium', 'large'].map(s => (
                          <button 
                            key={s}
                            onClick={() => updateSettings({ textSize: s })}
                            className={clsx(
                              "flex-1 p-4 rounded-xl border-2 font-bold capitalize transition-all",
                              textSize === s ? "border-green-500 bg-green-500/10 text-green-500" : "border-transparent bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10"
                            )}
                            style={{ color: textSize === s ? '' : 'var(--text-main)' }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                </section>

                {/* Canvas Rules */}
                <section>
                  <h4 className="text-sm font-bold uppercase tracking-widest opacity-50 mb-4" style={{ color: 'var(--text-muted)' }}>Canvas Behavior</h4>
                  <div className="liquid-glass p-6 rounded-[24px]">
                    <div className="flex items-center gap-3 mb-4" style={{ color: 'var(--text-main)' }}>
                      <MoveRight size={18} className="text-amber-500" />
                      <span className="font-bold">Arrow Connection Style</span>
                    </div>
                    <div className="flex gap-4">
                      {['solid', 'dashed'].map(s => (
                        <button 
                          key={s}
                          onClick={() => updateSettings({ arrowStyle: s })}
                          className={clsx(
                            "flex-1 p-4 rounded-xl border-2 font-bold capitalize transition-all",
                            arrowStyle === s ? "border-amber-500 bg-amber-500/10 text-amber-500" : "border-transparent bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10"
                          )}
                          style={{ color: arrowStyle === s ? '' : 'var(--text-main)' }}
                        >
                          {s} Line
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-3xl font-black mb-8" style={{ color: 'var(--text-main)' }}>Integrations & API</h3>
              
              <section>
                <div className="liquid-glass p-8 rounded-[32px] flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white mb-6 shadow-xl">
                    <Sparkles size={32} />
                  </div>
                  <h4 className="text-xl font-bold mb-2" style={{ color: 'var(--text-main)' }}>AI Smart Nodes</h4>
                  <p className="text-sm font-semibold opacity-70 mb-8 max-w-md" style={{ color: 'var(--text-muted)' }}>
                    Connect your OpenAI or Google Gemini API key to unlock dynamic node generation directly on your canvas.
                  </p>
                  
                  <div className="w-full text-left relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Key size={18} />
                    </div>
                    <input
                      type="password"
                      placeholder="sk-..."
                      className="w-full pl-12 pr-32 py-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500/50 bg-black/5 dark:bg-white/5 font-semibold text-sm"
                      style={{ color: 'var(--text-main)' }}
                    />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors">
                      Connect
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-3xl font-black mb-8" style={{ color: 'var(--text-main)' }}>Billing & Usage</h3>
              
              <section>
                <div className="relative overflow-hidden p-8 rounded-[32px] shadow-2xl border bg-black text-white border-white/10">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/30 blur-[80px] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2" />
                  
                  <div className="relative z-10">
                    <div className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold tracking-widest uppercase mb-4 text-purple-300">
                      Current Plan
                    </div>
                    <h4 className="text-4xl font-black mb-2">Studio Pro</h4>
                    <p className="text-sm font-semibold text-gray-400 mb-8 max-w-sm">
                      You are currently on the premium tier, unlocking unlimited canvases and advanced AI features.
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm font-bold">
                        <span className="text-gray-400">Canvases Created</span>
                        <span>{profile.stats.projects} / ∞</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: '10%' }} />
                      </div>
                    </div>

                    <button className="mt-8 px-6 py-3 bg-white text-black rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">
                      Manage Subscription
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}

        </div>
      </div>

      {/* ── Danger Confirm Modal ── */}
      {confirmModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 transition-all">
          <div className="liquid-glass w-full max-w-md p-8 rounded-[32px] flex flex-col gap-6 shadow-2xl border border-red-500/20 bg-red-500/5">
            <h3 className="text-2xl font-black text-red-500">WARNING!</h3>
            <p className="text-sm font-semibold opacity-80" style={{ color: 'var(--text-main)' }}>
              This will permanently delete your account and ALL your canvas workspaces. This action cannot be undone. Proceed?
            </p>
            <div className="flex justify-end gap-3 mt-4">
              <button 
                onClick={() => setConfirmModal(false)}
                className="px-6 py-3 rounded-xl font-bold transition-all hover:bg-black/10 dark:hover:bg-white/10"
                style={{ color: 'var(--text-muted)' }}
              >
                Cancel
              </button>
              <button 
                onClick={executeDeleteAccount}
                className="px-6 py-3 rounded-xl font-bold text-white transition-all shadow-lg bg-red-600 hover:bg-red-700"
              >
                Destroy Everything
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
