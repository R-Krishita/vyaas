// src/App.jsx
// Admin Panel Main App with routing and layout

import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CropsDatabase from './pages/CropsDatabase';
import FarmerRecords from './pages/FarmerRecords';
import Chatbot from './components/Chatbot';

const Sidebar = () => (
  <aside className="sidebar">
    <div className="sidebar-header">
      <div className="sidebar-logo">🌿</div>
      <div className="sidebar-title">Smart Ayurvedic</div>
      <div className="sidebar-subtitle">Admin Panel</div>
    </div>
    <nav>
      <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="nav-icon">📊</span>
        <span>Dashboard</span>
      </NavLink>
      <NavLink to="/crops" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="nav-icon">🌾</span>
        <span>Crops Database</span>
      </NavLink>
      <NavLink to="/farmers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="nav-icon">👥</span>
        <span>Farmer Records</span>
      </NavLink>
      <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="nav-icon">⚙️</span>
        <span>Settings</span>
      </NavLink>
    </nav>
  </aside>
);

function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/crops" element={<CropsDatabase />} />
          <Route path="/farmers" element={<FarmerRecords />} />
        </Routes>
      </main>
      <Chatbot />
    </div>
  );
}

export default App;
