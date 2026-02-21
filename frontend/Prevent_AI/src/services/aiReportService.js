const GROK_API_KEY = import.meta.env.VITE_GROK_API_KEY
const GROK_MODEL = import.meta.env.VITE_GROK_MODEL || ''
const GROK_MODEL_FALLBACKS = import.meta.env.VITE_GROK_MODEL_FALLBACKS || ''
const GROK_BASE_URL = import.meta.env.DEV ? '/grok-api' : 'https://api.x.ai'
const GROK_API_URL = `${GROK_BASE_URL}/v1/chat/completions`

const buildMockReport = (payload) => {
  if (payload.assessmentType === 'pregnant_woman') {
    return buildPregnancyMockReport(payload)
  }

  return buildGeneralAdultMockReport(payload)
}

const buildGeneralAdultMockReport = (payload) => {
  const heightCm = Number(payload.height)
  const weightKg = Number(payload.weight)
  const bmi = heightCm > 0 ? weightKg / (heightCm / 100) ** 2 : 0
  const systolic = Number(payload.bloodPressureSystolic)
  const diastolic = Number(payload.bloodPressureDiastolic)
  const bloodSugar = Number(payload.bloodSugar)
  const stressHigh = payload.stressLevel === 'high'
  const elevatedBp = systolic >= 140 || diastolic >= 90
  const elevatedSugar = bloodSugar >= 126

  if (bmi >= 30 || elevatedBp || elevatedSugar || stressHigh) {
    return {
      report: 'Elevated prevention risk pattern detected from adult health and lifestyle metrics.',
      suggestions: [
        'Begin supervised weight-management and activity plan.',
        'Schedule blood pressure and blood sugar follow-up within 2 weeks.',
        'Set stress, nutrition, and sleep tracking with weekly review.',
      ],
    }
  }

  if (bmi >= 25) {
    return {
      report: 'Moderate prevention risk indicators were detected and should be monitored.',
      suggestions: [
        'Introduce moderate exercise routine and hydration targets.',
        'Monitor weight trend and reassess in 2-4 weeks.',
        'Provide targeted lifestyle prevention guidance.',
      ],
    }
  }

  return {
    report: 'Current profile indicates low risk with preventive monitoring advised.',
    suggestions: [
      'Continue routine observations.',
      'Maintain monthly prevention assessments.',
      'Encourage patient self-reporting of new symptoms.',
    ],
  }
}

const buildPregnancyMockReport = (payload) => {
  const systolic = Number(payload.bloodPressureSystolic)
  const diastolic = Number(payload.bloodPressureDiastolic)
  const bloodSugar = Number(payload.bloodSugar)
  const gestationalWeeks = Number(payload.gestationalAgeWeeks)
  const highRiskHistory = payload.historyHighRiskPregnancy === 'yes'
  const elevatedBp = systolic >= 140 || diastolic >= 90
  const elevatedSugar = bloodSugar >= 126
  const stressHigh = payload.stressLevel === 'high'

  if (highRiskHistory || elevatedBp || elevatedSugar || stressHigh) {
    return {
      report: 'High-priority maternal prevention indicators were detected in the current profile.',
      suggestions: [
        'Escalate obstetric follow-up and monitor blood pressure and sugar closely.',
        'Increase hydration/sleep adherence and perform daily symptom checks.',
        'Review prior high-risk factors and update maternal care plan this week.',
      ],
    }
  }

  if (gestationalWeeks >= 28) {
    return {
      report: 'Late-stage pregnancy monitoring profile detected with moderate prevention needs.',
      suggestions: [
        'Maintain weekly prenatal checks for blood pressure and glucose trends.',
        'Track fetal movement and hydration consistently each day.',
        'Reinforce stress-reduction and sleep routine.',
      ],
    }
  }

  return {
    report: 'Maternal profile is stable with routine prevention monitoring advised.',
    suggestions: [
      'Continue scheduled prenatal appointments and standard screenings.',
      'Maintain hydration, balanced nutrition, and regular sleep targets.',
      'Monitor blood pressure and blood sugar at recommended intervals.',
    ],
  }
}

export async function generatePreventionReport(payload) {
  if (!GROK_API_KEY) {
    throw new Error(
      'Missing VITE_GROK_API_KEY. Add it to frontend/Prevent_AI/.env and restart the Vite dev server.',
    )
  }
  const candidateModels = [GROK_MODEL, ...GROK_MODEL_FALLBACKS.split(',')]
    .map((value) => value.trim())
    .filter(Boolean)

  if (candidateModels.length === 0) {
    throw new Error(
      'Missing VITE_GROK_MODEL. Add at least one model name in frontend/Prevent_AI/.env and restart the Vite dev server.',
    )
  }

  const prompt = `You are a healthcare prevention assistant.
Return valid JSON only using this schema:
{"report":"string","suggestions":["string","string","string"]}

Patient Data:
- Assessment Type: ${payload.assessmentType}
- Full Name: ${payload.fullName}
- Age: ${payload.age}
- Height (cm): ${payload.height}
- Weight (kg): ${payload.weight}
- Blood Pressure Systolic: ${payload.bloodPressureSystolic}
- Blood Pressure Diastolic: ${payload.bloodPressureDiastolic}
- Blood Sugar: ${payload.bloodSugar}
- Sleep Hours (per night): ${payload.sleepHours}
- Stress Level: ${payload.stressLevel}

Additional Fields:
- Gender: ${payload.gender || 'N/A'}
- Exercise Days (per week): ${payload.exerciseDays || 'N/A'}
- Gestational Age (weeks): ${payload.gestationalAgeWeeks || 'N/A'}
- First Pregnancy: ${payload.firstPregnancy || 'N/A'}
- History of High-Risk Pregnancy: ${payload.historyHighRiskPregnancy || 'N/A'}
- Water Intake (per day): ${payload.waterIntake || 'N/A'}

Generate a short prevention report and exactly 3 actionable prevention suggestions.`

  let data = null
  let lastApiError = ''

  for (const modelName of candidateModels) {
    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500,
      }),
    })

    data = await parseApiResponse(response)

    if (response.ok) {
      break
    }

    const apiMessage = extractApiErrorMessage(data)
    lastApiError = apiMessage || `Grok request failed (${response.status}).`
    if (!isModelNotFoundError(lastApiError)) {
      throw new Error(lastApiError)
    }
  }

  if (!data || data?.error || data?.message) {
    throw new Error(
      lastApiError ||
        'None of the configured Grok models are available. Update VITE_GROK_MODEL or VITE_GROK_MODEL_FALLBACKS.',
    )
  }

  const rawText = extractGrokText(data)
  const parsed = parseModelOutput(rawText)

  if (parsed) {
    return {
      report: parsed.report ?? 'No report was returned by the model.',
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    }
  }

  return {
    report: rawText || 'No report was returned by the model.',
    suggestions: buildMockReport(payload).suggestions,
  }
}

function isModelNotFoundError(message) {
  const normalized = String(message || '').toLowerCase()
  return normalized.includes('model not found') || normalized.includes('unknown model')
}

async function parseApiResponse(response) {
  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    return response.json()
  }

  const text = await response.text()
  return { error: text || 'Unknown API error' }
}

function extractApiErrorMessage(data) {
  if (!data) {
    return ''
  }

  if (typeof data === 'string') {
    return data
  }

  if (data.error && typeof data.error === 'string') {
    return data.error
  }

  if (data.error?.message && typeof data.error.message === 'string') {
    return data.error.message
  }

  if (Array.isArray(data) && data[0]?.error) {
    return data[0].error
  }

  if (data.message && typeof data.message === 'string') {
    return data.message
  }

  try {
    return JSON.stringify(data)
  } catch {
    return ''
  }
}

function extractGrokText(data) {
  return data?.choices?.[0]?.message?.content || ''
}

function parseModelOutput(text) {
  if (!text) {
    return null
  }

  const trimmed = text.trim()

  try {
    return JSON.parse(trimmed)
  } catch {
    const jsonCandidate = trimmed.match(/\{[\s\S]*\}/)
    if (!jsonCandidate) {
      return null
    }

    try {
      return JSON.parse(jsonCandidate[0])
    } catch {
      return null
    }
  }
}
