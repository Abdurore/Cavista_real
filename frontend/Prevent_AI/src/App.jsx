import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import WelcomePage from './components/WelcomePage';
import ProfileSelection from './components/ProfileSelection';
import DataInput from './components/DataInput';
import AdultForm from './components/AdultForm';
import PregnantForm from './components/PregnantForm';
import ResultsPage from './components/ResultsPage';
import DeviceSimulation from './components/DeviceSimulation';
import { buildApiUrl } from './config/api';
import './App.css';

const normalizeResult = (result, rawData) => ({
  riskScore: result.riskScore ?? result.risk_score ?? 0,
  riskLevel: result.riskLevel ?? result.risk_level ?? 'Unknown',
  riskFactors: result.riskFactors ?? result.risk_factors ?? ['No specific risks detected'],
  recommendations: result.recommendations ?? ['Maintain healthy lifestyle'],
  aiModel: result.aiModel ?? result.ai_model ?? 'ClinicalBERT',
  analysisSource: result.analysisSource ?? result.analysis_source ?? result.source ?? 'unknown',
  rawData: rawData || {}
});

const parseApiResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  const bodyText = await response.text();

  let parsed = null;
  if (contentType.includes('application/json') && bodyText) {
    try {
      parsed = JSON.parse(bodyText);
    } catch {
      throw new Error(`Invalid JSON response (HTTP ${response.status})`);
    }
  }

  if (!response.ok) {
    const isHtml = bodyText.trim().startsWith('<');
    const apiMessage = parsed?.message || parsed?.error;
    const fallback = isHtml
      ? `Server returned HTML error page (HTTP ${response.status})`
      : `Request failed (HTTP ${response.status})`;
    throw new Error(apiMessage || fallback);
  }

  if (!parsed) {
    throw new Error(`Expected JSON response but got ${contentType || 'unknown content type'}`);
  }

  return parsed;
};

function App() {
  const [selectedProfile, setSelectedProfile] = useState('');

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<WelcomePageWrapper />} />
          <Route 
            path="/profile-selection" 
            element={
              <ProfileSelectionWrapper 
                setSelectedProfile={setSelectedProfile}
              />
            } 
          />
          <Route 
            path="/data-input" 
            element={
              <DataInputWrapper 
                selectedProfile={selectedProfile}
              />
            } 
          />
          <Route
            path="/device-sync"
            element={
              <DeviceSimulationWrapper
                selectedProfile={selectedProfile}
              />
            }
          />
          <Route path="/adult-form" element={<AdultFormWrapper />} />
          <Route path="/pregnant-form" element={<PregnantFormWrapper />} />
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

// Wrapper components
function WelcomePageWrapper() {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate('/profile-selection');
  };

  return <WelcomePage onContinue={handleContinue} />;
}

function ProfileSelectionWrapper({ setSelectedProfile }) {
  const navigate = useNavigate();

  const handleSelectAdult = () => {
    setSelectedProfile('adult');
    navigate('/data-input');
  };

  const handleSelectPregnant = () => {
    setSelectedProfile('pregnant');
    navigate('/data-input');
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <ProfileSelection 
      onSelectAdult={handleSelectAdult}
      onSelectPregnant={handleSelectPregnant}
      onBack={handleBack}
    />
  );
}

function DataInputWrapper({ selectedProfile }) {
  const navigate = useNavigate();

  const handleSelectMethod = (method) => {
    if (method === 'manual') {
      if (selectedProfile === 'adult') {
        navigate('/adult-form');
      } else {
        navigate('/pregnant-form');
      }
    } else {
      navigate('/device-sync');
    }
  };

  const handleBack = () => {
    navigate('/profile-selection');
  };

  return (
    <DataInput 
      onSelectMethod={handleSelectMethod}
      onBack={handleBack}
    />
  );
}

function DeviceSimulationWrapper({ selectedProfile }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedProfile) {
      navigate('/profile-selection');
    }
  }, [selectedProfile, navigate]);

  const handleBack = () => {
    navigate('/data-input');
  };

  const handleAnalyze = async (generatedData) => {
    if (selectedProfile === 'adult') {
      const response = await fetch(buildApiUrl('/api/analyze/adult'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(generatedData)
      });

      const result = await parseApiResponse(response);
      navigate('/results', {
        state: {
          ...normalizeResult(result, generatedData),
          fromDeviceSync: true
        }
      });
      return;
    }

    const payload = {
      age: generatedData.age,
      weight: generatedData.weight,
      weeks: generatedData.gestationalAge
    };

    const response = await fetch(buildApiUrl('/api/analyze/pregnant'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await parseApiResponse(response);
    navigate('/results', {
      state: {
        ...normalizeResult(result, generatedData),
        fromDeviceSync: true
      }
    });
  };

  return (
    <DeviceSimulation
      profile={selectedProfile}
      onBack={handleBack}
      onAnalyze={handleAnalyze}
    />
  );
}

function AdultFormWrapper() {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    const response = await fetch(buildApiUrl('/api/analyze/adult'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await parseApiResponse(response);
    navigate('/results', { state: normalizeResult(result, data) });
  };

  const handleBack = () => {
    navigate('/data-input');
  };

  return (
    <AdultForm 
      onSubmit={handleSubmit}
      onBack={handleBack}
    />
  );
}

function PregnantFormWrapper() {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    const payload = {
      age: data.age,
      weight: data.weight,
      weeks: data.gestationalAge
    };

    try {
      const response = await fetch(buildApiUrl('/api/analyze/pregnant'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await parseApiResponse(response);
      navigate('/results', { state: normalizeResult(result, data) });
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Analysis failed. Please try again.');
    }
  };

  const handleBack = () => {
    navigate('/data-input');
  };

  return (
    <PregnantForm 
      onSubmit={handleSubmit}
      onBack={handleBack}
    />
  );
}

export default App;
