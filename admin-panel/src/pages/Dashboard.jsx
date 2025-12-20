// src/pages/Dashboard.jsx
// Admin Dashboard with key metrics and analytics

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Demo data
const weeklyData = [
  { week: 'W1', farmers: 120, recommendations: 89 },
  { week: 'W2', farmers: 145, recommendations: 112 },
  { week: 'W3', farmers: 180, recommendations: 156 },
  { week: 'W4', farmers: 210, recommendations: 189 },
];

const popularCrops = [
  { name: 'Tulsi', percentage: 45 },
  { name: 'Turmeric', percentage: 25 },
  { name: 'Ashwagandha', percentage: 20 },
  { name: 'Others', percentage: 10 },
];

const topDistricts = [
  { name: 'Pune', count: 320 },
  { name: 'Nagpur', count: 245 },
  { name: 'Mumbai', count: 198 },
  { name: 'Nashik', count: 156 },
];

const Dashboard = () => {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📊 Dashboard</h1>
        <span style={{ color: '#757575' }}>Last updated: Today, 10:30 AM</span>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">1,234</div>
          <div className="stat-label">Total Farmers</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🌾</div>
          <div className="stat-value">15</div>
          <div className="stat-label">Ayurvedic Crops</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-value">546</div>
          <div className="stat-label">Recommendations</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-value">₹42,500</div>
          <div className="stat-label">Avg. Profit/Acre</div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Farmers Trend Chart */}
        <div className="card">
          <div className="card-title">📈 Farmer Registrations (This Month)</div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis dataKey="week" stroke="#757575" />
                <YAxis stroke="#757575" />
                <Tooltip />
                <Line type="monotone" dataKey="farmers" stroke="#2E7D32" strokeWidth={2} dot={{ fill: '#2E7D32' }} />
                <Line type="monotone" dataKey="recommendations" stroke="#FFC107" strokeWidth={2} dot={{ fill: '#FFC107' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Crops */}
        <div className="card">
          <div className="card-title">🏆 Popular Crops</div>
          {popularCrops.map((crop, index) => (
            <div key={crop.name} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>{index + 1}. {crop.name}</span>
                <span style={{ fontWeight: 600, color: '#2E7D32' }}>{crop.percentage}%</span>
              </div>
              <div style={{ 
                height: '8px', 
                background: '#E0E0E0', 
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${crop.percentage}%`, 
                  height: '100%', 
                  background: '#4CAF50',
                  borderRadius: '4px'
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        {/* Top Districts */}
        <div className="card">
          <div className="card-title">📍 Top Districts</div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topDistricts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis type="number" stroke="#757575" />
                <YAxis dataKey="name" type="category" stroke="#757575" width={60} />
                <Tooltip />
                <Bar dataKey="count" fill="#2E7D32" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-title">🕐 Recent Activity</div>
          <div style={{ fontSize: '14px' }}>
            {[
              { icon: '👤', text: 'New farmer registered from Pune', time: '2 min ago' },
              { icon: '🌿', text: 'Tulsi recommendation generated', time: '5 min ago' },
              { icon: '📊', text: 'Market price updated for Turmeric', time: '12 min ago' },
              { icon: '📋', text: 'PDF plan downloaded', time: '18 min ago' },
              { icon: '💬', text: 'Chatbot query answered', time: '25 min ago' },
            ].map((activity, i) => (
              <div key={i} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '10px 0',
                borderBottom: i < 4 ? '1px solid #E0E0E0' : 'none'
              }}>
                <span style={{ fontSize: '20px', marginRight: '12px' }}>{activity.icon}</span>
                <div style={{ flex: 1 }}>
                  <div>{activity.text}</div>
                  <div style={{ color: '#757575', fontSize: '12px' }}>{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
