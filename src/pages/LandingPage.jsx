import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarCheck,
  ArrowRight,
  Info,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
  ExternalLink,
  User,
  CodeXml,
} from 'lucide-react';
import { useCanvasStore } from '../store/useCanvasStore';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4';

const fadeStyle = (delayMs) => ({
  animationDelay: `${delayMs}ms`,
});

/* ── Developer data ───────────────────────────────── */
const DEVELOPERS = [
  {
    name: 'Jay K',
    role: 'Full-Stack Developer & Lead Architect',
    bio: 'Passionate about building beautiful, high-performance web applications. Architected the Daily Canvas from ground up — from the secure Express backend to the cinematic React frontend.',
    avatar: 'JK',
    github: '#',
    linkedin: '#',
  },
  {
    name: 'Kus',
    role: 'Full-Stack Developer & Collaborator',
    bio: 'Focused on robust API design and seamless user experiences. Contributed to core scheduling features and real-time canvas state management.',
    avatar: 'KS',
    github: '#',
    linkedin: '#',
  },
];

/* ================================================================== */
export function LandingPage() {
  const [aboutOpen, setAboutOpen] = useState(false);
  const navigate = useNavigate();
  const { setAuthToken } = useCanvasStore();

  const handlePlanDay = () => navigate('/dashboard');

  const handleLogout = () => {
    setAuthToken(null);
    navigate('/');
  };

  return (
    <div className="landing-page">
      {/* ── Background Video ─────────────────────────── */}
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

      {/* ── Minimal Navbar ───────────────────────────── */}
      <nav className="landing-nav">
        <a
          href="#"
          className="landing-nav__logo animate-blur-fade-up"
          style={fadeStyle(0)}
          onClick={(e) => e.preventDefault()}
        >
          DAILY CANVAS
        </a>

        <div className="landing-nav__actions" style={{ display: 'flex' }}>
          <button
            className="landing-btn-circle liquid-glass animate-blur-fade-up"
            style={fadeStyle(200)}
            onClick={handleLogout}
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      {/* ── Hero Content ─────────────────────────────── */}
      <main className="landing-hero">
        <div className="landing-hero__inner">
          {/* Left side */}
          <div className="landing-hero__left">
            {/* Title */}
            <h1
              className="landing-title animate-blur-fade-up"
              style={fadeStyle(200)}
            >
              Step Through. Work&nbsp;Smarter.
            </h1>

            {/* Description */}
            <p
              className="landing-desc animate-blur-fade-up"
              style={fadeStyle(350)}
            >
              Work is not a responsibility but a necessity.
            </p>

            {/* CTA Buttons */}
            <div className="landing-ctas">
              <button
                className="landing-btn-primary animate-blur-fade-up"
                style={fadeStyle(500)}
                onClick={handlePlanDay}
              >
                <CalendarCheck size={18} />
                Plan the Day
                <ArrowRight size={16} className="landing-btn-primary__arrow" />
              </button>
              <button
                className="landing-btn-secondary liquid-glass animate-blur-fade-up"
                style={fadeStyle(600)}
                onClick={() => setAboutOpen(true)}
              >
                <Info size={16} />
                Learn More
              </button>
            </div>
          </div>

          {/* Right side – arrows */}
          <div className="landing-arrows">
            <button
              className="landing-btn-arrow liquid-glass animate-blur-fade-up"
              style={fadeStyle(700)}
            >
              <ChevronLeft size={18} />
              Previous
            </button>
            <button
              className="landing-btn-arrow liquid-glass animate-blur-fade-up"
              style={fadeStyle(800)}
            >
              Next
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </main>

      {/* ── About Developers Modal ───────────────────── */}
      {aboutOpen && (
        <div className="about-overlay" onClick={() => setAboutOpen(false)}>
          <div
            className="about-modal animate-blur-fade-up"
            style={fadeStyle(0)}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              className="about-modal__close liquid-glass"
              onClick={() => setAboutOpen(false)}
            >
              <X size={18} />
            </button>

            <h2 className="about-modal__title">
              <CodeXml size={22} />
              Meet the Developers
            </h2>
            <p className="about-modal__subtitle">
              The minds behind Daily Canvas
            </p>

            <div className="about-devs">
              {DEVELOPERS.map((dev) => (
                <div key={dev.name} className="about-dev-card liquid-glass">
                  <div className="about-dev-card__avatar">{dev.avatar}</div>
                  <h3 className="about-dev-card__name">{dev.name}</h3>
                  <span className="about-dev-card__role">{dev.role}</span>
                  <p className="about-dev-card__bio">{dev.bio}</p>
                  <div className="about-dev-card__links">
                    <a href={dev.github} className="liquid-glass about-dev-card__link" title="GitHub">
                      <ExternalLink size={16} />
                    </a>
                    <a href={dev.linkedin} className="liquid-glass about-dev-card__link" title="LinkedIn">
                      <User size={16} />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="about-modal__footer">
              Built with React, Express, SQLite & a lot of ☕
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
