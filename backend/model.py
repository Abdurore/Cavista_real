from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Literal
from enum import Enum

# ============== ENUMS ==============
class StressLevel(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"

class RiskLevel(str, Enum):
    GREEN = "green"
    YELLOW = "yellow"
    RED = "red"

# ============== ADULT INPUT MODEL ==============
class AdultInput(BaseModel):
    # Personal & Body Metrics
    name: str = Field(description="Your name")
    age: int = Field(..., ge=0, le=150, description="Age in years")
    gender: str = Field(..., description="Gender")
    height_cm: float = Field(..., ge=50, le=250, description="Height in cm")
    weight_kg: float = Field(..., ge=2, le=300, description="Weight in kg")
    
    # Health Measurements
    systolic_bp: int = Field(..., ge=50, le=300, description="Systolic Blood Pressure")
    diastolic_bp: int = Field(..., ge=30, le=200, description="Diastolic Blood Pressure")
    blood_sugar: float = Field(..., ge=30, le=600, description="Blood Sugar (mg/dL)")
    
    # Lifestyle Factors
    sleep_hours: float = Field(..., ge=0, le=24, description="Sleep hours per night")
    exercise_days: int = Field(..., ge=0, le=7, description="Exercise days per week")
    stress_level: StressLevel

# ============== PREGNANT INPUT MODEL ==============
class PregnantInput(BaseModel):
    # Personal Information
    name: str = Field(description="Your name")
    age: int = Field(..., ge=10, le=60, description="Age in years")
    height_cm: float = Field(..., ge=50, le=250, description="Height in cm")
    weight_kg: float = Field(..., ge=30, le=250, description="Weight in kg")
    
    # Pregnancy Details
    gestational_weeks: int = Field(..., ge=0, le=45, description="Gestational age in weeks")
    first_pregnancy: bool = Field(..., description="Is this the first pregnancy?")
    high_risk_history: bool = Field(..., description="History of high-risk pregnancy?")
    
    # Health Measurements
    systolic_bp: int = Field(..., ge=50, le=300, description="Systolic Blood Pressure")
    diastolic_bp: int = Field(..., ge=30, le=200, description="Diastolic Blood Pressure")
    blood_sugar: float = Field(..., ge=30, le=600, description="Blood Sugar (mg/dL)")
    
    # Lifestyle Factors
    sleep_hours: float = Field(..., ge=0, le=24, description="Sleep hours per night")
    water_intake: float = Field(..., ge=0, le=10, description="Water intake (liters/day)")
    stress_level: StressLevel

# ============== OUTPUT MODELS ==============
class RiskCard(BaseModel):
    risk_type: str
    severity: RiskLevel
    description: str
    recommendation: str

class AnalysisResponse(BaseModel):
    risk_score: int  # 0-100
    risk_level: RiskLevel
    detected_risks: List[RiskCard]
    recommendations: List[str]
    profile_type: Literal["adult", "pregnant"]
    analysis_mode: Literal["advanced"] = "advanced"
    message: Optional[str] = None

class ErrorResponse(BaseModel):
    error: str
    field: Optional[str] = None
    message: str
