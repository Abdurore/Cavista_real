import { useState } from 'react'

const initialForm = {
  patientId: '',
  visitDate: '',
  riskLevel: 'low',
  notes: '',
}

function DataEntryPage() {
  const [form, setForm] = useState(initialForm)
  const [submittedData, setSubmittedData] = useState(null)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmittedData(form)
  }

  return (
    <section className="page">
      <h1>Data Entry</h1>
      <p className="page-intro">Use this placeholder form to collect structured input.</p>

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

        <label htmlFor="visitDate">Visit Date</label>
        <input
          id="visitDate"
          name="visitDate"
          type="date"
          value={form.visitDate}
          onChange={handleChange}
          required
        />

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

        <button type="submit" className="btn-primary">
          Save Entry
        </button>
      </form>

      {submittedData && (
        <article className="submitted-preview">
          <h2>Last Saved Entry</h2>
          <p>
            <strong>Patient:</strong> {submittedData.patientId}
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
        </article>
      )}
    </section>
  )
}

export default DataEntryPage
