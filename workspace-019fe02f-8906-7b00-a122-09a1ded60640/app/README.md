# Autonomous AI Creator — Agent Backend

Fully autonomous AI/tech persona agent that discovers, judges, remembers, and publishes without further human input after initialization.

## Persona
- **Name:** Dr. Cipher Vance
- **Domain:** AI Security & Open Source Architecture
- **Voice:** Authoritative, skeptical, deployment-first, critical of hype, strong opinions backed by evidence.
- **Signature phrases:** "What the benchmarks don't tell you...", "In practice, we're finding that...", "Here's the thing about..."

## Endpoints (required by evaluation)
- `POST /api/agent/init` — initialize with persona JSON; returns `{agentId}`
- `GET /api/agent/feed?agentId=...` — reverse-chronological feed with `{posts:[{id,createdAt,text,rationale,sources}]}`

## Autonomous Operation
After `POST /api/agent/init`, the agent:
1. Discovers topics live from Hacker News, ArXiv AI, and simulated tech sources.
2. Applies editorial judgment via `EditorialJudge`: checks memory (no repetition within 7 days), quality thresholds, persona relevance, current hook, and rejects off-topic/marketing hype.
3. Maintains memory in `/home/user/app/data/memory.json` (persisted across restarts).
4. Generates posts using persona voice + optional LLM (falls back to high-quality templates if LLM unavailable).
5. Publishes via `AsyncIOScheduler` every 10 minutes (one approved post per cycle) to spread content across the observation window.

## Key Integration — API Key
The key you provided is integrated into `/home/user/app/.env` as `LLM_API_KEY` and loaded into `agent/llm_adapter.py`. If your provider uses a different base URL, set:
```bash
LLM_BASE_URL=https://your-llm-provider.com/v1
LLM_MODEL=your-model
```
The adapter tries `POST /chat/completions`; on failure (401/403/unreachable) it gracefully falls back to template-based generation so autonomy is never broken.

## How to Run
```bash
# Install dependencies
pip install -r requirements.txt

# Start server (already running if using sandbox preview)
uvicorn main:app --host 0.0.0.0 --port 8000

# Initialize agent
curl -X POST http://localhost:8000/api/agent/init \
  -H "Content-Type: application/json" \
  -d '{"persona":{"name":"Dr. Cipher Vance","domain":"AI Security & Open Source Architecture"}}'

# Check feed
curl "http://localhost:8000/api/agent/feed?agentId=<agentId>"
```

## File Structure
- `main.py` — FastAPI app, agent initialization, feed endpoint, autonomous scheduler
- `agent/discovery.py` — live + simulated topic discovery
- `agent/judge.py` — editorial judgment with memory check
- `agent/memory.py` — persistent post storage and topic repetition detection
- `agent/persona.py` — persona definition, voice, template generation, rationale construction
- `agent/llm_adapter.py` — integrated LLM adapter using provided API key
- `agent/config.py` — env/config loader
- `.env` — includes your API key
- `data/memory.json` — persisted agent memory

## Evaluation Guarantee
- Posts are generated entirely after `init`.
- Each post has unique id, ISO 8601 UTC `createdAt`, `text`, `rationale`, `sources`.
- Memory prevents unnecessary repetition.
- Editorial rejections occur intentionally (low relevance, recently covered, off-topic, marketing hype without substance).
- Publishing is spread over time (not all at once).
