import httpx
import logging
from typing import Optional
from .config import LLM_API_KEY, LLM_BASE_URL, LLM_MODEL, LLM_TIMEOUT

logger = logging.getLogger("agent.llm")

class LLMGenerator:
    """Adapter for the Gemini generativeLanguage API.

    Uses the native Gemini REST endpoint:
        POST {base_url}/models/{model}:generateContent?key={api_key}

    Falls back gracefully when the API is unreachable or returns errors,
    so autonomy is never broken.
    """

    def __init__(self):
        self.api_key = LLM_API_KEY
        self.base_url = LLM_BASE_URL.rstrip("/")
        self.model = LLM_MODEL
        self.timeout = LLM_TIMEOUT
        self.available = bool(self.api_key)

    async def generate(self, prompt: str, max_tokens: int = 2048, temperature: float = 0.75) -> Optional[str]:
        """Send a prompt to Gemini and return the generated text, or None on failure."""
        if not self.available:
            logger.warning("LLM API key not set — skipping LLM generation")
            return None

        url = f"{self.base_url}/models/{self.model}:generateContent?key={self.api_key}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_tokens,
                "topP": 0.9,
                "topK": 40,
            },
            "safetySettings": [
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
            ],
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.post(
                    url,
                    json=payload,
                    headers={"Content-Type": "application/json"},
                )

                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            text = parts[0].get("text", "").strip()
                            if text and len(text) > 30:
                                logger.info("LLM generated %d chars", len(text))
                                return text
                    logger.warning("LLM returned empty or short response")
                    return None
                else:
                    body = resp.text[:300]
                    logger.error("LLM API error %d: %s", resp.status_code, body)
                    return None

        except httpx.TimeoutException:
            logger.error("LLM request timed out after %ds", self.timeout)
            return None
        except Exception as exc:
            logger.error("LLM request failed: %s", exc)
            return None

    async def generate_rationale(self, topic_title: str, topic_source: str, persona_domain: str, previous_topics: list) -> Optional[str]:
        """Generate a publishing rationale for a topic using the LLM."""
        prev_str = ", ".join(previous_topics[:5]) if previous_topics else "none yet"
        prompt = f"""You are an editorial AI explaining why a specific topic was chosen for publication.

Persona domain: {persona_domain}
Topic title: {topic_title}
Topic source: {topic_source}
Previously covered topics: {prev_str}

Write a concise rationale (2-4 sentences) covering:
1. Why this topic was selected (relevance to the persona's domain)
2. Why it is relevant right now (timeliness, current events, industry trends)
3. Why it was chosen over other candidates

Be specific and analytical. Do not use generic filler language."""

        return await self.generate(prompt, max_tokens=300, temperature=0.6)
