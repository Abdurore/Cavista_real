import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const profiles = [
  {
    id: 'general_adult',
    title: 'General Adult',
    description: 'Adult prevention assessment form and lifestyle risk review.',
  },
  {
    id: 'pregnant_woman',
    title: 'Pregnant Woman',
    description: 'Maternal health and pregnancy-specific prevention assessment.',
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
    navigate('/data-entry', {
      state: { assessmentType: selectedProfile, assessmentLabel: selectedLabel },
    })
  }

  return (
    <section className="page">
      <h1>Select Assessment Type</h1>
      <p className="page-intro">Choose which form schema to use for data entry.</p>
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
          Continue with {selectedLabel}
        </button>
      </div>
    </section>
  )
}

export default ProfileSelectionPage
