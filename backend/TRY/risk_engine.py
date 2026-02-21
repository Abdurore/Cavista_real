try:
    from .model import AdultInput, PregnantInput, RiskCard, RiskLevel, AnalysisResponse
    from .config import Config
except ImportError:
    from model import AdultInput, PregnantInput, RiskCard, RiskLevel, AnalysisResponse
    from config import Config
import httpx
import json
import logging

logger = logging.getLogger(__name__)


def calculate_bmi(height_cm: float, weight_kg: float) -> float:
    """Calculate BMI from height (cm) and weight (kg)."""
    height_m = height_cm / 100
    return round(weight_kg / (height_m ** 2), 2)


def get_risk_level_from_score(score: int) -> RiskLevel:
    """Convert numeric score to risk level."""
    if score < 40:
        return RiskLevel.GREEN
    if score < 70:
        return RiskLevel.YELLOW
    return RiskLevel.RED


def _build_prompt(profile_type: str, data: dict) -> str:
    if profile_type == "adult":
        return f"""
        Analyze this adult health profile and return JSON only (no markdown):
        - Age: {data.get('age')}
        - Gender: {data.get('gender')}
        - Height: {data.get('height_cm')} cm
        - Weight: {data.get('weight_kg')} kg
        - BMI: {calculate_bmi(data.get('height_cm', 170), data.get('weight_kg', 70))}
        - Blood Pressure: {data.get('systolic_bp')}/{data.get('diastolic_bp')} mmHg
        - Blood Sugar: {data.get('blood_sugar')} mg/dL
        - Sleep: {data.get('sleep_hours')} hours/night
        - Exercise: {data.get('exercise_days')} days/week
        - Stress: {data.get('stress_level')}

        Return JSON with this exact structure:
        {{
            "risk_score": 0-100,
            "detected_risks": [{{"risk_type": "", "severity": "green|yellow|red", "description": "", "recommendation": ""}}],
            "recommendations": [""]
        }}
        """

    return f"""
    Analyze this pregnant woman's health profile and return JSON only (no markdown):
    - Age: {data.get('age')}
    - Height: {data.get('height_cm')} cm
    - Weight: {data.get('weight_kg')} kg
    - Gestational Weeks: {data.get('gestational_weeks')}
    - First Pregnancy: {data.get('first_pregnancy')}
    - High-Risk History: {data.get('high_risk_history')}
    - Blood Pressure: {data.get('systolic_bp')}/{data.get('diastolic_bp')} mmHg
    - Blood Sugar: {data.get('blood_sugar')} mg/dL
    - Sleep: {data.get('sleep_hours')} hours/night
    - Water Intake: {data.get('water_intake')} L/day
    - Stress: {data.get('stress_level')}

    Return JSON with this exact structure:
    {{
        "risk_score": 0-100,
        "detected_risks": [{{"risk_type": "", "severity": "green|yellow|red", "description": "", "recommendation": ""}}],
        "recommendations": [""]
    }}
    """


async def call_external_ai_api(profile_type: str, data: dict) -> dict | None:
    """
    Call external AI API for health risk analysis.
    Returns parsed JSON response or None if failed.
    """
    if not Config.USE_EXTERNAL_AI or not Config.EXTERNAL_AI_API_URL:
        logger.warning("External AI API disabled or not configured")
        return None

    try:
        headers = {
            "Authorization": f"Bearer {Config.EXTERNAL_AI_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": "meta-llama/Llama-3.1-8B-Instruct",
            "messages": [
                {
                    "role": "system",
                    "content": "You are a medical risk assessment AI. Return ONLY valid JSON, no markdown, no explanations.",
                },
                {"role": "user", "content": _build_prompt(profile_type, data)},
            ],
            "temperature": 0.3,
            "max_tokens": 1000,
        }

        async with httpx.AsyncClient(timeout=Config.EXTERNAL_AI_TIMEOUT) as client:
            response = await client.post(
                Config.EXTERNAL_AI_API_URL,
                headers=headers,
                json=payload,
            )
            response.raise_for_status()
            body = response.json()

        ai_content = body["choices"][0]["message"]["content"]
        ai_result = json.loads(ai_content)
        if not isinstance(ai_result, dict):
            raise ValueError("AI response content is not a JSON object")

        logger.info("External AI API call successful")
        return ai_result
    except Exception as e:
        logger.warning(f"External AI API call failed: {str(e)}")
        return None


def _build_analysis_response(profile_type: str, ai_result: dict) -> AnalysisResponse:
    raw_score = ai_result.get("risk_score", 50)
    try:
        risk_score = int(raw_score)
    except (TypeError, ValueError):
        risk_score = 50
    risk_score = max(0, min(risk_score, 100))

    detected_risks = []
    for risk in ai_result.get("detected_risks", []):
        try:
            detected_risks.append(RiskCard(**risk))
        except Exception:
            continue

    recommendations = ai_result.get("recommendations", [])
    if not isinstance(recommendations, list):
        recommendations = []

    return AnalysisResponse(
        risk_score=risk_score,
        risk_level=get_risk_level_from_score(risk_score),
        detected_risks=detected_risks,
        recommendations=recommendations,
        profile_type=profile_type,  # type: ignore
        analysis_mode="advanced",
        message="AI-powered analysis completed",
    )


async def analyze_adult_risk(data: AdultInput) -> AnalysisResponse:
    """Analyze adult health risks using external AI only."""
    ai_result = await call_external_ai_api("adult", data.model_dump())
    if not ai_result:
        raise RuntimeError("External AI analysis unavailable for adult profile")
    return _build_analysis_response("adult", ai_result)


async def analyze_pregnant_risk(data: PregnantInput) -> AnalysisResponse:
    """Analyze pregnant health risks using external AI only."""
    ai_result = await call_external_ai_api("pregnant", data.model_dump())
    if not ai_result:
        raise RuntimeError("External AI analysis unavailable for pregnant profile")
    return _build_analysis_response("pregnant", ai_result)
