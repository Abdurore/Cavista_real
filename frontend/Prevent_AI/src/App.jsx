import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import DashboardPage from './pages/DashboardPage'
import DataEntryPage from './pages/DataEntryPage'
import LandingPage from './pages/LandingPage'
import ProfileSelectionPage from './pages/ProfileSelectionPage'

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-content">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/profile-selection" element={<ProfileSelectionPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/data-entry" element={<DataEntryPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
