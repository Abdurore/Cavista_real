import React, { useEffect, useMemo, useState } from 'react';
import '../styles/DeviceSimulation.css';

const ADULT_STEPS = [
  'Pairing smartwatch...',
  'Syncing heart and activity signals...',
  'Calibrating health baselines...',
  'Preparing AI analysis payload...'
];

const PREGNANT_STEPS = [
  'Pairing maternal wearable...',
  'Syncing maternal vitals...',
  'Calibrating pregnancy timeline...',
  'Preparing prenatal AI payload...'
];

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max, decimals = 1) =>
  Number((Math.random() * (max - min) + min).toFixed(decimals));

const generateAdultData = () => ({
  age: randomInt(22, 64),
  gender: Math.random() > 0.5 ? 'male' : 'female',
  height: randomFloat(155, 188, 1),
  weight: randomFloat(52, 98, 1),
  bloodPressure: randomInt(108, 148),
  bloodSugar: randomFloat(82, 142, 1),
  sleep: randomFloat(5.2, 8.7, 1),
  exercise: randomInt(1, 6),
  stress: randomInt(1, 5)
});

const generatePregnantData = () => ({
  age: randomInt(20, 42),
  weight: randomFloat(56, 102, 1),
  gestationalAge: randomInt(8, 38),
  bloodSugar: randomFloat(85, 140, 1),
  sleep: randomFloat(5.4, 8.8, 1),
  waterIntake: randomFloat(1.4, 3.8, 1),
  stress: randomInt(1, 5)
});

const formatDataRows = (profile, data) => {
  if (!data) return [];

  if (profile === 'adult') {
    return [
      ['Age', `${data.age} yrs`],
      ['Gender', data.gender],
      ['Height', `${data.height} cm`],
      ['Weight', `${data.weight} kg`],
      ['Systolic BP', `${data.bloodPressure} mmHg`],
      ['Blood Sugar', `${data.bloodSugar} mg/dL`],
      ['Sleep', `${data.sleep} h`],
      ['Exercise', `${data.exercise} days/wk`],
      ['Stress', `${data.stress}/5`]
    ];
  }

  return [
    ['Age', `${data.age} yrs`],
    ['Weight', `${data.weight} kg`],
    ['Gestational Age', `${data.gestationalAge} weeks`],
    ['Blood Sugar', `${data.bloodSugar} mg/dL`],
    ['Sleep', `${data.sleep} h`],
    ['Water', `${data.waterIntake} L/day`],
    ['Stress', `${data.stress}/5`]
  ];
};

const DeviceSimulation = ({ profile, onBack, onAnalyze }) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('syncing');
  const [generatedData, setGeneratedData] = useState(null);
  const [error, setError] = useState('');

  const steps = useMemo(
    () => (profile === 'pregnant' ? PREGNANT_STEPS : ADULT_STEPS),
    [profile]
  );

  const activeStep = Math.min(steps.length - 1, Math.floor(progress / 25));
  const dataRows = useMemo(() => formatDataRows(profile, generatedData), [profile, generatedData]);

  useEffect(() => {
    if (!profile) return;

    let cancelled = false;
    const startedAt = Date.now();

    const timer = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const nextProgress = Math.min(100, Math.floor((elapsed / 4000) * 100));
      setProgress(nextProgress);

      if (elapsed >= 4000) {
        clearInterval(timer);
        const data = profile === 'pregnant' ? generatePregnantData() : generateAdultData();
        setGeneratedData(data);
        setPhase('generated');

        setTimeout(async () => {
          if (cancelled) return;
          setPhase('analyzing');
          try {
            await onAnalyze(data);
          } catch (err) {
            setPhase('error');
            setError(err.message || 'Could not complete AI analysis');
          }
        }, 900);
      }
    }, 120);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [profile, onAnalyze]);

  return (
    <div className="device-sim-page">
      <button className="device-sim-back" onClick={onBack}>Back</button>

      <div className="device-sim-panel">
        <div className="device-sim-watch-wrap">
          <div className="watch-3d">
            <div className="watch-strap top"></div>
            <div className="watch-body">
              <div className="watch-screen">
                <div className="watch-screen-glow"></div>
                <div className="watch-heart-line"></div>
                <div className="watch-reading">
                  {phase === 'syncing' ? `${progress}%` : phase === 'generated' ? 'READY' : phase === 'analyzing' ? 'AI' : 'ERR'}
                </div>
              </div>
            </div>
            <div className="watch-strap bottom"></div>
          </div>
        </div>

        <div className="device-sim-status">
          <h1>{profile === 'pregnant' ? 'Maternal Device Sync' : 'Smartwatch Device Sync'}</h1>
          <p className="device-sim-sub">
            {phase === 'syncing' && steps[activeStep]}
            {phase === 'generated' && 'Data captured. Validating values...'}
            {phase === 'analyzing' && 'Sending data to AI risk engine...'}
            {phase === 'error' && 'Analysis failed. Please try again.'}
          </p>

          <div className="device-progress-track">
            <div className="device-progress-fill" style={{ width: `${progress}%` }}></div>
          </div>

          <div className="device-step-list">
            {steps.map((step, idx) => (
              <div key={step} className={`device-step ${idx <= activeStep ? 'active' : ''}`}>
                <span className="dot"></span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="device-sim-data-card">
        <h2>Live Device Snapshot</h2>
        {!generatedData && <p className="placeholder">Awaiting sensor stream...</p>}
        {generatedData && (
          <div className="data-grid">
            {dataRows.map(([label, value]) => (
              <div className="data-pill" key={label}>
                <span className="label">{label}</span>
                <span className="value">{value}</span>
              </div>
            ))}
          </div>
        )}
        {error && <p className="device-error">{error}</p>}
      </div>
    </div>
  );
};

export default DeviceSimulation;
