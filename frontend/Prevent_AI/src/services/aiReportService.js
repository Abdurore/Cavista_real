const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash'
const GEMINI_BASE_URL = import.meta.env.DEV
  ? '/gemini-api'
  : 'https://generativelanguage.googleapis.com'
const GEMINI_API_URL = `${GEMINI_BASE_URL}/v1beta/models/${GEMINI_MODEL}:generateContent`

const buildMockReport = (payload) => {
  const riskLevel = payload.riskLevel?.toLowerCase() ?? 'low'

  if (riskLevel === 'high') {
    return {
      report: 'High-risk pattern detected from submitted clinical profile and notes.',
      suggestions: [
        'Schedule immediate clinician follow-up within 24 hours.',
        'Start daily symptom tracking and alert escalation.',
        'Perform medication and adherence review.',
      ],
    }
  }

  if (riskLevel === 'medium') {
    return {
      report: 'Moderate risk indicators were found and require close monitoring.',
      suggestions: [
        'Run a weekly check-in with care staff.',
        'Track progression markers and update plan in 7 days.',
        'Provide targeted prevention education.',
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

export async function generatePreventionReport(payload) {
  if (!GEMINI_API_KEY) {
    throw new Error(
      'Missing VITE_GEMINI_API_KEY. Add it to frontend/Prevent_AI/.env and restart the Vite dev server.',
    )
  }

  const prompt = `You are a healthcare prevention assistant.
Return valid JSON only using this schema:
{"report":"string","suggestions":["string","string","string"]}

Patient Data:
- Patient ID: ${payload.patientId}
- Full Name: ${payload.fullName}
- Age: ${payload.age}
- Visit Date: ${payload.visitDate}
- Gender: ${payload.gender}
- Risk Level: ${payload.riskLevel}
- Notes: ${payload.notes || 'None'}

Generate a short prevention report and exactly 3 actionable prevention suggestions.`

  const response = await fetch(`${GEMINI_API_URL}?key=${encodeURIComponent(GEMINI_API_KEY)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 500,
        responseMimeType: 'application/json',
      },
    }),
  })

  const data = await parseApiResponse(response)

  if (!response.ok) {
    const apiMessage = extractApiErrorMessage(data)
    throw new Error(
      apiMessage ||
        `Gemini request failed (${response.status}). Check VITE_GEMINI_MODEL, API key, and billing/quota.`,
    )
  }

  if (data?.error || data?.message) {
    throw new Error(data.error?.message || data.error || data.message)
  }

  const rawText = extractGeminiText(data)
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

function extractGeminiText(data) {
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
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
