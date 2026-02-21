import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const profiles = [
  {
    id: 'clinician',
    title: 'Clinician',
    description: 'Review patient flags and monitor risk trends.',
  },
  {
    id: 'analyst',
    title: 'Data Analyst',
    description: 'Track metrics and quality indicators.',
  },
  {
    id: 'admin',
    title: 'Admin',
    description: 'Manage operations and staff access.',
  },
]

function ProfileSelectionPage() {
  const [selectedProfile, setSelectedProfile] = useState(profiles[0].id)
  const navigate = useNavigate()

  const selectedLabel = useMemo(
    () => profiles.find((profile) => profile.id === selectedProfile)?.title ?? '',
    [selectedProfile],
  )

  const handleContinue = () => {
    navigate('/dashboard', { state: { profile: selectedLabel } })
  }

  return (
    <section className="page">
      <h1>Select Your Role</h1>
      <p className="page-intro">Choose a profile to continue into the dashboard.</p>
      <div className="profile-grid">
        {profiles.map((profile) => (
          <button
            key={profile.id}
            type="button"
            className={selectedProfile === profile.id ? 'profile-card selected' : 'profile-card'}
            onClick={() => setSelectedProfile(profile.id)}
          >
            <strong>{profile.title}</strong>
            <span>{profile.description}</span>
          </button>
        ))}
      </div>
      <div className="action-row">
        <button type="button" className="btn-primary" onClick={handleContinue}>
          Continue as {selectedLabel}
        </button>
      </div>
    </section>
  )
}

export default ProfileSelectionPage
