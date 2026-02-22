import React from 'react';
import logo from '../assets/logo.png';
import '../styles/WelcomePage.css';

const WelcomePage = ({ onContinue }) => {
  console.log('Logo import:', logo); // Check if this is undefined or has a path
  
  return (
    <div className="welcome-container">
      <div className="content">
        <div className="logo-section">
          <img 
            src={logo} 
            alt="PreventAI logo" 
            className="brain-logo"
            onError={(e) => {
              console.log('Image failed to load:', e);
              e.target.style.display = 'none'; // Hides broken image
            }}
          />
          <h1 className="brand-name">PreventAI</h1>
        </div>
        
        <p className="description">
          Your AI health partner for adults and pregnant women
        </p>
        
        <button className="continue-btn" onClick={onContinue}>
          Continue
        </button>
      </div>
    </div>
  );
};

export default WelcomePage;