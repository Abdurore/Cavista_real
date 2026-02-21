import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { generatePreventionReport } from '../services/aiReportService'

const initialGeneralAdultForm = {
  fullName: '',
  height: '',
  weight: '',
  age: '',
  gender: 'female',
  bloodPressureSystolic: '',
  bloodPressureDiastolic: '',
  bloodSugar: '',
  sleepHours: '',
  exerciseDays: '',
  stressLevel: 'low',
}

const initialPregnantForm = {
  fullName: '',
  age: '',
  height: '',
  weight: '',
  gestationalAgeWeeks: '',
  firstPregnancy: 'yes',
  historyHighRiskPregnancy: 'no',
  bloodPressureSystolic: '',
  bloodPressureDiastolic: '',
  bloodSugar: '',
  sleepHours: '',
  waterIntake: '',
  stressLevel: 'low',
}

function DataEntryPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const defaultType = location.state?.assessmentType === 'pregnant_woman' ? 'pregnant_woman' : 'general_adult'
  const [assessmentType, setAssessmentType] = useState(defaultType)
  const [generalAdultForm, setGeneralAdultForm] = useState(initialGeneralAdultForm)
  const [pregnantForm, setPregnantForm] = useState(initialPregnantForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')
  const [submittedData, setSubmittedData] = useState(null)

  const form = assessmentType === 'pregnant_woman' ? pregnantForm : generalAdultForm
  const assessmentLabel = useMemo(
    () => (assessmentType === 'pregnant_woman' ? 'Pregnant Woman' : 'General Adult'),
    [assessmentType],
  )

  const handleChange = (event) => {
    const { name, value } = event.target

    if (assessmentType === 'pregnant_woman') {
      setPregnantForm((current) => ({ ...current, [name]: value }))
      return
    }

    setGeneralAdultForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setApiError('')
    setIsSubmitting(true)

    try {
      const payload = { assessmentType, ...form }
      const aiResult = await generatePreventionReport(payload)
      setSubmittedData({ ...payload, ...aiResult })
      navigate('/dashboard', {
        state: {
          assessmentLabel,
          patientInput: payload,
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
        Enter required fields for {assessmentLabel} and generate an AI prevention report from
        Grok.
      </p>

      <div className="action-row">
        <button
          type="button"
          className={assessmentType === 'general_adult' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setAssessmentType('general_adult')}
        >
          General Adult Form
        </button>
        <button
          type="button"
          className={assessmentType === 'pregnant_woman' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setAssessmentType('pregnant_woman')}
        >
          Pregnant Woman Form
        </button>
      </div>

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

        {assessmentType === 'general_adult' && (
          <>
            <label htmlFor="gender">Gender</label>
            <select id="gender" name="gender" value={form.gender} onChange={handleChange}>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </>
        )}

        {assessmentType === 'pregnant_woman' && (
          <>
            <label htmlFor="gestationalAgeWeeks">Gestational Age (Weeks)</label>
            <input
              id="gestationalAgeWeeks"
              name="gestationalAgeWeeks"
              type="number"
              min="0"
              value={form.gestationalAgeWeeks}
              onChange={handleChange}
              placeholder="24"
              required
            />

            <label htmlFor="firstPregnancy">First Pregnancy?</label>
            <select
              id="firstPregnancy"
              name="firstPregnancy"
              value={form.firstPregnancy}
              onChange={handleChange}
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>

            <label htmlFor="historyHighRiskPregnancy">History of High-Risk Pregnancy?</label>
            <select
              id="historyHighRiskPregnancy"
              name="historyHighRiskPregnancy"
              value={form.historyHighRiskPregnancy}
              onChange={handleChange}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </>
        )}

        <label htmlFor="bloodPressureSystolic">Blood Pressure Systolic</label>
        <input
          id="bloodPressureSystolic"
          name="bloodPressureSystolic"
          type="number"
          min="0"
          value={form.bloodPressureSystolic}
          onChange={handleChange}
          placeholder="120"
          required
        />

        <label htmlFor="bloodPressureDiastolic">Blood Pressure Diastolic</label>
        <input
          id="bloodPressureDiastolic"
          name="bloodPressureDiastolic"
          type="number"
          min="0"
          value={form.bloodPressureDiastolic}
          onChange={handleChange}
          placeholder="80"
          required
        />

        <label htmlFor="bloodSugar">Blood Sugar</label>
        <input
          id="bloodSugar"
          name="bloodSugar"
          type="number"
          min="0"
          step="0.1"
          value={form.bloodSugar}
          onChange={handleChange}
          placeholder="95"
          required
        />

        <label htmlFor="sleepHours">Sleep Hours (per night)</label>
        <input
          id="sleepHours"
          name="sleepHours"
          type="number"
          min="0"
          step="0.1"
          value={form.sleepHours}
          onChange={handleChange}
          placeholder="7.5"
          required
        />

        {assessmentType === 'general_adult' && (
          <>
            <label htmlFor="exerciseDays">Exercise Days (per week)</label>
            <input
              id="exerciseDays"
              name="exerciseDays"
              type="number"
              min="0"
              max="7"
              value={form.exerciseDays}
              onChange={handleChange}
              placeholder="3"
              required
            />
          </>
        )}

        {assessmentType === 'pregnant_woman' && (
          <>
            <label htmlFor="waterIntake">Water Intake (per day)</label>
            <input
              id="waterIntake"
              name="waterIntake"
              type="number"
              min="0"
              step="0.1"
              value={form.waterIntake}
              onChange={handleChange}
              placeholder="2.5"
              required
            />
          </>
        )}

        <label htmlFor="stressLevel">Stress Level</label>
        <select id="stressLevel" name="stressLevel" value={form.stressLevel} onChange={handleChange}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
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
            <strong>Assessment Type:</strong> {submittedData.assessmentType}
          </p>
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
          {submittedData.gender && (
            <p>
              <strong>Gender:</strong> {submittedData.gender}
            </p>
          )}
          <p>
            <strong>AI Report:</strong> {submittedData.report}
          </p>
        </article>
      )}
    </section>
  )
}

export default DataEntryPage
