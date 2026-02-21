import { Link, useLocation } from 'react-router-dom'
import '../styles/ReportPage.css'

function ReportPage() {
  const location = useLocation()
  const assessmentLabel = location.state?.assessmentLabel || 'Prevention Assessment'
  const patientInput = location.state?.patientInput
  const generatedReport = location.state?.generatedReport

  const reportText = generatedReport?.report || ''
  const reportParagraphs = reportText
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  return (
    <div className="report-page-container">
      <div className="report-card">
        <p className="report-kicker">AI Prevention Report</p>
        <h1 className="report-title">{assessmentLabel}</h1>

        {!generatedReport && (
          <p className="report-empty">
            No report was generated yet. Start from the profile selection page and submit a form.
          </p>
        )}

        {generatedReport && (
          <>
            <section className="report-section">
              <h2>Patient Snapshot</h2>
              <div className="report-grid">
                <p><strong>Name:</strong> {patientInput?.fullName || 'N/A'}</p>
                <p><strong>Age:</strong> {patientInput?.age || 'N/A'}</p>
                <p><strong>Height:</strong> {patientInput?.height || 'N/A'} cm</p>
                <p><strong>Weight:</strong> {patientInput?.weight || 'N/A'} kg</p>
                <p>
                  <strong>Blood Pressure:</strong> {patientInput?.bloodPressureSystolic || 'N/A'}/
                  {patientInput?.bloodPressureDiastolic || 'N/A'}
                </p>
                <p><strong>Blood Sugar:</strong> {patientInput?.bloodSugar || 'N/A'}</p>
              </div>
            </section>

            <section className="report-section">
              <h2>Clinical Narrative</h2>
              {reportParagraphs.length > 0 ? (
                reportParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
              ) : (
                <p>{reportText}</p>
              )}
            </section>

            <section className="report-section">
              <h2>Action Plan</h2>
              <ul>
                {(generatedReport.suggestions || []).map((suggestion) => (
                  <li key={suggestion}>{suggestion}</li>
                ))}
              </ul>
            </section>
          </>
        )}

        <div className="report-actions">
          <Link className="report-btn secondary" to="/profile-selection">
            New Assessment
          </Link>
          <Link className="report-btn primary" to="/">
            Back Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ReportPage
