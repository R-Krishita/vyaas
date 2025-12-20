// src/pages/FarmerRecords.jsx
// View and manage farmer records

import React, { useState } from 'react';

const initialFarmers = [
  { id: 'F001', name: 'Rajesh Patil', phone: '98765xxxxx', district: 'Pune', state: 'Maharashtra', farmSize: 2.5, lastRec: 'Tulsi', date: '2024-12-10' },
  { id: 'F002', name: 'Suresh Kumar', phone: '98234xxxxx', district: 'Nagpur', state: 'Maharashtra', farmSize: 5.0, lastRec: 'Ashwagandha', date: '2024-12-09' },
  { id: 'F003', name: 'Mahesh Deshmukh', phone: '99876xxxxx', district: 'Mumbai', state: 'Maharashtra', farmSize: 1.5, lastRec: 'Turmeric', date: '2024-12-08' },
  { id: 'F004', name: 'Ganesh Jadhav', phone: '97654xxxxx', district: 'Nashik', state: 'Maharashtra', farmSize: 3.0, lastRec: 'Tulsi', date: '2024-12-07' },
  { id: 'F005', name: 'Ramesh Shinde', phone: '96543xxxxx', district: 'Pune', state: 'Maharashtra', farmSize: 4.0, lastRec: 'Brahmi', date: '2024-12-06' },
  { id: 'F006', name: 'Dinesh Pawar', phone: '95432xxxxx', district: 'Nagpur', state: 'Maharashtra', farmSize: 2.0, lastRec: 'Ashwagandha', date: '2024-12-05' },
  { id: 'F007', name: 'Prakash More', phone: '94321xxxxx', district: 'Nashik', state: 'Maharashtra', farmSize: 6.0, lastRec: 'Turmeric', date: '2024-12-04' },
];

const FarmerRecords = () => {
  const [farmers] = useState(initialFarmers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('All');
  const [filterDistrict, setFilterDistrict] = useState('All');

  const filteredFarmers = farmers.filter(farmer => {
    const matchesSearch = farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         farmer.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = filterState === 'All' || farmer.state === filterState;
    const matchesDistrict = filterDistrict === 'All' || farmer.district === filterDistrict;
    return matchesSearch && matchesState && matchesDistrict;
  });

  const districts = [...new Set(farmers.map(f => f.district))];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">👥 Farmer Records</h1>
        <button className="btn btn-secondary">
          📥 Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="search-bar" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Search by name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: '1', minWidth: '200px' }}
        />
        <select 
          className="form-select"
          style={{ width: '180px' }}
          value={filterState}
          onChange={(e) => setFilterState(e.target.value)}
        >
          <option value="All">All States</option>
          <option value="Maharashtra">Maharashtra</option>
        </select>
        <select 
          className="form-select"
          style={{ width: '180px' }}
          value={filterDistrict}
          onChange={(e) => setFilterDistrict(e.target.value)}
        >
          <option value="All">All Districts</option>
          {districts.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select className="form-select" style={{ width: '180px' }}>
          <option>Last 30 days</option>
          <option>Last 7 days</option>
          <option>Last 90 days</option>
          <option>All time</option>
        </select>
      </div>

      {/* Stats Summary */}
      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card">
          <div className="stat-value">{filteredFarmers.length}</div>
          <div className="stat-label">Farmers Found</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{filteredFarmers.reduce((sum, f) => sum + f.farmSize, 0).toFixed(1)}</div>
          <div className="stat-label">Total Acres</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{districts.length}</div>
          <div className="stat-label">Districts</div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Farmer Name</th>
                <th>Phone</th>
                <th>District</th>
                <th>Farm Size</th>
                <th>Last Recommendation</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFarmers.map(farmer => (
                <tr key={farmer.id}>
                  <td><strong>{farmer.id}</strong></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '20px' }}>👨‍🌾</span>
                      {farmer.name}
                    </div>
                  </td>
                  <td>{farmer.phone}</td>
                  <td>{farmer.district}</td>
                  <td>{farmer.farmSize} acres</td>
                  <td>
                    <span className="badge badge-success">🌿 {farmer.lastRec}</span>
                  </td>
                  <td>{farmer.date}</td>
                  <td>
                    <button className="btn-icon" title="View Details">👁️</button>
                    <button className="btn-icon" title="Send Message">💬</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div style={{ 
          marginTop: '16px', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#757575', 
          fontSize: '14px' 
        }}>
          <span>Showing {filteredFarmers.length} of {farmers.length} farmers</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" style={{ padding: '6px 12px' }}>← Prev</button>
            <button className="btn btn-secondary" style={{ padding: '6px 12px', background: '#2E7D32', color: 'white' }}>1</button>
            <button className="btn btn-secondary" style={{ padding: '6px 12px' }}>2</button>
            <button className="btn btn-secondary" style={{ padding: '6px 12px' }}>3</button>
            <button className="btn btn-secondary" style={{ padding: '6px 12px' }}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerRecords;
