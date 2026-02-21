const HF_API_KEY = import.meta.env.VITE_HF_API_KEY
const HF_MODEL = import.meta.env.VITE_HF_MODEL || ''
const HF_MODEL_FALLBACKS = import.meta.env.VITE_HF_MODEL_FALLBACKS || ''
const HF_BASE_URL = import.meta.env.DEV ? '/hf-api' : 'https://router.huggingface.co'
const HF_API_URL = `${HF_BASE_URL}/v1/chat/completions`
const DEFAULT_FALLBACK_MODELS = [
  'Qwen/Qwen2.5-72B-Instruct',
  'mistralai/Mixtral-8x7B-Instruct-v0.1',
]

const buildMockReport = (payload) => {
  const baseReport =
    payload.assessmentType === 'pregnant_woman'
      ? buildPregnancyMockReport(payload)
      : buildGeneralAdultMockReport(payload)
  const { riskScore, detectedRisks } = buildRiskInsights(payload)

  return {
    ...baseReport,
    riskScore,
    detectedRisks,
  }
}

function buildRiskInsights(payload) {
  const risks = []
  const heightCm = Number(payload.height)
  const weightKg = Number(payload.weight)
  const bmi = heightCm > 0 ? weightKg / (heightCm / 100) ** 2 : 0
  const systolic = Number(payload.bloodPressureSystolic)
  const diastolic = Number(payload.bloodPressureDiastolic)
  const bloodSugar = Number(payload.bloodSugar)
  const stressLevel = String(payload.stressLevel || '').toLowerCase()

  let score = 15

  if (bmi >= 30) {
    score += 20
    risks.push('Elevated BMI profile')
  } else if (bmi >= 25) {
    score += 12
    risks.push('Overweight range')
  }

  if (systolic >= 140 || diastolic >= 90) {
    score += 25
    risks.push('High blood pressure trend')
  } else if (systolic >= 130 || diastolic >= 85) {
    score += 12
    risks.push('Borderline blood pressure')
  }

  if (bloodSugar >= 126) {
    score += 25
    risks.push('High blood sugar trend')
  } else if (bloodSugar >= 100) {
    score += 12
    risks.push('Borderline blood sugar')
  }

  if (stressLevel === 'high') {
    score += 12
    risks.push('High stress load')
  } else if (stressLevel === 'medium') {
    score += 6
  }

  if (payload.assessmentType === 'pregnant_woman') {
    if (payload.historyHighRiskPregnancy === 'yes') {
      score += 14
      risks.push('History of high-risk pregnancy')
    }

    const gestationalWeeks = Number(payload.gestationalAgeWeeks)
    if (gestationalWeeks >= 28) {
      score += 6
      risks.push('Late-stage pregnancy monitoring needs')
    }
  }

  const clampedScore = Math.max(5, Math.min(Math.round(score), 98))
  return {
    riskScore: `${clampedScore}%`,
    detectedRisks: risks.length > 0 ? risks : ['No dominant high-risk marker detected'],
  }
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
      report:
        'Clinical Summary:\nCurrent measurements indicate multiple elevated prevention markers, including metabolic or cardiovascular stress indicators that can compound over time if not managed early. Blood pressure and blood sugar trends suggest a need for closer short-interval monitoring, while lifestyle load and stress profile increase the probability of progression toward chronic risk states.\n\nRisk Interpretation:\nThis pattern aligns with a high-priority prevention category, not because a diagnosis is confirmed, but because several risk dimensions are active at once. The combination of physiologic readings and behavioral factors increases near-term vulnerability to fatigue, reduced functional wellbeing, and long-term cardiometabolic burden if no intervention plan is put in place.\n\nPrevention Roadmap:\nA structured plan should focus first on stabilization: consistent sleep routine, meal timing, hydration, and low-impact activity progression. Clinical follow-up should reassess blood pressure and glucose promptly, then track trend response every 2 to 4 weeks. Practical stress regulation, daily adherence tracking, and targeted clinician coaching are recommended to sustain risk reduction.',
      suggestions: [
        'Schedule blood pressure and blood sugar reassessment within 2 weeks to confirm trend direction.',
        'Start a supervised weekly activity and nutrition plan with realistic adherence targets.',
        'Use daily sleep and stress logs to identify triggers and improve routine stability.',
        'Set a 30-day prevention review with updated vitals, weight, and lifestyle metrics.',
      ],
    }
  }

  if (bmi >= 25) {
    return {
      report:
        'Clinical Summary:\nThe profile shows moderate prevention burden with early warning indicators in weight and lifestyle-linked factors. Current values do not indicate the highest risk tier, but they suggest a trajectory that can shift unfavorably without deliberate habit correction and routine monitoring.\n\nRisk Interpretation:\nThis pattern is consistent with a medium prevention category where timely behavior change has high impact. The objective is to prevent escalation by stabilizing nutrition quality, activity consistency, and sleep adequacy before physiologic markers worsen.\n\nPrevention Roadmap:\nA focused four-week routine should include moderate exercise frequency, hydration targets, and improved sleep regularity. Trend tracking for blood pressure, blood sugar, and weight should continue at least weekly. Reinforcement through coaching or accountability tools can improve consistency and lower long-term risk accumulation.',
      suggestions: [
        'Implement a 4-week moderate-intensity exercise schedule with progressive weekly goals.',
        'Track blood pressure, blood sugar, and weight weekly and document trend changes.',
        'Set clear sleep and hydration targets and review adherence at the end of each week.',
      ],
    }
  }

  return {
    report:
      'Clinical Summary:\nThe current data indicates a stable baseline prevention profile with no dominant high-risk cluster. Vitals and lifestyle factors appear generally balanced, supporting a low immediate prevention burden.\n\nRisk Interpretation:\nEven with a stable profile, prevention focus should remain active because risk can increase when sleep, stress, activity, or nutrition patterns drift over time. Early detection and routine monitoring remain essential for preserving long-term health trajectory.\n\nPrevention Roadmap:\nContinue structured self-monitoring, maintain present lifestyle habits, and complete periodic reassessment. Reinforce consistency in activity, sleep duration, hydration, and nutrition quality. If new symptoms or metric shifts appear, escalate review promptly to avoid delayed intervention.',
    suggestions: [
      'Continue monthly prevention check-ins with updated vitals and lifestyle metrics.',
      'Maintain current sleep, activity, and hydration routines with weekly self-tracking.',
      'Escalate clinical review promptly if blood pressure, sugar, or stress patterns worsen.',
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
      report:
        'Clinical Summary:\nMaternal indicators show a high-priority prevention pattern requiring tighter follow-up. Blood pressure or glucose elevation, high stress load, or prior high-risk history introduces compounded maternal and fetal monitoring needs. The profile warrants proactive care coordination rather than routine-only observation.\n\nRisk Interpretation:\nThis is a precautionary high-risk prevention category where early action can reduce complications. Without close monitoring, risk of adverse maternal trends may increase in later gestation, especially when physiologic strain and behavioral stress are both present.\n\nPrevention Roadmap:\nCare should shift to short-interval review, including blood pressure and glucose trend checks, symptom surveillance, and strict hydration and rest routines. Obstetric team coordination should be prioritized this week, with defined escalation thresholds for concerning symptoms. A structured daily adherence plan is recommended to improve stability and reduce uncertainty.',
      suggestions: [
        'Arrange high-priority obstetric follow-up and monitor blood pressure and glucose closely.',
        'Use daily symptom tracking with clear escalation rules for warning signs.',
        'Strengthen hydration, sleep, and stress-management routines with caregiver support.',
        'Review prior high-risk history factors and update the maternal care plan this week.',
      ],
    }
  }

  if (gestationalWeeks >= 28) {
    return {
      report:
        'Clinical Summary:\nThe current profile reflects a later-stage pregnancy monitoring context with moderate prevention needs. While values are not in the highest concern range, third-trimester progression requires more consistent trend surveillance and adherence to maternal wellness routines.\n\nRisk Interpretation:\nRisk is moderate due to gestational stage and the natural increase in physiologic demand. Prevention priorities are centered on early detection of trend shifts in blood pressure, glucose, hydration, and rest quality.\n\nPrevention Roadmap:\nMaintain weekly prenatal monitoring, reinforce daily hydration and sleep targets, and track fetal movement consistently. The care approach should emphasize steady routine adherence and rapid reporting of any symptom change. Continued preventative coaching can help keep the pregnancy course stable through delivery planning.',
      suggestions: [
        'Maintain weekly prenatal checks focused on blood pressure and glucose trends.',
        'Track hydration, sleep quality, and fetal movement daily with simple logs.',
        'Report any sudden swelling, headache, or reduced fetal movement immediately.',
      ],
    }
  }

  return {
    report:
      'Clinical Summary:\nMaternal data currently appears stable with no dominant high-risk signal. Routine prenatal prevention monitoring remains appropriate, and present metrics support continued standard surveillance.\n\nRisk Interpretation:\nCurrent prevention risk is low to moderate, but ongoing physiologic changes during pregnancy require consistent observation. Small trend shifts can become clinically meaningful, so continuity in monitoring remains important.\n\nPrevention Roadmap:\nContinue scheduled prenatal visits, maintain hydration and balanced nutrition, and preserve sleep consistency as a daily target. Keep regular blood pressure and glucose checks according to care guidance. Promptly escalate review if new symptoms or measurable trend changes are detected.',
    suggestions: [
      'Continue routine prenatal follow-up and recommended screening schedule.',
      'Sustain hydration, nutrition balance, and sleep consistency every day.',
      'Monitor blood pressure and sugar regularly and report notable shifts early.',
    ],
  }
}

export async function generatePreventionReport(payload) {
  const candidateModels = [HF_MODEL, ...HF_MODEL_FALLBACKS.split(','), ...DEFAULT_FALLBACK_MODELS]
    .map((value) => value.trim())
    .filter((value) => value && !isPlaceholderModel(value))
    .filter((value, index, array) => array.indexOf(value) === index)

  const prompt = `As a Healthcare Prevention Specialist and Data Analyst, perform a comprehensive health audit based on the provided patient data.

### OBJECTIVE
Analyze the physiological metrics provided to determine risk levels and provide a structured clinical report. You must return your response in VALID JSON format only.

### DATA INPUTS
- Assessment Type: ${payload.assessmentType}
- Patient: ${payload.fullName} (${payload.age} years old, ${payload.gender || 'N/A'})
- Physicals: ${payload.height}cm, ${payload.weight}kg
- Vitals: BP ${payload.bloodPressureSystolic}/${payload.bloodPressureDiastolic}, Blood Sugar: ${payload.bloodSugar}
- Lifestyle: ${payload.sleepHours}h sleep, ${payload.stressLevel} stress, ${payload.exerciseDays || '0'} days exercise/week, ${payload.waterIntake || 'N/A'} water/day
- Pregnancy Context: Week ${payload.gestationalAgeWeeks || 'N/A'}, First Pregnancy: ${payload.firstPregnancy || 'N/A'}, History of High-Risk: ${payload.historyHighRiskPregnancy || 'N/A'}

### OUTPUT REQUIREMENTS
1. **JSON Format**: The entire response must be a single JSON object.
2. **Markdown Content**: The "report" field must contain Markdown formatting (bolding, headers, lists) for web rendering.
3. **Word Count**: The report text must be between 220 and 320 words.
4. **Required Headers**: Use exactly these headers in the report:
   - ## Clinical Summary:
   - ## Risk Interpretation:
   - ## Prevention Roadmap:

### SCHEMA
{
  "risk_score": "0-100%",
  "detected_risks": ["list", "of", "risks"],
  "report": "string (with Markdown)",
  "suggestions": ["string", "string"]
}

### RULES
- Calculate a specific Risk Score based on BMI, BP, and Sugar levels.
- Use plain language that remains clinically accurate.
- Provide 3 to 6 actionable suggestions.`

  const fallback = buildMockReport(payload)
  let data = null
  let lastApiError = ''
  let hasAttemptedApiCall = false

  if (!HF_API_KEY || candidateModels.length === 0) {
    return fallback
  }

  for (const modelName of candidateModels) {
    let response

    try {
      response = await fetch(HF_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${HF_API_KEY}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 850,
        }),
      })
    } catch (error) {
      lastApiError = error?.message || 'Network error while calling Hugging Face.'
      continue
    }

    hasAttemptedApiCall = true
    data = await parseApiResponse(response)

    if (response.ok) {
      break
    }

    const apiMessage = extractApiErrorMessage(data)
    lastApiError =
      apiMessage || `Hugging Face request failed (${response.status} ${response.statusText}).`
    if (!isModelNotFoundError(lastApiError) && response.status < 500) {
      break
    }
  }

  if (!data || data?.error || data?.message) {
    if (!hasAttemptedApiCall) {
      return fallback
    }

    return {
      ...fallback,
      report: `${fallback.report}\n\nIntegration Note:\nThe live Hugging Face request is currently unavailable (${lastApiError || 'server error'}). This report uses local prevention logic so you can continue working.`,
    }
  }

  const rawText = extractHFText(data)
  const parsed = parseModelOutput(rawText)

  if (parsed?.report) {
    const modelDetectedRisks = Array.isArray(parsed.detected_risks)
      ? parsed.detected_risks
      : Array.isArray(parsed.detectedRisks)
        ? parsed.detectedRisks
        : fallback.detectedRisks

    return {
      report: parsed.report,
      riskScore: parsed.risk_score || parsed.riskScore || fallback.riskScore,
      detectedRisks: modelDetectedRisks,
      suggestions:
        Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0
          ? parsed.suggestions
          : buildMockReport(payload).suggestions,
    }
  }

  return {
    ...fallback,
    report: rawText || fallback.report,
  }
}

function isModelNotFoundError(message) {
  const normalized = String(message || '').toLowerCase()
  return normalized.includes('model not found') || normalized.includes('unknown model')
}

function isPlaceholderModel(value) {
  const normalized = String(value || '').toLowerCase()
  return normalized.includes('<') || normalized.includes('>') || normalized.includes('your_')
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

function extractHFText(data) {
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
