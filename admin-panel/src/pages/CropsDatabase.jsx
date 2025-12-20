// src/pages/CropsDatabase.jsx
// Manage Ayurvedic crops database

import React, { useState } from 'react';

const initialCrops = [
  { id: 1, name: 'Tulsi', nameHi: 'तुलसी', type: 'Medicinal', minPh: 5.5, maxPh: 7.5, minRainfall: 600, maxRainfall: 1200 },
  { id: 2, name: 'Ashwagandha', nameHi: 'अश्वगंधा', type: 'Medicinal', minPh: 7.0, maxPh: 8.0, minRainfall: 500, maxRainfall: 800 },
  { id: 3, name: 'Turmeric', nameHi: 'हल्दी', type: 'Spice', minPh: 5.5, maxPh: 7.0, minRainfall: 1000, maxRainfall: 2000 },
  { id: 4, name: 'Aloe Vera', nameHi: 'एलोवेरा', type: 'Medicinal', minPh: 6.0, maxPh: 8.0, minRainfall: 300, maxRainfall: 600 },
  { id: 5, name: 'Shatavari', nameHi: 'शतावरी', type: 'Medicinal', minPh: 6.0, maxPh: 7.5, minRainfall: 800, maxRainfall: 1500 },
  { id: 6, name: 'Brahmi', nameHi: 'ब्राह्मी', type: 'Medicinal', minPh: 6.0, maxPh: 7.0, minRainfall: 1000, maxRainfall: 2000 },
  { id: 7, name: 'Giloy', nameHi: 'गिलोय', type: 'Medicinal', minPh: 6.5, maxPh: 7.5, minRainfall: 700, maxRainfall: 1400 },
  { id: 8, name: 'Neem', nameHi: 'नीम', type: 'Tree', minPh: 6.0, maxPh: 8.0, minRainfall: 400, maxRainfall: 1200 },
];

const CropsDatabase = () => {
  const [crops, setCrops] = useState(initialCrops);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [showModal, setShowModal] = useState(false);

  const filteredCrops = crops.filter(crop => {
    const matchesSearch = crop.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || crop.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🌾 Crops Database</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          ➕ Add New Crop
        </button>
      </div>

      {/* Search & Filter */}
      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Search crops..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="form-select" 
          style={{ width: '200px' }}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="All">All Types</option>
          <option value="Medicinal">Medicinal</option>
          <option value="Spice">Spice</option>
          <option value="Tree">Tree</option>
        </select>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Crop Name</th>
                <th>Hindi Name</th>
                <th>Type</th>
                <th>pH Range</th>
                <th>Rainfall (mm)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCrops.map(crop => (
                <tr key={crop.id}>
                  <td>{String(crop.id).padStart(3, '0')}</td>
                  <td>
                    <strong>{crop.name}</strong>
                  </td>
                  <td>{crop.nameHi}</td>
                  <td>
                    <span className={`badge ${crop.type === 'Medicinal' ? 'badge-success' : 'badge-warning'}`}>
                      {crop.type}
                    </span>
                  </td>
                  <td>{crop.minPh} - {crop.maxPh}</td>
                  <td>{crop.minRainfall} - {crop.maxRainfall}</td>
                  <td>
                    <button className="btn-icon" title="Edit">✏️</button>
                    <button className="btn-icon" title="Delete">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div style={{ marginTop: '16px', color: '#757575', fontSize: '14px' }}>
          Showing {filteredCrops.length} of {crops.length} crops
        </div>
      </div>

      {/* Add Crop Modal (simplified) */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ width: '500px', margin: '0' }}>
            <h2 style={{ marginBottom: '20px' }}>➕ Add New Crop</h2>
            <div className="form-group">
              <label className="form-label">Crop Name (English)</label>
              <input type="text" className="form-input" placeholder="e.g., Tulsi" />
            </div>
            <div className="form-group">
              <label className="form-label">Hindi Name</label>
              <input type="text" className="form-input" placeholder="e.g., तुलसी" />
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-select">
                <option>Medicinal</option>
                <option>Spice</option>
                <option>Tree</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Min pH</label>
                <input type="number" className="form-input" placeholder="5.5" step="0.1" />
              </div>
              <div className="form-group">
                <label className="form-label">Max pH</label>
                <input type="number" className="form-input" placeholder="7.5" step="0.1" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>
                Save Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropsDatabase;
