import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import '../styles/ResultsPage.css';

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [animatedScore, setAnimatedScore] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const results = location.state || {
    riskScore: 45,
    riskLevel: 'Moderate',
    riskFactors: ['BMI slightly elevated', 'Blood pressure needs monitoring'],
    recommendations: ['Increase physical activity', 'Monitor blood pressure weekly'],
    rawData: {}
  };

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = results.riskScore / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= results.riskScore) {
        setAnimatedScore(results.riskScore);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [results.riskScore]);

  const getScoreColor = (score) => {
    if (score < 30) return '#16a34a';
    if (score < 60) return '#f59e0b';
    return '#dc2626';
  };

  const handleBack = () => {
    if (location.state?.fromDeviceSync) {
      navigate('/');
      return;
    }
    navigate(-1);
  };

  const categories = useMemo(
    () => [
      {
        id: 1,
        name: 'Cardiovascular',
        score: 35,
        color: '#16a34a',
        risks: [
          'Blood pressure slightly elevated',
          'Family history of heart disease'
        ],
        advice: [
          'Reduce sodium intake to less than 1500mg/day',
          'Aim for 150 minutes of cardio weekly',
          'Monitor blood pressure twice weekly'
        ]
      },
      {
        id: 2,
        name: 'Metabolic',
        score: 58,
        color: '#f59e0b',
        risks: [
          'BMI in overweight range',
          'Blood sugar at pre-diabetic level'
        ],
        advice: [
          'Add 30 minutes of walking after meals',
          'Reduce added sugars and refined carbs',
          'Maintain consistent meal timing'
        ]
      },
      {
        id: 3,
        name: 'Lifestyle',
        score: 72,
        color: '#dc2626',
        risks: [
          'Sleep duration inconsistent',
          'High stress levels reported',
          'Sedentary work environment'
        ],
        advice: [
          'Set a consistent sleep routine',
          'Practice daily stress reduction for 10 minutes',
          'Take movement breaks every hour'
        ]
      }
    ],
    []
  );

  const statRings = categories.map((category) => {
    const radius = 31;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - category.score / 100);
    return {
      ...category,
      radius,
      circumference,
      dashOffset
    };
  });

  const scoreDescription =
    results.riskScore < 30
      ? 'Current indicators are stable. Maintain your present routine and monitor trends monthly.'
      : results.riskScore < 60
      ? 'Risk is manageable. Focused lifestyle adjustments can significantly improve your trajectory.'
      : 'Risk is elevated. Prioritize clinical follow-up and structured interventions.'
  ;

  return (
    <div className="results-page">
      <header className="results-header">
        <div className="results-header-content">
          <div className="results-logo" onClick={() => navigate('/')}>
            <img src={logo} alt="PreventAI" />
            <span>PreventAI</span>
          </div>
          <div className="results-header-actions">
            <button className="results-btn secondary" onClick={handleBack}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <button className="results-btn primary" onClick={() => navigate('/')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M1 4v6h6M23 20v-6h-6" />
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
              </svg>
              New Assessment
            </button>
          </div>
        </div>
      </header>

      <main className="results-main">
        <section className="results-hero">
          <div className="results-score-card">
            <div className="results-score-circle">
              <svg className="results-progress-ring" width="232" height="232">
                <circle
                  className="results-progress-ring-bg"
                  cx="116"
                  cy="116"
                  r="102"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="14"
                />
                <circle
                  className="results-progress-ring-fill"
                  cx="116"
                  cy="116"
                  r="102"
                  fill="none"
                  stroke={getScoreColor(results.riskScore)}
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 102}`}
                  strokeDashoffset={`${2 * Math.PI * 102 * (1 - results.riskScore / 100)}`}
                />
              </svg>
              <div className="results-score-text">
                <span className="results-score-value">{animatedScore}</span>
                <span className="results-score-label">Risk Score</span>
              </div>
            </div>

            <div className="results-score-info">
              <div
                className="results-risk-badge"
                style={{ background: getScoreColor(results.riskScore) }}
              >
                {results.riskLevel} Risk
              </div>
              <h1 className="results-hero-title">Clinical Risk Summary</h1>
              <p className="results-score-description">
                Based on your submitted health metrics, your overall risk level is{' '}
                <strong>{results.riskLevel.toLowerCase()}</strong>. {scoreDescription}
              </p>

              <div className="results-stat-grid">
                {statRings.map((stat) => (
                  <div className="stat-card" key={stat.id}>
                    <svg width="86" height="86" className="stat-ring">
                      <circle cx="43" cy="43" r={stat.radius} className="stat-ring-bg" />
                      <circle
                        cx="43"
                        cy="43"
                        r={stat.radius}
                        className="stat-ring-fill"
                        style={{
                          stroke: stat.color,
                          strokeDasharray: `${stat.circumference}`,
                          strokeDashoffset: `${stat.dashOffset}`
                        }}
                      />
                    </svg>
                    <span className="stat-value">{stat.score}%</span>
                    <span className="stat-label">{stat.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="results-factors">
          <h2 className="results-section-title">Detected Risk Factors</h2>
          <div className="results-factors-grid">
            {results.riskFactors?.map((factor, index) => (
              <div key={index} className="results-factor-card">
                <p className="factor-text">{factor}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="results-categories">
          <h2 className="results-section-title">Category Breakdown</h2>
          <div className="results-categories-grid">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`results-category-card ${selectedCategory === category.id ? 'expanded' : ''}`}
                onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
              >
                <div className="results-category-header">
                  <div className="category-info">
                    <h3>{category.name}</h3>
                    <div className="category-progress">
                      <div
                        className="category-progress-bar"
                        style={{ width: `${category.score}%`, background: category.color }}
                      />
                    </div>
                  </div>
                  <span className="category-score" style={{ color: category.color }}>
                    {category.score}%
                  </span>
                </div>

                {selectedCategory === category.id && (
                  <div className="results-category-details">
                    <div className="details-section">
                      <h4>Risks</h4>
                      <ul>
                        {category.risks.map((risk, i) => (
                          <li key={i}>{risk}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="details-section">
                      <h4>Recommendations</h4>
                      <ul>
                        {category.advice.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="results-recommendations">
          <h2 className="results-section-title">Personalized Plan</h2>
          <div className="results-recommendations-grid">
            {results.recommendations?.map((rec, index) => (
              <div key={index} className="results-rec-card">
                <div className="rec-number" style={{ background: getScoreColor(results.riskScore) }}>
                  {index + 1}
                </div>
                <p className="rec-text">{rec}</p>
                <button className="rec-btn">Action Plan</button>
              </div>
            ))}
          </div>
        </section>

        <section className="results-simulator">
          <h2 className="results-section-title">Projected Impact</h2>
          <div className="simulator-grid">
            <div className="simulator-card">
              <h3>Sleep Consistency</h3>
              <p className="simulator-impact">-12% risk</p>
              <p className="simulator-desc">Maintain 7-8 hours with fixed sleep/wake windows.</p>
            </div>
            <div className="simulator-card">
              <h3>Daily Activity</h3>
              <p className="simulator-impact">-18% risk</p>
              <p className="simulator-desc">Target 30 minutes of moderate activity every day.</p>
            </div>
            <div className="simulator-card highlight">
              <h3>Combined Program</h3>
              <p className="simulator-impact">-35% risk</p>
              <p className="simulator-desc">Sleep, exercise, and stress control together.</p>
            </div>
          </div>
        </section>

        <div className="results-actions">
          <button className="results-action-btn primary" onClick={() => window.print()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M6 9V3h12v6M6 21h12v-6H6v6zM4 9h16v6h-3v-3H7v3H4V9z" />
            </svg>
            Download Report
          </button>
          <button className="results-action-btn secondary" onClick={() => navigate('/')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 2v4M12 22v-4M4 12H2h2M20 12h2-2M6 6l2 2-2-2zm12 12l-2-2 2 2zM6 18l2-2-2 2z" />
            </svg>
            Start New Assessment
          </button>
        </div>

        <p className="results-disclaimer">
          This assessment is informational and does not replace professional medical evaluation.
        </p>
      </main>
    </div>
  );
};

export default ResultsPage;
