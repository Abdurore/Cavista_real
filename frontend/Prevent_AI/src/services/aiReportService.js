const HF_API_KEY = import.meta.env.VITE_HF_API_KEY
const HF_MODEL = import.meta.env.VITE_HF_MODEL || 'google/flan-t5-large'
const HF_API_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`

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
  if (!HF_API_KEY) {
    return buildMockReport(payload)
  }

  const prompt = `You are a healthcare prevention assistant.
Use this patient information to generate:
1) a short risk/prevention report
2) exactly 3 actionable prevention suggestions
Return valid JSON only with this schema:
{"report":"string","suggestions":["string","string","string"]}

Patient Data:
- Patient ID: ${payload.patientId}
- Full Name: ${payload.fullName}
- Age: ${payload.age}
- Visit Date: ${payload.visitDate}
- Gender: ${payload.gender}
- Risk Level: ${payload.riskLevel}
- Notes: ${payload.notes || 'None'}
`

  const response = await fetch(HF_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${HF_API_KEY}`,
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 350,
        temperature: 0.3,
        return_full_text: false,
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Hugging Face request failed (${response.status})`)
  }

  const data = await response.json()

  if (data?.error) {
    throw new Error(data.error)
  }

  const rawText = extractModelText(data)
  const parsed = parseModelOutput(rawText)

  if (parsed) {
    return {
      report: parsed.report ?? 'No report was returned by the model.',
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    }
  }

  return {
    report: rawText || 'No report was returned by the model.',
    suggestions: [],
  }
}

function extractModelText(data) {
  if (typeof data === 'string') {
    return data
  }

  if (Array.isArray(data)) {
    const firstItem = data[0]
    if (typeof firstItem === 'string') {
      return firstItem
    }
    if (firstItem?.generated_text) {
      return firstItem.generated_text
    }
    if (firstItem?.summary_text) {
      return firstItem.summary_text
    }
  }

  if (data?.generated_text) {
    return data.generated_text
  }

  return ''
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
