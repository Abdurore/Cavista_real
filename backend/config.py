import os
from dotenv import load_dotenv

load_dotenv()  # Load .env file


class Config:
    # External AI API Settings
    EXTERNAL_AI_API_URL = os.getenv("EXTERNAL_AI_API_URL", "https://api.openai.com/v1/chat/completions")
    EXTERNAL_AI_API_KEY = os.getenv("EXTERNAL_AI_API_KEY", "")
    EXTERNAL_AI_MODEL = os.getenv("EXTERNAL_AI_MODEL", "gpt-4o-mini")
    EXTERNAL_AI_TIMEOUT = int(os.getenv("EXTERNAL_AI_TIMEOUT", "5"))  # seconds

    # AI should be enabled by default now that local fallback is removed.
    USE_EXTERNAL_AI = os.getenv("USE_EXTERNAL_AI", "true").lower() == "true"

    # CORS settings (comma-separated origins in env).
    _raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
    ALLOWED_ORIGINS = [origin.strip() for origin in _raw_origins.split(",") if origin.strip()]
    ALLOW_CREDENTIALS = os.getenv("ALLOW_CREDENTIALS", "false").lower() == "true"
