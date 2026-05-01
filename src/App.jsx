import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Workspace } from './pages/Workspace';
import { Schedule } from './pages/Schedule';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/canvas/:id" element={<Workspace />} />
        <Route path="/schedule/:id" element={<Schedule />} />
      </Routes>
    </BrowserRouter>
  );
}

