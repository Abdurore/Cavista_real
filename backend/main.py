from fastapi import FastAPI, HTTPException, status, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
try:
    from .model import AdultInput, PregnantInput, AnalysisResponse, ErrorResponse
    from .risk_engine import analyze_adult_risk, analyze_pregnant_risk, AnalysisUnavailableError
    from .config import Config
except ImportError:
    from model import AdultInput, PregnantInput, AnalysisResponse, ErrorResponse
    from risk_engine import analyze_adult_risk, analyze_pregnant_risk, AnalysisUnavailableError
    from config import Config
import logging
import time

# ============== APP SETUP ==============
app = FastAPI(
    title="PreventAI Health API",
    description="AI-powered health risk assessment for adults and pregnant women",
    version="1.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.ALLOWED_ORIGINS,
    allow_credentials=Config.ALLOW_CREDENTIALS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============== HEALTH CHECK ==============
@app.get("/")
def root():
    return {"message": "PreventAI API is running", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": time.time()}

# ============== ADULT ANALYSIS ENDPOINT ==============
@app.post(
    "/analyze/adult",
    response_model=AnalysisResponse,
    responses={
        400: {"model": ErrorResponse},
        422: {"model": ErrorResponse},
        503: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def analyze_adult(data: AdultInput):
    """
    Analyze health risks for general adult users.
    Returns risk score, detected risks, and personalized recommendations.
    """
    try:
        logger.info(f"Received adult analysis request: age={data.age}, bp={data.systolic_bp}/{data.diastolic_bp}")
        
        # Run advanced analysis
        result = await analyze_adult_risk(data)
        
        logger.info(f"Analysis complete: risk_score={result.risk_score}, level={result.risk_level}")
        return result
        
    except AnalysisUnavailableError as e:
        logger.warning(f"Adult AI analysis unavailable: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "error": "service_unavailable",
                "message": "Advanced AI analysis is currently unavailable. Please try again later.",
            }
        )
    except Exception:
        logger.exception("Unexpected adult analysis error")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "internal_error",
                "message": "Unexpected internal server error.",
            },
        )

# ============== PREGNANT ANALYSIS ENDPOINT ==============
@app.post(
    "/analyze/pregnant",
    response_model=AnalysisResponse,
    responses={
        400: {"model": ErrorResponse},
        422: {"model": ErrorResponse},
        503: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def analyze_pregnant(data: PregnantInput):
    """
    Analyze health risks for pregnant women.
    Includes pregnancy-specific risk factors (preeclampsia, gestational diabetes, etc.)
    """
    try:
        logger.info(f"Received pregnant analysis request: age={data.age}, weeks={data.gestational_weeks}, bp={data.systolic_bp}/{data.diastolic_bp}")
        
        # Run advanced analysis
        result = await analyze_pregnant_risk(data)
        
        logger.info(f"Analysis complete: risk_score={result.risk_score}, level={result.risk_level}")
        return result
        
    except AnalysisUnavailableError as e:
        logger.warning(f"Pregnant AI analysis unavailable: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "error": "service_unavailable",
                "message": "Advanced AI analysis is currently unavailable. Please try again later.",
            }
        )
    except Exception:
        logger.exception("Unexpected pregnant analysis error")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "internal_error",
                "message": "Unexpected internal server error.",
            },
        )

# ============== ERROR HANDLER ==============
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    detail = exc.detail if isinstance(exc.detail, dict) else {"message": str(exc.detail)}
    payload = {
        "error": detail.get("error", "http_error"),
        "field": detail.get("field"),
        "message": detail.get("message", str(exc.detail))
    }
    return JSONResponse(status_code=exc.status_code, content=payload)


@app.exception_handler(RequestValidationError)
async def request_validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    field = None
    message = "Invalid request payload."
    if errors:
        first_error = errors[0]
        loc = first_error.get("loc", [])
        field_parts = [str(part) for part in loc if part != "body"]
        field = ".".join(field_parts) if field_parts else None
        message = first_error.get("msg", message)

    payload = ErrorResponse(
        error="validation_error",
        field=field,
        message=message,
    )
    return JSONResponse(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, content=payload.model_dump())
