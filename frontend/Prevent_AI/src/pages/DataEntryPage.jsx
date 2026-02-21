import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generatePreventionReport } from '../services/aiReportService'

const initialForm = {
  fullName: '',
  height: '',
  weight: '',
  age: '',
  gender: 'female',
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
        Enter user data and generate an AI prevention report from Grok.
      </p>

      <form className="data-form" onSubmit={handleSubmit}>
        <label htmlFor="fullName">Full Name</label>
        <input
          id="fullName"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          placeholder="Jane Doe"
          required
        />

        <label htmlFor="height">Height (cm)</label>
        <input
          id="height"
          name="height"
          type="number"
          min="0"
          step="0.1"
          value={form.height}
          onChange={handleChange}
          placeholder="170"
          required
        />

        <label htmlFor="weight">Weight (kg)</label>
        <input
          id="weight"
          name="weight"
          type="number"
          min="0"
          step="0.1"
          value={form.weight}
          onChange={handleChange}
          placeholder="70"
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

        <label htmlFor="gender">Gender</label>
        <select id="gender" name="gender" value={form.gender} onChange={handleChange}>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="other">Other</option>
        </select>

        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Generating Report...' : 'Generate Prevention Report'}
        </button>

        {apiError && <p className="form-error">{apiError}</p>}
      </form>

      {submittedData && (
        <article className="submitted-preview">
          <h2>Last Submission</h2>
          <p>
            <strong>Name:</strong> {submittedData.fullName}
          </p>
          <p>
            <strong>Height:</strong> {submittedData.height} cm
          </p>
          <p>
            <strong>Weight:</strong> {submittedData.weight} kg
          </p>
          <p>
            <strong>Age:</strong> {submittedData.age}
          </p>
          <p>
            <strong>Gender:</strong> {submittedData.gender}
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
