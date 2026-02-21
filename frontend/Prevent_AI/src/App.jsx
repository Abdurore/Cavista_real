import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import './App.css'
import WelcomePage from './components/WelcomePage'
import ProfileSelection from './components/ProfileSelection'
import DataInput from './components/DataInput'
import AdultForm from './components/AdultForm'
import PregnantForm from './components/PregnantForm'
import ReportPage from './pages/ReportPage'
import { generatePreventionReport } from './services/aiReportService'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<WelcomePageWrapper />} />
        <Route path="/profile-selection" element={<ProfileSelectionWrapper />} />
        <Route path="/data-input" element={<DataInputWrapper />} />
        <Route path="/adult-form" element={<AdultFormWrapper />} />
        <Route path="/pregnant-form" element={<PregnantFormWrapper />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

function WelcomePageWrapper() {
  const navigate = useNavigate()
  return <WelcomePage onContinue={() => navigate('/profile-selection')} />
}

function ProfileSelectionWrapper() {
  const navigate = useNavigate()

  return (
    <ProfileSelection
      onBack={() => navigate('/')}
      onSelectAdult={() => navigate('/data-input')}
      onSelectPregnant={() => navigate('/pregnant-form')}
    />
  )
}

function DataInputWrapper() {
  const navigate = useNavigate()

  const handleSelectMethod = (method) => {
    if (method === 'manual') {
      navigate('/adult-form')
      return
    }

    window.alert('Device syncing is not available yet. Please use manual input for now.')
  }

  return <DataInput onBack={() => navigate('/profile-selection')} onSelectMethod={handleSelectMethod} />
}

function AdultFormWrapper() {
  const navigate = useNavigate()

  const handleSubmit = async (formData) => {
    const payload = mapAdultPayload(formData)

    try {
      const generatedReport = await generatePreventionReport(payload)
      navigate('/report', {
        state: {
          assessmentLabel: 'General Adult',
          patientInput: payload,
          generatedReport,
        },
      })
    } catch (error) {
      window.alert(error.message || 'Unable to generate report right now.')
    }
  }

  return <AdultForm onBack={() => navigate('/data-input')} onSubmit={handleSubmit} />
}

function PregnantFormWrapper() {
  const navigate = useNavigate()

  const handleSubmit = async (formData) => {
    const payload = mapPregnantPayload(formData)

    try {
      const generatedReport = await generatePreventionReport(payload)
      navigate('/report', {
        state: {
          assessmentLabel: 'Maternal Care',
          patientInput: payload,
          generatedReport,
        },
      })
    } catch (error) {
      window.alert(error.message || 'Unable to generate report right now.')
    }
  }

  return <PregnantForm onBack={() => navigate('/profile-selection')} onSubmit={handleSubmit} />
}

function mapAdultPayload(formData) {
  return {
    assessmentType: 'general_adult',
    fullName: 'General Adult Patient',
    age: formData.age,
    gender: formData.gender,
    height: formData.height,
    weight: formData.weight,
    bloodPressureSystolic: formData.bloodPressureSystolic,
    bloodPressureDiastolic: formData.bloodPressureDiastolic,
    bloodSugar: formData.bloodSugar,
    sleepHours: formData.sleep,
    exerciseDays: formData.exercise,
    stressLevel: mapStressLevel(formData.stress),
  }
}

function mapPregnantPayload(formData) {
  return {
    assessmentType: 'pregnant_woman',
    fullName: 'Maternal Care Patient',
    age: formData.age,
    height: formData.height,
    weight: formData.weight,
    gestationalAgeWeeks: formData.gestationalAge,
    firstPregnancy: formData.firstPregnancy,
    historyHighRiskPregnancy: formData.highRiskHistory,
    bloodPressureSystolic: formData.bloodPressureSystolic,
    bloodPressureDiastolic: formData.bloodPressureDiastolic,
    bloodSugar: formData.bloodSugar,
    sleepHours: formData.sleep,
    waterIntake: formData.waterIntake,
    stressLevel: mapStressLevel(formData.stress),
  }
}

function mapStressLevel(stressValue) {
  const stress = Number(stressValue)

  if (stress >= 4) {
    return 'high'
  }

  if (stress >= 3) {
    return 'medium'
  }

  return 'low'
}

export default App
