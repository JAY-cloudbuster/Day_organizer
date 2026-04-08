import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Workspace } from './pages/Workspace';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/canvas/:id" element={<Workspace />} />
      </Routes>
    </BrowserRouter>
  );
}
