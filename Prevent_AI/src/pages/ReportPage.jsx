import { Link, useLocation } from 'react-router-dom'
import '../styles/ReportPage.css'

function renderInlineMarkdown(text) {
  const tokens = String(text || '').split(/(\*\*.*?\*\*)/g)
  return tokens.map((token, index) => {
    if (token.startsWith('**') && token.endsWith('**')) {
      return <strong key={`${token}-${index}`}>{token.slice(2, -2)}</strong>
    }

    return <span key={`${token}-${index}`}>{token}</span>
  })
}

function parseReportBlocks(text) {
  const lines = String(text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const blocks = []
  let listItems = []

  const flushList = () => {
    if (listItems.length === 0) {
      return
    }

    blocks.push({ type: 'list', items: listItems })
    listItems = []
  }

  lines.forEach((line) => {
    if (line.startsWith('- ')) {
      listItems.push(line.slice(2).trim())
      return
    }

    flushList()

    if (line.startsWith('## ')) {
      blocks.push({ type: 'heading', text: line.slice(3).trim() })
      return
    }

    blocks.push({ type: 'paragraph', text: line })
  })

  flushList()
  return blocks
}

function ReportPage() {
  const location = useLocation()
  const assessmentLabel = location.state?.assessmentLabel || 'Prevention Assessment'
  const patientInput = location.state?.patientInput
  const generatedReport = location.state?.generatedReport

  const reportText = generatedReport?.report || ''
  const reportBlocks = parseReportBlocks(reportText)

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
            <section className="report-section report-highlights">
              <h2>Risk & Actions</h2>
              <div className="report-highlights-grid">
                <div>
                  <p className="report-risk-label"><strong>Risk Score</strong></p>
                  <p className="report-risk-score">{generatedReport.riskScore || 'N/A'}</p>
                </div>
                <div>
                  <p className="report-risk-label"><strong>Detected Risks</strong></p>
                  <ul>
                    {(generatedReport.detectedRisks || []).map((risk) => (
                      <li key={risk}>{risk}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="report-risk-label"><strong>Suggestions</strong></p>
                  <ul>
                    {(generatedReport.suggestions || []).map((suggestion) => (
                      <li key={suggestion}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

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
              <div className="report-markdown">
                {reportBlocks.length > 0 ? (
                  reportBlocks.map((block, index) => {
                    if (block.type === 'heading') {
                      return <h3 key={`${block.text}-${index}`}>{renderInlineMarkdown(block.text)}</h3>
                    }

                    if (block.type === 'list') {
                      return (
                        <ul key={`list-${index}`}>
                          {block.items.map((item) => (
                            <li key={`${item}-${index}`}>{renderInlineMarkdown(item)}</li>
                          ))}
                        </ul>
                      )
                    }

                    return <p key={`${block.text}-${index}`}>{renderInlineMarkdown(block.text)}</p>
                  })
                ) : (
                  <p>{reportText}</p>
                )}
              </div>
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
