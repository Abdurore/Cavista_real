import os
from dotenv import load_dotenv

load_dotenv()  # Load .env file

class Config:
    # External AI API Settings
    EXTERNAL_AI_API_URL = os.getenv("EXTERNAL_AI_API_URL", "")
    EXTERNAL_AI_API_KEY = os.getenv("EXTERNAL_AI_API_KEY", "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")
    EXTERNAL_AI_TIMEOUT = int(os.getenv("EXTERNAL_AI_TIMEOUT", "5"))  # seconds
    
    # Toggle AI API on/off (for demo without API key)
    USE_EXTERNAL_AI = os.getenv("USE_EXTERNAL_AI", "false").lower() == "true"
