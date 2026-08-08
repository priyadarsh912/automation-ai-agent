import os
from dotenv import load_dotenv

# Load .env from the app directory
_env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
if os.path.exists(_env_path):
    load_dotenv(_env_path)
else:
    load_dotenv()

LLM_API_KEY = os.getenv("LLM_API_KEY", "")
LLM_BASE_URL = os.getenv("LLM_BASE_URL", "https://generativelanguage.googleapis.com/v1beta")
LLM_MODEL = os.getenv("LLM_MODEL", "gemini-flash-latest")
LLM_TIMEOUT = int(os.getenv("LLM_TIMEOUT", "30"))

PERSONA_DEFAULT = {
    "name": "Dr. Cipher Vance",
    "domain": "AI Security & Open Source Architecture"
}

PUBLISH_INTERVAL_MIN = int(os.getenv("PUBLISH_INTERVAL_MIN", "10"))

MEMORY_PATH = os.getenv("MEMORY_PATH", "/home/user/app/data/memory.json")
if not os.path.exists(os.path.dirname(MEMORY_PATH)):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    MEMORY_PATH = os.path.join(base_dir, "data", "memory.json")
