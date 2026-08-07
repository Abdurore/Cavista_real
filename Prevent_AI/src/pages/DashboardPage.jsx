import { Link, useLocation } from 'react-router-dom'
import StatsCard from '../components/StatsCard'

const mockStats = [
  { title: 'Cases Reviewed', value: '42', hint: 'Last 7 days' },
  { title: 'High Risk Flags', value: '8', hint: 'Needs follow up' },
  { title: 'Completed Notes', value: '31', hint: 'Draft + final' },
]

const queueItems = [
  { id: 'PA-2026-001', status: 'High', owner: 'Dr. Adeniyi' },
  { id: 'PA-2026-004', status: 'Medium', owner: 'Dr. Evans' },
  { id: 'PA-2026-007', status: 'Low', owner: 'Dr. Karim' },
]

function DashboardPage() {
  const location = useLocation()
  const assessmentLabel = location.state?.assessmentLabel ?? 'Assessment'
  const patientInput = location.state?.patientInput
  const generatedReport = location.state?.generatedReport

  return (
    <section className="page">
      <h1>{assessmentLabel} Dashboard</h1>
      <p className="page-intro">
        This dashboard is prepared with logic placeholders and component shells for live backend
        data.
      </p>

      <section className="stats-grid">
        {mockStats.map((stat) => (
          <StatsCard key={stat.title} title={stat.title} value={stat.value} hint={stat.hint} />
        ))}
      </section>

      <section className="panel-grid">
        <article className="panel">
          <div className="panel-head">
            <h2>Priority Queue</h2>
            <Link to="/data-entry">Add Record</Link>
          </div>
          <ul className="queue-list">
            {queueItems.map((item) => (
              <li key={item.id}>
                <span>{item.id}</span>
                <span>{item.status}</span>
                <span>{item.owner}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <h2>Upcoming Hooks</h2>
          <ul className="hook-list">
            <li>Connect `/metrics/summary` to stats cards.</li>
            <li>Connect `/cases/priority` to queue list.</li>
            <li>Connect `/alerts/recent` to notification panel.</li>
          </ul>
        </article>

        <article className="panel">
          <h2>AI Report Output</h2>
          {!generatedReport && (
            <p className="empty-state">
              No AI report yet. Open <Link to="/data-entry">Data Entry</Link> to submit user
              information and generate one.
            </p>
          )}

          {generatedReport && (
            <div className="report-shell">
              <p>
                <strong>Type:</strong> {assessmentLabel}
              </p>
              <p>
                <strong>Patient:</strong> {patientInput?.fullName}
              </p>
              <p>
                <strong>Report:</strong> {generatedReport.report}
              </p>
              <h3>Prevention Suggestions</h3>
              <ul className="hook-list">
                {generatedReport.suggestions.map((suggestion) => (
                  <li key={suggestion}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </article>
      </section>
    </section>
  )
}

export default DashboardPage
