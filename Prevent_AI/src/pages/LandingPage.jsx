import { Link } from 'react-router-dom'

function LandingPage() {
  return (
    <section className="page">
      <p className="kicker">Frontend Placeholder</p>
      <h1>Prevent AI Portal</h1>
      <p className="page-intro">
        This is the starter landing page while the final UI is in design. Use the actions
        below to move through the current flow.
      </p>
      <div className="action-row">
        <Link className="btn-primary" to="/profile-selection">
          Start Assessment
        </Link>
        <Link className="btn-secondary" to="/dashboard">
          Open Dashboard
        </Link>
      </div>
    </section>
  )
}

export default LandingPage
