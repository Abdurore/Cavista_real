from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class AdultAnalyzeRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    age: float = Field(..., ge=0)
    weight: float = Field(..., gt=0)
    height: float = Field(..., gt=0)
    bloodPressure: float = Field(..., ge=0)


class PregnantAnalyzeRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    age: float = Field(..., ge=0)
    weight: float = Field(..., gt=0)
    weeks: float = Field(..., ge=0)


class AnalysisResponse(BaseModel):
    success: bool
    risk_score: int
    risk_level: str
    risk_factors: list[str]
    recommendations: list[str]
    ai_model: str
    analysis_source: str
