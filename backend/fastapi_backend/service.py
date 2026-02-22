from __future__ import annotations

import json
import logging
import os
from typing import Any

import httpx

logger = logging.getLogger("preventai")


class RiskAnalyzer:
    def __init__(self) -> None:
        self.api_key = os.getenv("GROQ_API_KEY", "").strip()
        self.model = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant").strip() or "llama-3.1-8b-instant"

    async def analyze_adult(self, data: dict[str, Any]) -> dict[str, Any]:
        prompt = (
            "Assess adult health risk from this data:\n"
            f"{json.dumps(data)}\n"
            "Return JSON with keys: risk_score (0-100 number), risk_level (Low|Moderate|High), "
            "risk_factors (array of short strings), recommendations (array of short actionable strings)."
        )
        try:
            return await self._call_groq(prompt)
        except Exception as exc:  # noqa: BLE001
            logger.exception("Groq adult analysis failed: %s", exc)
            return self._adult_fallback(data)

    async def analyze_pregnant(self, data: dict[str, Any]) -> dict[str, Any]:
        prompt = (
            "Assess maternal health risk from this pregnancy data:\n"
            f"{json.dumps(data)}\n"
            "Return JSON with keys: risk_score (0-100 number), risk_level (Low|Moderate|High), "
            "risk_factors (array of short strings), recommendations (array of short actionable strings)."
        )
        try:
            return await self._call_groq(prompt)
        except Exception as exc:  # noqa: BLE001
            logger.exception("Groq pregnancy analysis failed: %s", exc)
            return self._pregnancy_fallback(data)

    async def _call_groq(self, prompt: str) -> dict[str, Any]:
        if not self.api_key:
            raise ValueError("Missing GROQ_API_KEY")

        payload = {
            "model": self.model,
            "temperature": 0.2,
            "messages": [
                {"role": "system", "content": "You are a clinical risk assistant. Output ONLY valid JSON."},
                {"role": "user", "content": prompt},
            ],
        }
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

        async with httpx.AsyncClient(timeout=httpx.Timeout(30.0, connect=10.0)) as client:
            response = await client.post("https://api.groq.com/openai/v1/chat/completions", json=payload, headers=headers)

        if response.status_code >= 400:
            raise RuntimeError(f"Groq request failed with status {response.status_code}")

        content = response.json().get("choices", [{}])[0].get("message", {}).get("content", "")
        parsed = self._extract_json_payload(content)
        if not isinstance(parsed, dict):
            raise ValueError("Groq response did not contain parseable JSON payload")

        score = int(max(0, min(100, int(parsed.get("risk_score", 0)))))
        level = parsed.get("risk_level")
        if level not in {"Low", "Moderate", "High"}:
            level = "High" if score >= 60 else "Moderate" if score >= 30 else "Low"

        risks = parsed.get("risk_factors")
        if not isinstance(risks, list) or not risks:
            risks = ["No specific risks detected"]

        advice = parsed.get("recommendations")
        if not isinstance(advice, list) or not advice:
            advice = ["Maintain healthy lifestyle"]

        return {
            "score": score,
            "level": level,
            "risks": risks,
            "advice": advice,
            "source": "ai",
            "model": self.model,
        }

    @staticmethod
    def _extract_json_payload(content: str) -> dict[str, Any] | None:
        if not isinstance(content, str) or not content.strip():
            return None

        clean = content.strip()
        if clean.startswith("```json"):
            clean = clean[len("```json") :].strip()
        if clean.startswith("```"):
            clean = clean[3:].strip()
        if clean.endswith("```"):
            clean = clean[:-3].strip()

        try:
            return json.loads(clean)
        except json.JSONDecodeError:
            start = clean.find("{")
            end = clean.rfind("}")
            if start != -1 and end != -1 and end > start:
                try:
                    return json.loads(clean[start : end + 1])
                except json.JSONDecodeError:
                    return None
            return None

    @staticmethod
    def _adult_fallback(data: dict[str, Any]) -> dict[str, Any]:
        age = float(data.get("age", 0))
        weight = float(data.get("weight", 0))
        height = max(1.0, float(data.get("height", 1)))
        blood_pressure = float(data.get("bloodPressure", 0))

        bmi = weight / ((height / 100) ** 2)
        score = 5
        risks: list[str] = []
        advice: list[str] = []

        if bmi >= 30:
            score += 30
            risks.append("BMI in obese range")
            advice.append("Aim for gradual weight loss with a balanced calorie deficit")
        elif bmi >= 25:
            score += 18
            risks.append("BMI in overweight range")
            advice.append("Increase weekly activity and improve meal quality")

        if blood_pressure >= 140:
            score += 30
            risks.append("Systolic blood pressure is high")
            advice.append("Check blood pressure regularly and reduce sodium intake")
        elif blood_pressure >= 130:
            score += 18
            risks.append("Systolic blood pressure is elevated")
            advice.append("Prioritize daily movement and stress management")

        if age >= 60:
            score += 18
            risks.append("Age-related cardiovascular risk")
            advice.append("Schedule regular preventive checkups")
        elif age >= 45:
            score += 10
            risks.append("Midlife metabolic risk considerations")
            advice.append("Monitor blood sugar and lipids routinely")

        score = max(0, min(100, score))
        level = "High" if score >= 60 else "Moderate" if score >= 30 else "Low"

        if not risks:
            risks.append("No high-priority risk patterns detected")
        if not advice:
            advice.append("Maintain healthy lifestyle")

        return {
            "score": int(score),
            "level": level,
            "risks": list(dict.fromkeys(risks)),
            "advice": list(dict.fromkeys(advice)),
            "source": "fallback",
            "model": "rule-based-v2",
        }

    @staticmethod
    def _pregnancy_fallback(data: dict[str, Any]) -> dict[str, Any]:
        age = float(data.get("age", 0))
        weight = float(data.get("weight", 0))
        weeks = float(data.get("weeks", 0))

        score = 8
        risks: list[str] = []
        advice: list[str] = []

        if age >= 35:
            score += 18
            risks.append("Advanced maternal age")
            advice.append("Follow high-risk prenatal screening schedule")

        if weeks < 12:
            score += 8
            risks.append("Early pregnancy requires close symptom monitoring")
            advice.append("Keep regular first-trimester prenatal visits")
        elif weeks >= 28:
            score += 10
            risks.append("Third trimester monitoring needed")
            advice.append("Track fetal movement and blood pressure regularly")

        if weight >= 95:
            score += 14
            risks.append("Higher weight may increase pregnancy complications")
            advice.append("Work with your clinician on nutrition and activity plan")

        score = max(0, min(100, score))
        level = "High" if score >= 60 else "Moderate" if score >= 30 else "Low"

        if not risks:
            risks.append("No high-priority maternal risk patterns detected")
        if not advice:
            advice.append("Continue routine prenatal care")

        return {
            "score": int(score),
            "level": level,
            "risks": list(dict.fromkeys(risks)),
            "advice": list(dict.fromkeys(advice)),
            "source": "fallback",
            "model": "rule-based-pregnancy-v1",
        }
