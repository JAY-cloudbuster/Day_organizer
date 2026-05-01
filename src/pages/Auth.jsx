import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCanvasStore } from '../store/useCanvasStore';
import { Loader2, LogIn, UserPlus, Mail, Lock, ArrowRight } from 'lucide-react';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4';

const fadeStyle = (delayMs) => ({
  animationDelay: `${delayMs}ms`,
});

export const Auth = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const navigate = useNavigate();
  const { setAuthToken } = useCanvasStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    /* Force dark appearance on auth page to match cinematic vibe */
    const prev = document.body.getAttribute('data-theme');
    document.body.setAttribute('data-theme', 'dark');
    return () => {
      if (prev) document.body.setAttribute('data-theme', prev);
    };
  }, []);

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
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      if (isLogin) {
        setAuthToken(data.token);
        navigate('/landing');
      } else {
        setMsg('Registration successful! You can now login.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-page">
      {/* ── Background Video ── */}
      <video
        className="landing-video-bg"
        src={VIDEO_URL}
        autoPlay
        loop
        muted
        playsInline
      />

      {/* ── Bottom Blur Overlay ── */}
      <div className="landing-blur-overlay" />

      {/* ── Centered Auth Card ── */}
      <div className="auth-container">
        <div className="auth-card animate-blur-fade-up" style={fadeStyle(100)}>
          {/* Logo mark */}
          <div className="auth-logo animate-blur-fade-up" style={fadeStyle(0)}>
            <div className="auth-logo__icon">D</div>
          </div>

          <h1 className="auth-title animate-blur-fade-up" style={fadeStyle(150)}>
            Daily Canvas
          </h1>
          <p className="auth-subtitle animate-blur-fade-up" style={fadeStyle(200)}>
            {isLogin
              ? 'Welcome back. Sign in to continue.'
              : 'Create your secure profile.'}
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="auth-msg auth-msg--error animate-blur-fade-up" style={fadeStyle(250)}>
                {error}
              </div>
            )}
            {msg && (
              <div className="auth-msg auth-msg--success animate-blur-fade-up" style={fadeStyle(250)}>
                {msg}
              </div>
            )}

            <div className="auth-input-wrap animate-blur-fade-up" style={fadeStyle(300)}>
              <Mail size={18} className="auth-input-icon" />
              <input
                type="email"
                placeholder="Email address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
              />
            </div>

            <div className="auth-input-wrap animate-blur-fade-up" style={fadeStyle(400)}>
              <Lock size={18} className="auth-input-icon" />
              <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-submit animate-blur-fade-up"
              style={fadeStyle(500)}
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="auth-spinner" />
                  Processing...
                </>
              ) : isLogin ? (
                <>
                  <LogIn size={18} />
                  Sign In
                  <ArrowRight size={16} className="auth-submit__arrow" />
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Register Securely
                </>
              )}
            </button>
          </form>

          <div className="auth-switch animate-blur-fade-up" style={fadeStyle(600)}>
            <button onClick={() => { setIsLogin(!isLogin); setError(''); setMsg(''); }}>
              {isLogin ? "Need an account? Register." : "Already registered? Sign in."}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
