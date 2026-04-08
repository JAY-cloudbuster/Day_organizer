import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCanvasStore } from '../store/useCanvasStore';
import { Loader2, Moon, Sun } from 'lucide-react';

export const Auth = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const navigate = useNavigate();
  const { theme, toggleTheme, setAuthToken } = useCanvasStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError(''); setMsg('');
    setLoading(true);
    
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Authentication failed");

      if (isLogin) {
        setAuthToken(data.token);
        navigate('/dashboard');
      } else {
        setMsg('Registration successful! You can now login.');
        setIsLogin(true);
        setPassword('');
      }
    } catch(err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center relative overflow-hidden bg-cover bg-center transition-colors duration-500" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Background Floating Nodes */}
      <div className="absolute top-[10%] left-[10%] w-[50vw] h-[50vw] rounded-full blur-[120px] opacity-20 pointer-events-none transition-all duration-1000" style={{ backgroundColor: 'var(--accent-primary)' }} />
      <div className="absolute bottom-[10%] right-[10%] w-[40vw] h-[40vw] rounded-full blur-[100px] opacity-20 pointer-events-none transition-all duration-1000" style={{ backgroundColor: 'var(--accent-secondary)' }} />
      
      {/* Absolute Theme Toggle */}
      <button 
        onClick={toggleTheme} 
        className="absolute top-8 right-8 p-3 rounded-full hover:scale-110 transition-transform shadow-lg z-50 glass-panel" 
        style={{ color: 'var(--text-main)', borderColor: 'var(--ghost-border)' }}
        title="Toggle Theme"
      >
        {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
      </button>

      <div className="glass-panel w-full max-w-sm p-10 z-10 relative shadow-2xl border" style={{ borderColor: 'var(--ghost-border)', backgroundColor: 'var(--surface-high)' }}>
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-3xl shadow-lg" style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}>D</div>
        </div>
        <div className="text-3xl font-black text-center mb-2 tracking-tight" style={{ color: 'var(--text-main)' }}>Daily Canvas</div>
        <p className="text-center text-sm font-medium mb-8" style={{ color: 'var(--text-muted)' }}>{isLogin ? 'Enter the engineering studio.' : 'Create your secure profile.'}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <span className="text-red-500 text-xs text-center">{error}</span>}
          {msg && <span className="text-green-500 text-xs text-center">{msg}</span>}
          
          <input 
            type="email" placeholder="Email address" required
            value={email} onChange={e => setEmail(e.target.value)}
            className="w-full p-4 rounded-xl outline-none transition-colors border"
            style={{ backgroundColor: 'var(--surface-high)', borderColor: 'var(--ghost-border)', color: 'var(--text-main)' }}
          />
          <input 
            type="password" placeholder="Password" required
            value={password} onChange={e => setPassword(e.target.value)}
            className="w-full p-4 rounded-xl outline-none transition-colors border"
            style={{ backgroundColor: 'var(--surface-high)', borderColor: 'var(--ghost-border)', color: 'var(--text-main)' }}
          />
          
          <button 
            type="submit" disabled={loading}
            className="w-full p-4 rounded-xl font-bold mt-2 hover:scale-[1.02] flex items-center justify-center gap-2 transition-all active:scale-95 disabled:scale-100 disabled:opacity-70"
            style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-primary-dim))', color: '#fff' }}
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : null}
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Register Securely')}
          </button>
        </form>

        <div className="text-center mt-6 text-sm" style={{ color: 'var(--text-muted)' }}>
          <button onClick={() => setIsLogin(!isLogin)} className="font-bold hover:underline" style={{ color: 'var(--accent-primary)' }}>
            {isLogin ? "Need an account? Register." : "Already registered? Sign in."}
          </button>
        </div>
      </div>
    </div>
  );
};
