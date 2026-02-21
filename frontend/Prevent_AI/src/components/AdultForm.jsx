import React, { useState } from 'react';
import logo from '../assets/logo.png';
import editIcon from '../assets/edit-property.png';
import '../styles/AdultForm.css';

const AdultForm = ({ onSubmit, onBack }) => {
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    bloodSugar: '',
    sleep: '',
    exercise: '',
    stress: 3
  });

  const [focusedField, setFocusedField] = useState(null);
  const [showGenderError, setShowGenderError] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.gender) {
      setShowGenderError(true);
      setFocusedField('gender');
      return;
    }

    onSubmit(formData);
  };

  const stressLevels = [
    { value: 1, label: 'Very Low', color: '#10b981', emoji: '😌' },
    { value: 2, label: 'Low', color: '#34d399', emoji: '🙂' },
    { value: 3, label: 'Moderate', color: '#f59e0b', emoji: '😐' },
    { value: 4, label: 'High', color: '#f97316', emoji: '😟' },
    { value: 5, label: 'Very High', color: '#ef4444', emoji: '😰' }
  ];

  const currentStress = stressLevels.find(s => s.value === formData.stress) || stressLevels[2];
  const genderOptions = ['male', 'female', 'other'];

  return (
    <div className="adult-form-container">
      {/* Animated background blobs */}
      <div className="adult-bg-blob adult-blob-1"></div>
      <div className="adult-bg-blob adult-blob-2"></div>

      {/* Header */}
      <div className="adult-form-header">
        <div className="adult-logo-wrapper" onClick={onBack}>
          <img src={logo} alt="PreventAI" className="adult-logo" />
          <span className="adult-brand-name">PreventAI</span>
        </div>
        <button className="adult-back-btn" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>

      <div className="adult-form-content">
        {/* Title Section */}
        <div className="adult-title-section">
          <h1 className="adult-title">General Adult Health Assessment</h1>
          <p className="adult-subtitle">
            Fill in your details for a personalized health risk analysis
          </p>
        </div>

        <form onSubmit={handleSubmit} className="adult-form">
          {/* Row 1: Age & Gender */}
          <div className="adult-form-row">
            <div className={`adult-input-card ${focusedField === 'age' ? 'focused' : ''}`}>
              <div className="adult-input-header">
                <img src={editIcon} alt="" className="adult-input-icon" />
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
                min="18"
                max="120"
                required
              />
            </div>

            <div className={`adult-input-card ${focusedField === 'gender' ? 'focused' : ''}`}>
              <div className="adult-input-header">
                <img src={editIcon} alt="" className="adult-input-icon" />
                <label>Gender</label>
              </div>
              <div className="adult-gender-options" role="radiogroup" aria-label="Gender">
                {genderOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={formData.gender === option}
                    className={`adult-gender-option ${formData.gender === option ? 'selected' : ''}`}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, gender: option }));
                      setShowGenderError(false);
                    }}
                    onFocus={() => setFocusedField('gender')}
                    onBlur={() => setFocusedField(null)}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
              {showGenderError && <p className="adult-field-error">Please select a gender option.</p>}
            </div>
          </div>

          {/* Row 2: Height & Weight */}
          <div className="adult-form-row">
            <div className={`adult-input-card ${focusedField === 'height' ? 'focused' : ''}`}>
              <div className="adult-input-header">
                <img src={editIcon} alt="" className="adult-input-icon" />
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

            <div className={`adult-input-card ${focusedField === 'weight' ? 'focused' : ''}`}>
              <div className="adult-input-header">
                <img src={editIcon} alt="" className="adult-input-icon" />
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

          {/* Row 3: Blood Pressure & Blood Sugar */}
          <div className="adult-form-row">
            <div className={`adult-input-card adult-bp-card ${focusedField === 'bp' ? 'focused' : ''}`}>
              <div className="adult-input-header">
                <img src={editIcon} alt="" className="adult-input-icon" />
                <label>Blood Pressure</label>
              </div>
              <div className="adult-bp-inputs">
                <input
                  type="number"
                  name="bloodPressureSystolic"
                  value={formData.bloodPressureSystolic}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('bp')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Systolic"
                  required
                />
                <span className="adult-bp-divider">/</span>
                <input
                  type="number"
                  name="bloodPressureDiastolic"
                  value={formData.bloodPressureDiastolic}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('bp')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Diastolic"
                  required
                />
              </div>
            </div>

            <div className={`adult-input-card ${focusedField === 'bloodSugar' ? 'focused' : ''}`}>
              <div className="adult-input-header">
                <img src={editIcon} alt="" className="adult-input-icon" />
                <label>Blood Sugar</label>
              </div>
              <input
                type="number"
                name="bloodSugar"
                value={formData.bloodSugar}
                onChange={handleChange}
                onFocus={() => setFocusedField('bloodSugar')}
                onBlur={() => setFocusedField(null)}
                placeholder="mg/dL"
                step="0.1"
                required
              />
            </div>
          </div>

          {/* Row 4: Sleep & Exercise */}
          <div className="adult-form-row">
            <div className={`adult-input-card ${focusedField === 'sleep' ? 'focused' : ''}`}>
              <div className="adult-input-header">
                <img src={editIcon} alt="" className="adult-input-icon" />
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

            <div className={`adult-input-card ${focusedField === 'exercise' ? 'focused' : ''}`}>
              <div className="adult-input-header">
                <img src={editIcon} alt="" className="adult-input-icon" />
                <label>Exercise (days/week)</label>
              </div>
              <input
                type="number"
                name="exercise"
                value={formData.exercise}
                onChange={handleChange}
                onFocus={() => setFocusedField('exercise')}
                onBlur={() => setFocusedField(null)}
                placeholder="Days per week"
                min="0"
                max="7"
                required
              />
            </div>
          </div>

          {/* Stress Level - Enhanced Slider */}
          <div className="adult-stress-container">
            <div className="adult-stress-header">
              <label className="adult-stress-label">Stress Level</label>
              <div className="adult-stress-value" style={{ color: currentStress.color }}>
                <span className="adult-stress-emoji">{currentStress.emoji}</span>
                {currentStress.label}
              </div>
            </div>

            <div className="adult-slider-wrapper">
              <input
                type="range"
                name="stress"
                min="1"
                max="5"
                value={formData.stress}
                onChange={handleChange}
                className="adult-stress-slider"
                style={{
                  background: `linear-gradient(90deg, 
                    ${stressLevels[0].color} 0%, 
                    ${stressLevels[1].color} 25%, 
                    ${stressLevels[2].color} 50%, 
                    ${stressLevels[3].color} 75%, 
                    ${stressLevels[4].color} 100%)`
                }}
              />
              
              {/* Slider markers */}
              <div className="adult-slider-markers">
                {stressLevels.map((level) => (
                  <div
                    key={level.value}
                    className={`adult-marker ${formData.stress >= level.value ? 'active' : ''}`}
                    style={{ left: `${(level.value - 1) * 25}%` }}
                    onClick={() => setFormData(prev => ({ ...prev, stress: level.value }))}
                  >
                    <span className="adult-marker-dot" style={{ background: level.color }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Stress level indicators */}
            <div className="adult-stress-levels">
              {stressLevels.map((level) => (
                <div
                  key={level.value}
                  className={`adult-level-indicator ${formData.stress === level.value ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, stress: level.value }))}
                  style={{ '--level-color': level.color }}
                >
                  <span className="adult-level-dot" style={{ background: level.color }} />
                  <span className="adult-level-label">{level.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="adult-submit-btn">
            <span>Analyze Health Risk</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdultForm;
