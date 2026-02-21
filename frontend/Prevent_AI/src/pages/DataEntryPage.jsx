import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generatePreventionReport } from '../services/aiReportService'

const initialForm = {
  patientId: '',
  fullName: '',
  age: '',
  visitDate: '',
  gender: 'female',
  riskLevel: 'low',
  notes: '',
}

function DataEntryPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')
  const [submittedData, setSubmittedData] = useState(null)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setApiError('')
    setIsSubmitting(true)

    try {
      const aiResult = await generatePreventionReport(form)
      setSubmittedData({ ...form, ...aiResult })
      navigate('/dashboard', {
        state: {
          patientInput: form,
          generatedReport: aiResult,
        },
      })
    } catch (error) {
      setApiError(error.message || 'Unable to generate report.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="page">
      <h1>Data Entry</h1>
      <p className="page-intro">
        Enter user data and generate an AI prevention report from Gemini.
      </p>

      <form className="data-form" onSubmit={handleSubmit}>
        <label htmlFor="patientId">Patient ID</label>
        <input
          id="patientId"
          name="patientId"
          value={form.patientId}
          onChange={handleChange}
          placeholder="PA-2026-001"
          required
        />

        <label htmlFor="fullName">Full Name</label>
        <input
          id="fullName"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          placeholder="Jane Doe"
          required
        />

        <label htmlFor="age">Age</label>
        <input
          id="age"
          name="age"
          type="number"
          min="0"
          value={form.age}
          onChange={handleChange}
          placeholder="34"
          required
        />

        <label htmlFor="visitDate">Visit Date</label>
        <input
          id="visitDate"
          name="visitDate"
          type="date"
          value={form.visitDate}
          onChange={handleChange}
          required
        />

        <label htmlFor="gender">Gender</label>
        <select id="gender" name="gender" value={form.gender} onChange={handleChange}>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="other">Other</option>
        </select>

        <label htmlFor="riskLevel">Risk Level</label>
        <select id="riskLevel" name="riskLevel" value={form.riskLevel} onChange={handleChange}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <label htmlFor="notes">Clinical Notes</label>
        <textarea
          id="notes"
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={4}
          placeholder="Add patient context and observations"
        />

        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Generating Report...' : 'Generate Prevention Report'}
        </button>

        {apiError && <p className="form-error">{apiError}</p>}
      </form>

      {submittedData && (
        <article className="submitted-preview">
          <h2>Last Submission</h2>
          <p>
            <strong>Patient:</strong> {submittedData.patientId}
          </p>
          <p>
            <strong>Name:</strong> {submittedData.fullName}
          </p>
          <p>
            <strong>Visit Date:</strong> {submittedData.visitDate}
          </p>
          <p>
            <strong>Risk:</strong> {submittedData.riskLevel}
          </p>
          <p>
            <strong>Notes:</strong> {submittedData.notes || 'None'}
          </p>
          <p>
            <strong>AI Report:</strong> {submittedData.report}
          </p>
        </article>
      )}
    </section>
  )
}

export default DataEntryPage
