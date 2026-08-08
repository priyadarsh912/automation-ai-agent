import httpx
import re
import random
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any

logger = logging.getLogger("agent.discovery")

# Large pool of current AI/tech topics for fallback / supplement
_TOPIC_POOL = [
    {"title": "Adversarial robustness benchmarks for vision transformers in production", "category": "security", "sources": ["https://arxiv.org/abs/2403.12001"]},
    {"title": "Open source governance: why model licenses need security clauses", "category": "open_source", "sources": ["https://huggingface.co/blog"]},
    {"title": "LLM inference latency vs accuracy tradeoffs at scale", "category": "ml_engineering", "sources": ["https://cloud.google.com/blog"]},
    {"title": "New red-teaming framework for autonomous AI agents", "category": "security", "sources": ["https://openai.com/research"]},
    {"title": "The hidden cost of synthetic data in medical AI pipelines", "category": "ethics", "sources": ["https://nature.com/articles"]},
    {"title": "Transformer architectures under memory pressure: a deployment study", "category": "ml_engineering", "sources": ["https://deepmind.google/blog"]},
    {"title": "Benchmark saturation in NLP: why accuracy isn't security", "category": "security", "sources": ["https://arxiv.org/abs/2405.00001"]},
    {"title": "Supply chain risks in open-source ML dependencies", "category": "open_source", "sources": ["https://github.com/advisories"]},
    {"title": "Privacy-preserving inference via homomorphic encryption at scale", "category": "security", "sources": ["https://eprint.iacr.org/2024/001"]},
    {"title": "Autonomous agent evaluation: beyond static benchmarks", "category": "security", "sources": ["https://openai.com/research"]},
    {"title": "Data contamination in fine-tuning datasets: detection methods", "category": "ethics", "sources": ["https://arxiv.org/abs/2407.12345"]},
    {"title": "Edge deployment of large models: compression vs accuracy", "category": "ml_engineering", "sources": ["https://tensorflow.org/blog"]},
    {"title": "Model extraction attacks: practical defenses for API providers", "category": "security", "sources": ["https://arxiv.org/abs/2408.99999"]},
    {"title": "Community governance of foundation model weights", "category": "open_source", "sources": ["https://stability.ai/blog"]},
    {"title": "Real-time monitoring of adversarial inputs in streaming pipelines", "category": "security", "sources": ["https://arxiv.org/abs/2402.77777"]},
    {"title": "Differential privacy in federated learning: what practitioners miss", "category": "security", "sources": ["https://arxiv.org/abs/2406.11111"]},
    {"title": "Why small language models outperform GPT-4 for domain-specific tasks", "category": "ml_engineering", "sources": ["https://huggingface.co/blog"]},
    {"title": "The false promise of AI safety benchmarks without red-team validation", "category": "security", "sources": ["https://anthropic.com/research"]},
    {"title": "Open-weight models and the supply chain security problem", "category": "open_source", "sources": ["https://github.com/advisories"]},
    {"title": "Quantization-aware training: the gap between papers and production", "category": "ml_engineering", "sources": ["https://pytorch.org/blog"]},
    {"title": "Watermarking LLM outputs: technical feasibility and adversarial evasion", "category": "security", "sources": ["https://arxiv.org/abs/2407.55555"]},
    {"title": "Multi-modal model alignment: lessons from RLHF failures", "category": "ethics", "sources": ["https://arxiv.org/abs/2408.33333"]},
    {"title": "GPU cluster scheduling for inference: Kubernetes vs custom orchestrators", "category": "ml_engineering", "sources": ["https://cloud.google.com/blog"]},
    {"title": "Prompt injection attacks on production RAG systems", "category": "security", "sources": ["https://owasp.org/www-project-top-ten"]},
    {"title": "The reproducibility crisis in machine learning research", "category": "ethics", "sources": ["https://neurips.cc/Conferences"]},
    {"title": "Sparse mixture-of-experts at the edge: deployment challenges", "category": "ml_engineering", "sources": ["https://deepmind.google/blog"]},
    {"title": "AI model cards: from compliance theater to real accountability", "category": "ethics", "sources": ["https://arxiv.org/abs/2406.77777"]},
    {"title": "Code generation models and the software supply chain attack surface", "category": "security", "sources": ["https://github.com/security"]},
    {"title": "Why RAG retrieval quality matters more than LLM size", "category": "ml_engineering", "sources": ["https://arxiv.org/abs/2407.88888"]},
    {"title": "Open-source AI regulation: EU AI Act implications for model providers", "category": "open_source", "sources": ["https://ec.europa.eu/digital-strategy"]},
]


class TopicDiscovery:
    """Discovers AI/tech topics from live sources (HN, ArXiv) and supplements
    with a curated pool to guarantee the agent always has fresh material."""

    TECH_KEYWORDS = frozenset([
        "ai", "machine learning", "security", "model", "open source", "robotics",
        "deep learning", "llm", "gpt", "neural", "algorithm", "data", "cloud", "api",
        "adversarial", "robustness", "privacy", "bias", "ethics", "gpu", "training",
        "inference", "benchmark", "dataset", "transformer", "vision", "nlp", "rag",
        "fine-tuning", "prompt", "agent", "autonomous", "safety", "alignment",
        "diffusion", "generative", "embedding", "vector", "quantization",
    ])

    def __init__(self):
        self.sources = ["Hacker News", "ArXiv AI", "Curated Tech Pool"]

    async def discover_topics(self) -> List[Dict[str, Any]]:
        """Fetch from all sources, deduplicate, score, and return ranked topics."""
        hn_topics = await self._fetch_hacker_news()
        arxiv_topics = await self._fetch_arxiv()
        pool_topics = self._get_pool_topics()

        all_topics = hn_topics + arxiv_topics + pool_topics

        # Deduplicate by title similarity
        seen = set()
        unique = []
        for t in all_topics:
            key = t["title"].lower()[:50]
            if key not in seen:
                seen.add(key)
                unique.append(t)

        # Score and rank
        for t in unique:
            t["score"] = self._score_topic(t)
        unique.sort(key=lambda x: x["score"], reverse=True)

        logger.info("Discovered %d unique topics (HN=%d, ArXiv=%d, Pool=%d)",
                     len(unique), len(hn_topics), len(arxiv_topics), len(pool_topics))
        return unique

    async def _fetch_hacker_news(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Fetch top stories from HN and filter for AI/tech relevance."""
        topics = []
        try:
            async with httpx.AsyncClient(timeout=12) as client:
                resp = await client.get("https://hacker-news.firebaseio.com/v0/topstories.json")
                if resp.status_code != 200:
                    return topics
                story_ids = resp.json()[:limit]
                for sid in story_ids:
                    try:
                        resp2 = await client.get(f"https://hacker-news.firebaseio.com/v0/item/{sid}.json")
                        if resp2.status_code != 200:
                            continue
                        item = resp2.json()
                        if not item or not item.get("title"):
                            continue
                        title = item["title"]
                        if not self._is_tech_relevant(title):
                            continue
                        url = item.get("url") or f"https://news.ycombinator.com/item?id={sid}"
                        topics.append({
                            "title": title,
                            "url": url,
                            "source": "Hacker News",
                            "score": item.get("score", 0),
                            "timestamp": datetime.fromtimestamp(item.get("time", 0), tz=timezone.utc).isoformat(),
                            "category": "tech_news",
                            "sources": [url],
                        })
                    except Exception:
                        continue
        except Exception as exc:
            logger.warning("Hacker News fetch failed: %s", exc)
        return topics

    async def _fetch_arxiv(self, limit: int = 12) -> List[Dict[str, Any]]:
        """Fetch recent AI papers from ArXiv Atom feed."""
        topics = []
        try:
            query = "http://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.LG+OR+cat:cs.CR&start=0&max_results=25&sortBy=submittedDate&sortOrder=descending"
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.get(query, headers={"User-Agent": "AutonomousAgent/2.0"})
                if resp.status_code != 200:
                    return topics
                text = resp.text
                entries = re.findall(r"<entry>(.*?)</entry>", text, re.DOTALL)
                for entry in entries[:limit]:
                    title_m = re.search(r"<title>(.*?)</title>", entry, re.DOTALL)
                    link_m = re.search(r"<id>(.*?)</id>", entry, re.DOTALL)
                    if not title_m:
                        continue
                    title = " ".join(title_m.group(1).strip().split())
                    link = link_m.group(1).strip() if link_m else ""
                    if self._is_tech_relevant(title):
                        topics.append({
                            "title": title,
                            "url": link,
                            "source": "ArXiv AI Papers",
                            "score": 80,
                            "timestamp": datetime.now(timezone.utc).isoformat(),
                            "category": "research",
                            "sources": [link],
                        })
        except Exception as exc:
            logger.warning("ArXiv fetch failed: %s", exc)
        return topics

    def _get_pool_topics(self) -> List[Dict[str, Any]]:
        """Return a time-rotated subset of the curated topic pool."""
        now = datetime.now(timezone.utc)
        # Use hour + day to rotate which topics surface
        idx = (now.day * 24 + now.hour) % len(_TOPIC_POOL)
        # Pick a window of 5 topics from the rotated pool
        rotated = _TOPIC_POOL[idx:] + _TOPIC_POOL[:idx]
        selection = rotated[:5]
        topics = []
        for item in selection:
            topics.append({
                "title": item["title"],
                "url": item["sources"][0] if item["sources"] else "",
                "source": "Curated Tech Pool",
                "score": random.randint(75, 95),
                "timestamp": now.isoformat(),
                "category": item["category"],
                "sources": item["sources"],
            })
        return topics

    def _is_tech_relevant(self, text: str) -> bool:
        """Check if text contains AI/tech keywords."""
        words = set(text.lower().split())
        low = text.lower()
        return any(k in low for k in self.TECH_KEYWORDS)

    def _score_topic(self, t: Dict[str, Any]) -> float:
        """Score a topic based on recency, source credibility, and domain match."""
        score = float(t.get("score", 50))

        # Recency boost
        try:
            ts = datetime.fromisoformat(str(t.get("timestamp", "")).replace("Z", "+00:00"))
            age_hours = (datetime.now(timezone.utc) - ts).total_seconds() / 3600
            if age_hours < 6:
                score += 15
            elif age_hours < 24:
                score += 8
            elif age_hours < 72:
                score += 3
        except Exception:
            pass

        # Domain relevance boost
        low_title = t.get("title", "").lower()
        security_words = ["security", "adversarial", "robust", "red-team", "privacy", "attack", "defense", "vulnerability"]
        if any(w in low_title for w in security_words):
            score += 12
        oss_words = ["open source", "license", "governance", "community", "github"]
        if any(w in low_title for w in oss_words):
            score += 8
        ml_words = ["inference", "training", "model", "benchmark", "deployment", "scaling"]
        if any(w in low_title for w in ml_words):
            score += 6

        # Source credibility
        url = t.get("url", "")
        if "arxiv.org" in url:
            score += 10
        elif "github.com" in url or "openai.com" in url or "deepmind" in url:
            score += 8

        return min(120.0, score)

    # Legacy alias used by main.py fallback
    def _simulated_topics(self) -> List[Dict[str, Any]]:
        return self._get_pool_topics()
