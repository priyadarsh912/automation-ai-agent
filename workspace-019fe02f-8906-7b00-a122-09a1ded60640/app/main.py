import os
import sys
import json
import uuid
import asyncio
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import HTMLResponse
from pydantic import BaseModel

from agent.discovery import TopicDiscovery
from agent.memory import MemorySystem
from agent.judge import EditorialJudge
from agent.persona import PersonaEngine
from agent.llm_adapter import LLMGenerator
from agent.config import PERSONA_DEFAULT, PUBLISH_INTERVAL_MIN, MEMORY_PATH

from apscheduler.schedulers.asyncio import AsyncIOScheduler

# ------------------------------------------------------------------ #
#  Logging                                                            #
# ------------------------------------------------------------------ #
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
)
logger = logging.getLogger("agent.main")

# ------------------------------------------------------------------ #
#  FastAPI app & models                                               #
# ------------------------------------------------------------------ #
app = FastAPI(title="Autonomous AI Creator Agent")


class PersonaRequest(BaseModel):
    persona: Dict[str, Any]


class AgentResponse(BaseModel):
    agentId: str


class FeedResponse(BaseModel):
    posts: List[Dict[str, Any]]


# ------------------------------------------------------------------ #
#  Autonomous Agent                                                   #
# ------------------------------------------------------------------ #
class AutonomousAgent:
    """Core agent that autonomously discovers, judges, writes, and publishes."""

    def __init__(self):
        self.agent_id: Optional[str] = None
        self.persona_config: Optional[Dict] = None
        self.memory: Optional[MemorySystem] = None
        self.discovery: Optional[TopicDiscovery] = None
        self.judge: Optional[EditorialJudge] = None
        self.persona_engine: Optional[PersonaEngine] = None
        self.llm: Optional[LLMGenerator] = None
        self.scheduler: Optional[AsyncIOScheduler] = None
        self.is_running = False
        self._lock = asyncio.Lock()

        # Resolve meta path
        self.meta_path = "/home/user/app/data/agent_meta.json"
        if not os.path.exists(os.path.dirname(self.meta_path)):
            base_dir = os.path.dirname(os.path.abspath(__file__))
            self.meta_path = os.path.join(base_dir, "data", "agent_meta.json")

        # Defer loading meta to the startup event so the event loop is running

    # ---- Persistence ------------------------------------------------ #

    def _load_meta(self):
        try:
            if os.path.exists(self.meta_path):
                with open(self.meta_path, "r") as f:
                    meta = json.load(f)
                    self.agent_id = meta.get("agentId")
                    self.persona_config = meta.get("persona")
                if self.agent_id:
                    logger.info("Restoring agent %s from disk", self.agent_id)
                    self._setup_components()
                    self._start_scheduler()
        except Exception as exc:
            logger.error("Failed to load agent meta: %s", exc)

    def _save_meta(self):
        try:
            os.makedirs(os.path.dirname(self.meta_path), exist_ok=True)
            with open(self.meta_path, "w") as f:
                json.dump({"agentId": self.agent_id, "persona": self.persona_config}, f)
        except Exception as exc:
            logger.error("Failed to save agent meta: %s", exc)

    # ---- Initialization --------------------------------------------- #

    def _setup_components(self):
        """Create all agent sub-components."""
        cfg = self.persona_config or PERSONA_DEFAULT
        self.memory = MemorySystem(MEMORY_PATH)
        self.discovery = TopicDiscovery()
        self.judge = EditorialJudge(cfg)
        self.persona_engine = PersonaEngine(cfg)
        self.llm = LLMGenerator()
        self.is_running = True

    def _start_scheduler(self):
        """Start the autonomous publishing scheduler."""
        self.scheduler = AsyncIOScheduler()
        self.scheduler.add_job(
            self._publish_cycle,
            "interval",
            minutes=PUBLISH_INTERVAL_MIN,
            id="publish_cycle",
            replace_existing=True,
        )
        self.scheduler.start()
        logger.info("Scheduler started — publishing every %d min", PUBLISH_INTERVAL_MIN)

    def initialize(self, persona_config: Dict[str, Any]) -> str:
        """Called by POST /api/agent/init to create a new agent."""
        self.agent_id = str(uuid.uuid4())
        self.persona_config = persona_config or PERSONA_DEFAULT
        self._setup_components()
        self._start_scheduler()

        # Kick off first publish in background
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(self._first_publish())
        except RuntimeError:
            pass

        self._save_meta()
        logger.info("Agent initialized: %s (persona: %s)", self.agent_id, self.persona_config.get("name", "?"))
        return self.agent_id

    async def _first_publish(self):
        """Immediate first publish 5 seconds after init."""
        await asyncio.sleep(5)
        await self._publish_cycle()

    # ---- Autonomous Publishing Cycle -------------------------------- #

    async def _publish_cycle(self):
        """One autonomous cycle: discover → judge → generate → publish."""
        async with self._lock:
            if not self.is_running or not self.memory:
                return

            logger.info("=== Publish cycle started ===")

            # 1. Discover topics
            try:
                topics = await self.discovery.discover_topics()
            except Exception as exc:
                logger.error("Discovery failed: %s — using pool topics", exc)
                topics = self.discovery._simulated_topics()

            if not topics:
                logger.warning("No topics discovered — skipping cycle")
                return

            # 2. Evaluate candidates with editorial judgment
            published = False
            rejected_count = 0
            for topic in topics[:15]:
                try:
                    should_publish, reason = self.judge.should_publish(topic, self.memory)
                except Exception as exc:
                    logger.error("Judge error on '%s': %s", topic.get("title", "?")[:50], exc)
                    continue

                if not should_publish:
                    rejected_count += 1
                    logger.info("REJECTED: '%s' — %s", topic.get("title", "?")[:60], reason)
                    continue

                logger.info("APPROVED: '%s'", topic.get("title", "?")[:60])

                # 3. Generate post text via LLM (with template fallback)
                llm_text = None
                llm_rationale = None

                if self.llm and self.llm.available:
                    # Generate post text
                    post_prompt = self.persona_engine.build_post_prompt(topic, self.memory)
                    try:
                        llm_text = await self.llm.generate(post_prompt)
                    except Exception as exc:
                        logger.error("LLM post generation failed: %s", exc)

                    # Generate rationale
                    rationale_prompt = self.persona_engine.build_rationale_prompt(topic, self.memory)
                    try:
                        llm_rationale = await self.llm.generate(rationale_prompt, max_tokens=1024, temperature=0.5)
                    except Exception as exc:
                        logger.error("LLM rationale generation failed: %s", exc)

                # 4. Assemble the post (LLM text or template fallback)
                post_data = self.persona_engine.generate_post(
                    topic=topic,
                    memory=self.memory,
                    judge=self.judge,
                    llm_text=llm_text,
                    llm_rationale=llm_rationale,
                )

                post_id = f"p{len(self.memory.posts) + 1}"
                post = {
                    "id": post_id,
                    "createdAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
                    "text": post_data["text"],
                    "rationale": post_data["rationale"],
                    "sources": post_data["sources"],
                }
                self.memory.add_post(post)
                published = True
                logger.info("PUBLISHED: %s — %d chars", post_id, len(post["text"]))
                # Publish only ONE per cycle to spread across the observation window
                break

            if not published:
                logger.info("No topic approved this cycle (rejected %d)", rejected_count)
            logger.info("=== Publish cycle ended ===")

    # ---- Feed ------------------------------------------------------- #

    def get_feed(self, limit: int = 50) -> List[Dict[str, Any]]:
        if not self.memory:
            return []
        return self.memory.get_posts(limit=limit)


# ------------------------------------------------------------------ #
#  Global agent instance                                              #
# ------------------------------------------------------------------ #
agent = AutonomousAgent()


# ------------------------------------------------------------------ #
#  Lifecycle Events                                                   #
# ------------------------------------------------------------------ #

@app.on_event("startup")
async def startup_event():
    logger.info("Restoring agent meta on application startup...")
    agent._load_meta()


# ------------------------------------------------------------------ #
#  API Endpoints                                                      #
# ------------------------------------------------------------------ #

@app.post("/api/agent/init", response_model=AgentResponse)
async def initialize_agent(request: PersonaRequest):
    agent_id = agent.initialize(request.persona)
    return {"agentId": agent_id}


@app.get("/api/agent/feed", response_model=FeedResponse)
async def get_feed(agentId: str = Query(...)):
    if agent.agent_id is None:
        agent._load_meta()
    if agent.agent_id is None:
        raise HTTPException(status_code=404, detail="Agent not initialized")
    if agent.agent_id != agentId:
        raise HTTPException(status_code=404, detail="Agent not found")

    posts = agent.get_feed()
    # Ensure correct format for every post
    for p in posts:
        p.setdefault("id", "unknown")
        p.setdefault("createdAt", datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"))
        p.setdefault("text", "")
        p.setdefault("rationale", "")
        p.setdefault("sources", [])
    return {"posts": posts}


@app.get("/api/agent/id")
async def get_agent_id():
    return {"agentId": agent.agent_id, "persona": agent.persona_config}


@app.get("/", response_class=HTMLResponse)
async def read_index():
    index_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "index.html")
    if os.path.exists(index_path):
        with open(index_path, "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    return HTMLResponse(content="<h1>index.html not found</h1>", status_code=404)


# ------------------------------------------------------------------ #
#  Entrypoint                                                         #
# ------------------------------------------------------------------ #
if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.getenv("PORT", "8001"))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
