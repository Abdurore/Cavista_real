import React, { useState } from 'react';
import logo from '../assets/logo.png';
import '../styles/PregnantForm.css';

const PregnantForm = ({ onSubmit, onBack }) => {
  const [formData, setFormData] = useState({
    age: '',
    height: '',
    weight: '',
    gestationalAge: '',
    firstPregnancy: '',
    highRiskHistory: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    bloodSugar: '',
    sleep: '',
    waterIntake: '',
    stress: 3
  });

  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const stressLevels = [
    { value: 1, label: 'Very Low', color: '#10b981', emoji: '😌', desc: 'Minimal stress' },
    { value: 2, label: 'Low', color: '#34d399', emoji: '🙂', desc: 'Occasional worries' },
    { value: 3, label: 'Moderate', color: '#f59e0b', emoji: '😐', desc: 'Manageable stress' },
    { value: 4, label: 'High', color: '#f97316', emoji: '😟', desc: 'Frequent stress' },
    { value: 5, label: 'Very High', color: '#ef4444', emoji: '😰', desc: 'Constant stress' }
  ];

  const currentStress = stressLevels.find(s => s.value === formData.stress) || stressLevels[2];

  // Calculate pregnancy progress for visual indicator
  const pregnancyProgress = (formData.gestationalAge / 40) * 100;

  return (
    <div className="pregnant-form-container">
      {/* Animated maternal background elements */}
      <div className="pregnant-bg-blob pregnant-blob-1"></div>
      <div className="pregnant-bg-blob pregnant-blob-2"></div>
      <div className="pregnant-bg-heartbeat">
        <svg viewBox="0 0 100 20" className="pregnant-heartbeat-line">
          <path d="M0 10 L20 10 L25 5 L30 15 L35 8 L40 12 L45 10 L100 10" 
                stroke="rgba(187,36,62,0.1)" 
                strokeWidth="2" 
                fill="none" />
        </svg>
      </div>

      {/* Header */}
      <div className="pregnant-form-header">
        <div className="pregnant-logo-wrapper" onClick={onBack}>
          <img src={logo} alt="PreventAI" className="pregnant-logo" />
          <span className="pregnant-brand-name">PreventAI</span>
        </div>
        <button className="pregnant-back-btn" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>

      <div className="pregnant-form-content">
        {/* Title Section with Maternal Icon */}
        <div className="pregnant-title-section">
          <div className="pregnant-title-badge">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#bb243e" strokeWidth="2">
              <path d="M12 21C12 21 20 16 20 10C20 5 16 2 12 2C8 2 4 5 4 10C4 16 12 21 12 21Z" />
              <circle cx="12" cy="9" r="2" fill="#bb243e" />
            </svg>
            <span>Maternal Care</span>
          </div>
          <h1 className="pregnant-title">Maternal Health Assessment</h1>
          <p className="pregnant-subtitle">
            Fill in your details for personalized prenatal risk analysis
          </p>
        </div>

        {/* Pregnancy Progress Bar (if gestational age entered) */}
        {formData.gestationalAge && (
          <div className="pregnant-progress-container">
            <div className="pregnant-progress-header">
              <span className="pregnant-progress-label">Pregnancy Progress</span>
              <span className="pregnant-progress-value">{formData.gestationalAge} weeks</span>
            </div>
            <div className="pregnant-progress-bar">
              <div 
                className="pregnant-progress-fill"
                style={{ width: `${Math.min(pregnancyProgress, 100)}%` }}
              >
                <div className="pregnant-progress-shine"></div>
              </div>
            </div>
            <div className="pregnant-progress-markers">
              <span>1st Trimester</span>
              <span>2nd Trimester</span>
              <span>3rd Trimester</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="pregnant-form">
          {/* Row 1: Age, Height, Weight */}
          <div className="pregnant-form-row">
            <div className={`pregnant-input-card ${focusedField === 'age' ? 'focused' : ''}`}>
              <div className="pregnant-input-header">
                <i className="fa-solid fa-user pregnant-input-icon" aria-hidden="true"></i>
                <label>Age</label>
              </div>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                onFocus={() => setFocusedField('age')}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter your age"
                min="13"
                max="60"
                required
              />
            </div>

            <div className={`pregnant-input-card ${focusedField === 'height' ? 'focused' : ''}`}>
              <div className="pregnant-input-header">
                <i className="fa-solid fa-ruler-vertical pregnant-input-icon" aria-hidden="true"></i>
                <label>Height (cm)</label>
              </div>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                onFocus={() => setFocusedField('height')}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter height"
                min="100"
                max="250"
                required
              />
            </div>

            <div className={`pregnant-input-card ${focusedField === 'weight' ? 'focused' : ''}`}>
              <div className="pregnant-input-header">
                <i className="fa-solid fa-weight-scale pregnant-input-icon" aria-hidden="true"></i>
                <label>Weight (kg)</label>
              </div>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                onFocus={() => setFocusedField('weight')}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter weight"
                min="30"
                max="300"
                required
              />
            </div>
          </div>

          {/* Row 2: Pregnancy Details */}
          <div className="pregnant-form-row">
            <div className={`pregnant-input-card ${focusedField === 'gestationalAge' ? 'focused' : ''}`}>
              <div className="pregnant-input-header">
                <i className="fa-solid fa-calendar-week pregnant-input-icon" aria-hidden="true"></i>
                <label>Gestational Age</label>
              </div>
              <input
                type="number"
                name="gestationalAge"
                value={formData.gestationalAge}
                onChange={handleChange}
                onFocus={() => setFocusedField('gestationalAge')}
                onBlur={() => setFocusedField(null)}
                placeholder="Weeks"
                min="1"
                max="42"
                required
              />
            </div>

            <div className={`pregnant-input-card ${focusedField === 'firstPregnancy' ? 'focused' : ''}`}>
              <div className="pregnant-input-header">
                <i className="fa-solid fa-baby pregnant-input-icon" aria-hidden="true"></i>
                <label>First Pregnancy?</label>
              </div>
              <select 
                name="firstPregnancy" 
                value={formData.firstPregnancy} 
                onChange={handleChange}
                onFocus={() => setFocusedField('firstPregnancy')}
                onBlur={() => setFocusedField(null)}
                required
              >
                <option value="">Select...</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div className={`pregnant-input-card ${focusedField === 'highRiskHistory' ? 'focused' : ''}`}>
              <div className="pregnant-input-header">
                <i className="fa-solid fa-triangle-exclamation pregnant-input-icon" aria-hidden="true"></i>
                <label>High-Risk History?</label>
              </div>
              <select 
                name="highRiskHistory" 
                value={formData.highRiskHistory} 
                onChange={handleChange}
                onFocus={() => setFocusedField('highRiskHistory')}
                onBlur={() => setFocusedField(null)}
                required
              >
                <option value="">Select...</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>

          {/* Row 3: Blood Pressure & Blood Sugar */}
          <div className="pregnant-form-row">
            <div className={`pregnant-input-card pregnant-bp-card ${focusedField === 'bp' ? 'focused' : ''}`}>
              <div className="pregnant-input-header">
                <i className="fa-solid fa-heart-pulse pregnant-input-icon" aria-hidden="true"></i>
                <label>Blood Pressure</label>
              </div>
              <div className="pregnant-bp-inputs">
                <input
                  type="number"
                  name="bloodPressureSystolic"
                  value={formData.bloodPressureSystolic}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('bp')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Systolic (Avg: 120)"
                  required
                />
                <span className="pregnant-bp-divider">/</span>
                <input
                  type="number"
                  name="bloodPressureDiastolic"
                  value={formData.bloodPressureDiastolic}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('bp')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Diastolic (Avg: 80)"
                  required
                />
              </div>
            </div>

            <div className={`pregnant-input-card ${focusedField === 'bloodSugar' ? 'focused' : ''}`}>
              <div className="pregnant-input-header">
                <i className="fa-solid fa-droplet pregnant-input-icon" aria-hidden="true"></i>
                <label>Blood Sugar</label>
              </div>
              <input
                type="number"
                name="bloodSugar"
                value={formData.bloodSugar}
                onChange={handleChange}
                onFocus={() => setFocusedField('bloodSugar')}
                onBlur={() => setFocusedField(null)}
                placeholder="mg/dL (Avg: 100)"
                step="0.1"
                required
              />
            </div>
          </div>

          {/* Row 4: Sleep & Water */}
          <div className="pregnant-form-row">
            <div className={`pregnant-input-card ${focusedField === 'sleep' ? 'focused' : ''}`}>
              <div className="pregnant-input-header">
                <i className="fa-solid fa-bed pregnant-input-icon" aria-hidden="true"></i>
                <label>Sleep (hours)</label>
              </div>
              <input
                type="number"
                name="sleep"
                value={formData.sleep}
                onChange={handleChange}
                onFocus={() => setFocusedField('sleep')}
                onBlur={() => setFocusedField(null)}
                placeholder="Hours per night"
                min="0"
                max="24"
                step="0.5"
                required
              />
            </div>

            <div className={`pregnant-input-card ${focusedField === 'waterIntake' ? 'focused' : ''}`}>
              <div className="pregnant-input-header">
                <i className="fa-solid fa-glass-water pregnant-input-icon" aria-hidden="true"></i>
                <label>Water Intake</label>
              </div>
              <input
                type="number"
                name="waterIntake"
                value={formData.waterIntake}
                onChange={handleChange}
                onFocus={() => setFocusedField('waterIntake')}
                onBlur={() => setFocusedField(null)}
                placeholder="Liters per day"
                min="0"
                max="10"
                step="0.1"
                required
              />
            </div>
          </div>

          {/* Enhanced Stress Level Section */}
          <div className="pregnant-stress-container">
            <div className="pregnant-stress-header">
              <label className="pregnant-stress-label">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
                Stress Level
              </label>
              <div className="pregnant-stress-value" style={{ color: currentStress.color }}>
                <span className="pregnant-stress-emoji">{currentStress.emoji}</span>
                <span className="pregnant-stress-label-text">{currentStress.label}</span>
                <span className="pregnant-stress-desc">{currentStress.desc}</span>
              </div>
            </div>

            <div className="pregnant-slider-wrapper">
              <input
                type="range"
                name="stress"
                min="1"
                max="5"
                value={formData.stress}
                onChange={handleChange}
                className="pregnant-stress-slider"
                style={{
                  background: `linear-gradient(90deg, 
                    ${stressLevels[0].color} 0%, 
                    ${stressLevels[1].color} 25%, 
                    ${stressLevels[2].color} 50%, 
                    ${stressLevels[3].color} 75%, 
                    ${stressLevels[4].color} 100%)`
                }}
              />
              
              {/* Interactive markers */}
              <div className="pregnant-slider-markers">
                {stressLevels.map((level) => (
                  <div
                    key={level.value}
                    className={`pregnant-marker ${formData.stress >= level.value ? 'active' : ''}`}
                    style={{ left: `${(level.value - 1) * 25}%` }}
                    onClick={() => setFormData(prev => ({ ...prev, stress: level.value }))}
                  >
                    <span className="pregnant-marker-dot" style={{ background: level.color }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Stress level cards */}
            <div className="pregnant-stress-cards">
              {stressLevels.map((level) => (
                <div
                  key={level.value}
                  className={`pregnant-stress-card ${formData.stress === level.value ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, stress: level.value }))}
                  style={{ '--card-color': level.color }}
                >
                  <div className="pregnant-card-indicator" style={{ background: level.color }} />
                  <div className="pregnant-card-content">
                    <span className="pregnant-card-emoji">{level.emoji}</span>
                    <div className="pregnant-card-info">
                      <span className="pregnant-card-label">{level.label}</span>
                      <span className="pregnant-card-desc">{level.desc}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stress warning for high levels */}
            {formData.stress >= 4 && (
              <div className="pregnant-stress-warning">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <circle cx="12" cy="16" r="1" fill="currentColor" />
                </svg>
                <span>Consider speaking with your healthcare provider about stress management.</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button type="submit" className="pregnant-submit-btn">
            <span>Analyze Pregnancy Risk</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default PregnantForm;
