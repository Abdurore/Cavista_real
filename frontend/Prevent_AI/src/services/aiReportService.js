const GROK_API_KEY = import.meta.env.VITE_GROK_API_KEY
const GROK_MODEL = import.meta.env.VITE_GROK_MODEL || 'grok-3-mini'
const GROK_BASE_URL = import.meta.env.DEV ? '/grok-api' : 'https://api.x.ai'
const GROK_API_URL = `${GROK_BASE_URL}/v1/chat/completions`

const buildMockReport = (payload) => {
  const heightCm = Number(payload.height)
  const weightKg = Number(payload.weight)
  const bmi = heightCm > 0 ? weightKg / (heightCm / 100) ** 2 : 0

  if (bmi >= 30) {
    return {
      report: 'Elevated prevention risk pattern detected from user anthropometric profile.',
      suggestions: [
        'Begin supervised weight-management and activity plan.',
        'Schedule metabolic screening and monthly follow-up.',
        'Set nutrition and sleep tracking with weekly review.',
      ],
    }
  }

  if (bmi >= 25) {
    return {
      report: 'Moderate prevention risk indicators were detected and should be monitored.',
      suggestions: [
        'Introduce moderate exercise routine and hydration targets.',
        'Monitor weight trend and reassess in 2-4 weeks.',
        'Provide targeted lifestyle prevention education.',
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
  if (!GROK_API_KEY) {
    throw new Error(
      'Missing VITE_GROK_API_KEY. Add it to frontend/Prevent_AI/.env and restart the Vite dev server.',
    )
  }

  const prompt = `You are a healthcare prevention assistant.
Return valid JSON only using this schema:
{"report":"string","suggestions":["string","string","string"]}

Patient Data:
- Full Name: ${payload.fullName}
- Height (cm): ${payload.height}
- Weight (kg): ${payload.weight}
- Age: ${payload.age}
- Gender: ${payload.gender}

Generate a short prevention report and exactly 3 actionable prevention suggestions.`

  const response = await fetch(GROK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROK_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROK_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 500,
    }),
  })

  const data = await parseApiResponse(response)

  if (!response.ok) {
    const apiMessage = extractApiErrorMessage(data)
    throw new Error(
      apiMessage ||
        `Grok request failed (${response.status}). Check VITE_GROK_MODEL, API key, and billing/quota.`,
    )
  }

  if (data?.error || data?.message) {
    throw new Error(data.error?.message || data.error || data.message)
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
