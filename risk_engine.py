from typing import Any, Literal
import httpx
import json
import logging

try:
    from .model import AdultInput, PregnantInput, RiskCard, RiskLevel, AnalysisResponse
    from .config import Config
except ImportError:
    from model import AdultInput, PregnantInput, RiskCard, RiskLevel, AnalysisResponse
    from config import Config

logger = logging.getLogger(__name__)


class AnalysisUnavailableError(RuntimeError):
    """Raised when external AI analysis is unavailable."""


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


def _build_prompt(profile_type: Literal["adult", "pregnant"], data: dict) -> str:
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


def _validate_external_ai_config() -> None:
    if not Config.USE_EXTERNAL_AI:
        raise AnalysisUnavailableError("External AI analysis is disabled (USE_EXTERNAL_AI=false).")

    missing = []
    if not Config.EXTERNAL_AI_API_URL:
        missing.append("EXTERNAL_AI_API_URL")
    if not Config.EXTERNAL_AI_API_KEY:
        missing.append("EXTERNAL_AI_API_KEY")

    if missing:
        raise AnalysisUnavailableError(f"Missing required AI config: {', '.join(missing)}")


def _flatten_content_blocks(value: Any) -> str:
    if isinstance(value, str):
        return value
    if isinstance(value, list):
        parts: list[str] = []
        for item in value:
            if isinstance(item, str):
                parts.append(item)
            elif isinstance(item, dict):
                text = item.get("text") or item.get("content")
                if isinstance(text, str):
                    parts.append(text)
        return "\n".join(parts).strip()
    return ""


def _extract_text_from_provider_response(body: dict) -> str:
    # Chat Completions-like shape
    choices = body.get("choices")
    if isinstance(choices, list) and choices:
        first = choices[0]
        if isinstance(first, dict):
            message = first.get("message")
            if isinstance(message, dict):
                content = _flatten_content_blocks(message.get("content"))
                if content:
                    return content

            text = first.get("text")
            if isinstance(text, str) and text.strip():
                return text.strip()

    # Responses API-like shape
    output_text = body.get("output_text")
    if isinstance(output_text, str) and output_text.strip():
        return output_text.strip()

    output = body.get("output")
    if isinstance(output, list):
        for block in output:
            if isinstance(block, dict):
                content_items = block.get("content")
                if isinstance(content_items, list):
                    for item in content_items:
                        if isinstance(item, dict):
                            text = item.get("text")
                            if isinstance(text, str) and text.strip():
                                return text.strip()

    raise AnalysisUnavailableError("Unsupported AI response format: no text content found.")


def _parse_json_text(raw_text: str) -> dict:
    text = raw_text.strip()
    if not text:
        raise AnalysisUnavailableError("AI response content is empty.")

    if text.startswith("```"):
        lines = text.splitlines()
        if lines:
            lines = lines[1:]
        if lines and lines[-1].strip().startswith("```"):
            lines = lines[:-1]
        text = "\n".join(lines).strip()

    try:
        parsed = json.loads(text)
    except json.JSONDecodeError:
        start = text.find("{")
        end = text.rfind("}")
        if start == -1 or end == -1 or end <= start:
            raise AnalysisUnavailableError("AI response was not valid JSON.")
        try:
            parsed = json.loads(text[start : end + 1])
        except json.JSONDecodeError as exc:
            raise AnalysisUnavailableError("AI response JSON parsing failed.") from exc

    if not isinstance(parsed, dict):
        raise AnalysisUnavailableError("AI response JSON must be an object.")
    return parsed


async def call_external_ai_api(profile_type: Literal["adult", "pregnant"], data: dict) -> dict:
    """
    Call external AI API for health risk analysis.
    Returns a parsed JSON object with analysis fields.
    """
    _validate_external_ai_config()

    headers = {
        "Authorization": f"Bearer {Config.EXTERNAL_AI_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": Config.EXTERNAL_AI_MODEL,
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

    try:
        async with httpx.AsyncClient(timeout=Config.EXTERNAL_AI_TIMEOUT) as client:
            response = await client.post(
                Config.EXTERNAL_AI_API_URL,
                headers=headers,
                json=payload,
            )
            response.raise_for_status()
            body = response.json()
    except httpx.HTTPError as exc:
        raise AnalysisUnavailableError(f"AI provider request failed: {str(exc)}") from exc
    except ValueError as exc:
        raise AnalysisUnavailableError("AI provider returned invalid JSON body.") from exc

    content_text = _extract_text_from_provider_response(body)
    ai_result = _parse_json_text(content_text)
    logger.info("External AI API call successful")
    return ai_result


def _build_analysis_response(profile_type: Literal["adult", "pregnant"], ai_result: dict) -> AnalysisResponse:
    raw_score = ai_result.get("risk_score", 50)
    try:
        risk_score = int(raw_score)
    except (TypeError, ValueError):
        risk_score = 50
    risk_score = max(0, min(risk_score, 100))

    detected_risks: list[RiskCard] = []
    for risk in ai_result.get("detected_risks", []):
        if isinstance(risk, dict):
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
        profile_type=profile_type,
        analysis_mode="advanced",
        message="AI-powered analysis completed",
    )


async def analyze_adult_risk(data: AdultInput) -> AnalysisResponse:
    """Analyze adult health risks using external AI only."""
    ai_result = await call_external_ai_api("adult", data.model_dump())
    return _build_analysis_response("adult", ai_result)


async def analyze_pregnant_risk(data: PregnantInput) -> AnalysisResponse:
    """Analyze pregnant health risks using external AI only."""
    ai_result = await call_external_ai_api("pregnant", data.model_dump())
    return _build_analysis_response("pregnant", ai_result)
