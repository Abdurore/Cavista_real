import React from 'react';
import logo from '../assets/logo.png';
import editIcon from '../assets/edit-property.png';
import appleWatchIcon from '../assets/apple-watch.png';
import '../styles/DataInput.css';

const DataInput = ({ onSelectMethod, onBack }) => {
  return (
    <div className="data-container">
      {/* Back button */}
      <button className="back-btn" onClick={onBack}>← Back</button>

      {/* Cool Header with Wave Effect */}
      <div className="header-wave">
        <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="wave">
          <path d="M0.00,49.98 C150.00,150.00 349.20,-50.00 500.00,49.98 L500.00,150.00 L0.00,150.00 Z" />
        </svg>
        <div className="header-content">
          <div className="logo-section">
            <img src={logo} alt="PreventAI logo" className="brain-logo" />
            <h1 className="brand-name">PreventAI</h1>
          </div>
          <h2 className="header-title">How would you like to input your data?</h2>
        </div>
      </div>

      {/* Cards Container */}
      <div className="cards-container">
        {/* Manual Input Card - White */}
        <div className="data-card manual-card" onClick={() => onSelectMethod('manual')}>
          <div className="card-icon">
            <img src={editIcon} alt="Manual input" />
          </div>
          <h3 className="card-title">Manual input</h3>
          <p className="card-desc">Enter your data manually</p>
        </div>

        {/* Connect Device Card - Gradient Red */}
        <div className="data-card device-card" onClick={() => onSelectMethod('device')}>
          <div className="card-icon">
            <img src={appleWatchIcon} alt="Connect Device" />
          </div>
          <h3 className="card-title">Connect Device</h3>
          <p className="card-desc">Sync data from your smartwatch</p>
        </div>
      </div>
    </div>
  );
};

export default DataInput;