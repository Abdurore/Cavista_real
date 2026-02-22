import React from 'react';
import logo from '../assets/logo.png';
import adultIcon from '../assets/adult.png';
import pregIcon from '../assets/preg.png';
import '../styles/ProfileSelection.css';

const ProfileSelection = ({ onSelectAdult, onSelectPregnant, onBack }) => {
  return (
    <div className="profile-container">
      {/* Back button */}
      <button className="back-btn" onClick={onBack}>← Back</button>

      {/* Left Side - Branding */}
      <div className="left-brand">
        <div className="logo-section">
          <img src={logo} alt="PreventAI logo" className="brain-logo" />
          <h1 className="brand-name">PreventAI</h1>
        </div>
        
        <h2 className="main-title">Your health, predicted</h2>
        
        <p className="description">
          PreventAI uses advance analytics to turn your daily habits into a roadmap for healthier future
        </p>
      </div>

      {/* Right Side - Profile Selection */}
      <div className="right-selection">
        <div className="profiles">
          {/* General Adult Card */}
          <div className="profile-card" onClick={onSelectAdult}>
            <div className="icon-circle">
              <img src={adultIcon} alt="General Adult" className="profile-icon" />
            </div>
            <h3 className="profile-title">General Adult</h3>
            <p className="profile-subtitle">Optimizing longevity and daily wellness</p>
          </div>

          {/* Maternal Care Card */}
          <div className="profile-card" onClick={onSelectPregnant}>
            <div className="icon-circle">
              <img src={pregIcon} alt="Maternal Care" className="profile-icon" />
            </div>
            <h3 className="profile-title">Maternal Care</h3>
            <p className="profile-subtitle">Specialized monitoring for you and your baby</p>
          </div>
        </div>
      </div>

      {/* Footer - Centered at bottom */}
      <p className="footer-text">Trusted by 2m+ user worldwide</p>
    </div>
  );
};

export default ProfileSelection;