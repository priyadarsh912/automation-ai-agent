from typing import Tuple, Dict, Any
from .memory import MemorySystem

class EditorialJudge:
    def __init__(self, persona_config: Dict[str, Any]):
        self.persona_name = persona_config.get("name", "Agent")
        self.domain = persona_config.get("domain", "AI")
        self.quality_threshold = 0.55
        self.relevance_threshold = 0.65

    def should_publish(self, topic: Dict[str, Any], memory: MemorySystem) -> Tuple[bool, str]:
        title = topic.get("title", "")
        score = topic.get("score", 0)
        category = topic.get("category", "")

        # 1. Memory: not recently covered
        if memory.is_topic_recent(title, days=7):
            return False, "Topic recently covered by persona; avoid repetition."

        # 2. Quality threshold
        if score < self.quality_threshold * 100:
            return False, f"Quality score {score} below editorial threshold; not worth publishing."

        # 3. Relevance to persona (domain keyword matching + editorial judgment)
        relevance = self._relevance(title, category, topic.get("url",""))
        if relevance < self.relevance_threshold * 100:
            return False, f"Relevance score {relevance} too low for {self.domain} persona; would dilute identity."

        # 4. Must be current news (not evergreen without current hook)
        if not self._is_current_topic(topic):
            return False, "Not a current topic; lacks timely hook. Rejecting evergreen filler."

        # 5. Additional persona-specific editorial filter: reject purely marketing/product hype without substance
        low_text = title.lower()
        hype_words = ["announce", "launch", "unveil", "introduce", "new feature", "coming soon", "update"]
        if any(w in low_text for w in hype_words) and score < 80:
            return False, "Marketing announcement with insufficient technical substance; rejecting."

        # 6. Reject off-topic (e.g., pure crypto, pure sport, pure lifestyle) if not relevant
        off_topic = ["crypto", "bitcoin", "sports", "football", "basketball", "celebrity", "fashion", "travel"]
        if any(w in low_text for w in off_topic) and relevance < 70:
            return False, "Off-topic for AI/tech persona; editorial boundary enforced."

        return True, f"Selected for publication: strong relevance to {self.domain}, current, high quality, not recently covered."

    def _relevance(self, title: str, category: str, url: str) -> float:
        score = 50.0
        low = title.lower()
        # Domain keywords
        if self.domain.startswith("AI Security") or "security" in self.domain.lower():
            security_words = ["security", "adversarial", "robust", "vulnerability", "red-team", "exploit", "privacy", "attack", "defense", "threat", "risk", "audit"]
            if any(w in low for w in security_words):
                score += 30
        if "open" in self.domain.lower() or "source" in self.domain.lower():
            open_words = ["open source", "license", "github", "contributor", "repository", "community", "governance"]
            if any(w in low for w in open_words):
                score += 25
        if "ml" in self.domain.lower() or "machine learning" in self.domain.lower():
            ml_words = ["machine learning", "training", "inference", "model", "benchmark", "dataset", "gpu", "latency", "scaling"]
            if any(w in low for w in ml_words):
                score += 25
        # Category boost
        if category in ("security", "research", "open_source", "ml_engineering"):
            score += 15
        # URL source credibility boost
        if "arxiv.org" in url or "github.com" in url or "openai.com" in url or "huggingface.co" in url:
            score += 10
        return min(100.0, score)

    def _is_current_topic(self, topic: Dict[str, Any]) -> bool:
        # For simulated/news, consider current if score high or timestamp recent
        ts_str = topic.get("timestamp", "")
        try:
            from datetime import datetime, timezone, timedelta
            ts = datetime.fromisoformat(str(ts_str).replace("Z", "+00:00"))
            if ts.tzinfo is None:
                ts = ts.replace(tzinfo=timezone.utc)
            age_hours = (datetime.now(timezone.utc) - ts).total_seconds() / 3600
            if age_hours < 168:  # 7 days considered current
                return True
        except Exception:
            pass
        # If no timestamp but has high score, assume current
        return topic.get("score", 0) > 60
