from __future__ import annotations

import logging
import os
from datetime import datetime, timezone

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from fastapi_backend.schemas import AdultAnalyzeRequest, AnalysisResponse, PregnantAnalyzeRequest
from fastapi_backend.service import RiskAnalyzer

load_dotenv()
logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))

app = FastAPI(title="PreventAI API", version="1.0.0")
analyzer = RiskAnalyzer()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={
            "message": "Validation failed",
            "errors": exc.errors(),
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(_: Request, exc: Exception) -> JSONResponse:
    logging.exception("Unhandled exception: %s", exc)
    return JSONResponse(status_code=500, content={"message": "Internal server error"})


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "PreventAI API"}


@app.get("/api/test")
async def test() -> dict[str, str]:
    return {
        "status": "success",
        "message": "API is working!",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/api/health")
async def health() -> dict[str, bool]:
    return {"healthy": True}


@app.post("/api/analyze/adult", response_model=AnalysisResponse)
async def analyze_adult(payload: AdultAnalyzeRequest) -> dict[str, object]:
    ai_result = await analyzer.analyze_adult(payload.model_dump())
    return {
        "success": True,
        "risk_score": ai_result["score"],
        "risk_level": ai_result["level"],
        "risk_factors": ai_result.get("risks", []) or ["No specific risks detected"],
        "recommendations": ai_result.get("advice", []) or ["Maintain healthy lifestyle"],
        "ai_model": ai_result.get("model", "groq"),
        "analysis_source": ai_result.get("source", "unknown"),
    }


@app.post("/api/analyze/pregnant", response_model=AnalysisResponse)
async def analyze_pregnant(payload: PregnantAnalyzeRequest) -> dict[str, object]:
    ai_result = await analyzer.analyze_pregnant(payload.model_dump())
    return {
        "success": True,
        "risk_score": ai_result["score"],
        "risk_level": ai_result["level"],
        "risk_factors": ai_result.get("risks", []) or ["No specific risks detected"],
        "recommendations": ai_result.get("advice", []) or ["Maintain healthy lifestyle"],
        "ai_model": ai_result.get("model", "groq"),
        "analysis_source": ai_result.get("source", "unknown"),
    }