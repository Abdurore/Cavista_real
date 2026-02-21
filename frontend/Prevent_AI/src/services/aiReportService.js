const AI_API_URL = import.meta.env.VITE_AI_REPORT_API_URL

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
  if (!AI_API_URL) {
    return buildMockReport(payload)
  }

  const response = await fetch(AI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('AI report request failed')
  }

  const data = await response.json()

  return {
    report: data.report ?? 'No report was returned by the API.',
    suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
  }
}
