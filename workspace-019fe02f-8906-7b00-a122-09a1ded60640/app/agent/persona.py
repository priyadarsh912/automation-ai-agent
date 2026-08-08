import random
import logging
from typing import List, Dict, Any, Optional
from .memory import MemorySystem
from .judge import EditorialJudge

logger = logging.getLogger("agent.persona")


class PersonaEngine:
    """Defines and maintains the AI persona's identity, voice, and content generation."""

    def __init__(self, config: Dict[str, Any]):
        self.name = config.get("name", "Dr. Cipher Vance")
        self.domain = config.get("domain", "AI Security & Open Source Architecture")
        self.voice = self._define_voice()
        self.interests = self._define_interests()
        self.editorial_style = self._define_editorial_style()

    def _define_voice(self) -> Dict[str, Any]:
        return {
            "tone": "authoritative, skeptical, pragmatic; writes like a senior researcher who has seen too many benchmarks fail in production.",
            "complexity": "advanced but accessible; avoids unnecessary jargon, explains mechanisms clearly.",
            "perspective": "deployment-first, security-conscious, open-source advocate; values reproducibility over hype.",
            "signature_phrases": [
                "What the benchmarks don't tell you...",
                "In practice, we're finding that...",
                "Here's the thing about...",
            ],
            "first_person": "I",
            "style_notes": "Short paragraphs, direct questions to reader, concrete examples over vague predictions, critical of vendor claims.",
        }

    def _define_interests(self) -> List[str]:
        return [
            "AI security and adversarial robustness",
            "Open source governance and model licensing",
            "ML systems engineering and inference efficiency",
            "Ethics, bias audits, and transparent evaluation",
            "Red-teaming autonomous agents and LLM pipelines",
        ]

    def _define_editorial_style(self) -> Dict[str, Any]:
        return {
            "post_length": "medium (150-300 words)",
            "format": "paragraph-based with occasional bullet points",
            "citation_practice": "Always cite sources; never claim without evidence.",
            "opinion_policy": "Strong opinions allowed if backed by analysis.",
            "repetition_avoidance": "Never repeat exact arguments; build on previous posts.",
        }

    # ------------------------------------------------------------------ #
    #  LLM prompt builder                                                 #
    # ------------------------------------------------------------------ #

    def build_post_prompt(self, topic: Dict[str, Any], memory: MemorySystem) -> str:
        """Build a detailed prompt for the LLM to generate a post in-persona."""
        previous = memory.get_posts(limit=4)
        covered = memory.get_unique_topics_covered()
        prev_summaries = "\n".join(
            [f"  - ({p.get('id','?')}) {p.get('text','')[:160]}..." for p in previous]
        ) or "  None yet — this will be the first post."
        covered_str = ", ".join(list(covered)[:20]) if covered else "none yet"

        prompt = f"""You are **{self.name}**, a {self.domain} expert and independent technology commentator.

## YOUR IDENTITY
- Voice: {self.voice['tone']}
- Perspective: {self.voice['perspective']}
- Interests: {', '.join(self.interests)}
- Signature phrases (use sparingly, naturally): {', '.join(f'"{p}"' for p in self.voice['signature_phrases'])}

## CONTEXT
Previously covered themes (avoid repeating these): {covered_str}

Recent posts for voice continuity:
{prev_summaries}

## TOPIC TO WRITE ABOUT
Title: {topic.get('title', 'Unknown')}
Source: {topic.get('source', 'Unknown')}
URL: {topic.get('url', '')}
Category: {topic.get('category', 'tech')}

## INSTRUCTIONS
Write a social media post (150-280 words) about the topic above.

Rules:
1. Open with a hook — a provocative observation or question that grabs attention
2. Provide critical analysis, not just a summary of the headline
3. Include at least one concrete technical insight or practical implication
4. Use your consistent voice — skeptical of hype, focused on deployment reality
5. Reference the source naturally (don't just paste a URL)
6. End with a strong opinion, prediction, or call-to-action for practitioners
7. Do NOT repeat arguments from your recent posts above
8. Do NOT use hashtags, emojis, or generic LinkedIn-style filler
9. Write as a single flowing piece — no headers, no bullet lists
10. Occasionally weave in one of your signature phrases where it fits naturally

Write ONLY the post text. No title, no metadata, no explanation."""

        return prompt

    def build_rationale_prompt(self, topic: Dict[str, Any], memory: MemorySystem) -> str:
        """Build a prompt for generating the publishing rationale."""
        previous = memory.get_posts(limit=3)
        prev_topics = [p.get("text", "")[:80] for p in previous]
        prev_str = ", ".join(prev_topics) if prev_topics else "no previous posts"

        prompt = f"""You are an editorial judgment system for {self.name}, a {self.domain} expert.

Topic being published: "{topic.get('title', '')}"
Source: {topic.get('source', '')} ({topic.get('url', '')})
Category: {topic.get('category', '')}

Recent published topics (for context): {prev_str}

Write a concise publishing rationale (3-5 sentences) that explains:
1. WHY this topic was selected — its relevance to {self.domain}
2. WHY it is relevant RIGHT NOW — what makes it timely
3. WHY it was chosen OVER other candidates — what editorial filters it passed
4. How it connects to previously published content (continuity)

Be specific and analytical. Mention concrete reasons, not generic statements.
Write ONLY the rationale text."""

        return prompt

    # ------------------------------------------------------------------ #
    #  Post generation (LLM-first, template fallback)                     #
    # ------------------------------------------------------------------ #

    def generate_post(
        self,
        topic: Dict[str, Any],
        memory: MemorySystem,
        judge: EditorialJudge,
        llm_text: Optional[str] = None,
        llm_rationale: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Generate a complete post dict with text, rationale, and sources."""

        # --- Text ---
        if llm_text and len(llm_text.strip()) > 50:
            text = llm_text.strip()
            # Clean any markdown artifacts the LLM might add
            if text.startswith('"') and text.endswith('"'):
                text = text[1:-1]
            logger.info("Using LLM-generated text (%d chars)", len(text))
        else:
            text = self._template_post(topic, memory, judge)
            logger.info("Using template-generated text (%d chars)", len(text))

        # Sprinkle signature phrases occasionally (if not already present)
        text = self._inject_signature(text)

        # --- Rationale ---
        if llm_rationale and len(llm_rationale.strip()) > 30:
            rationale = llm_rationale.strip()
        else:
            rationale = self._template_rationale(topic, judge, memory)

        # --- Sources ---
        sources = topic.get("sources", [topic.get("url", "")])
        sources = [s for s in sources if s and s.startswith("http")]

        return {"text": text, "rationale": rationale, "sources": sources}

    def _inject_signature(self, text: str) -> str:
        """Randomly inject a signature phrase if none present (25% chance per phrase)."""
        for phrase in self.voice["signature_phrases"]:
            if phrase.lower() in text.lower():
                continue
            if random.random() < 0.2:
                sentences = text.split(". ")
                if len(sentences) > 3:
                    idx = random.randint(1, min(3, len(sentences) - 1))
                    sentences[idx] = phrase + " " + sentences[idx]
                    text = ". ".join(sentences)
                break  # inject at most one
        return text

    # ------------------------------------------------------------------ #
    #  Template fallback                                                  #
    # ------------------------------------------------------------------ #

    def _template_post(self, topic: Dict[str, Any], memory: MemorySystem, judge: EditorialJudge) -> str:
        """Generate a post using templates when LLM is unavailable."""
        title = topic.get("title", "")
        source_name = topic.get("source", "industry sources")
        category = topic.get("category", "tech")
        previous = memory.get_posts(limit=3)

        paras = []

        # Opening hook
        hooks = [
            f"What the benchmarks don't tell you about {title.lower()}.",
            f"Here's the thing about {title.lower()} that most coverage misses.",
            f"Everyone is talking about {title.lower()}. Almost nobody is asking the right questions.",
        ]
        paras.append(random.choice(hooks) + " We need to be precise about what this actually means for production systems — not just the headline.")

        # Body — varies by category
        if "security" in category or any(w in title.lower() for w in ["security", "adversarial", "attack", "privacy", "red-team"]):
            paras.append(
                "The security community has been measuring robustness with standardized benchmarks for years. "
                "In practice, we're finding that those benchmarks don't translate to deployed pipelines because they test "
                "against known attack surfaces, not adaptive adversaries. If you're running models in production, the gap "
                "between paper accuracy and real-world resilience is the only metric that matters."
            )
        elif "open_source" in category or any(w in title.lower() for w in ["license", "governance", "open source"]):
            paras.append(
                "Open source governance isn't a legal afterthought — it's a security control. When model licenses don't "
                "include security clauses, downstream users inherit risk they never audited. This isn't about restricting "
                "access; it's about making risk explicit before deployment."
            )
        elif "ml_engineering" in category or any(w in title.lower() for w in ["inference", "latency", "deployment", "training"]):
            paras.append(
                "Latency and accuracy tradeoffs don't exist in isolation. At scale, the cost isn't just GPU hours — it's "
                "the engineering overhead of switching architectures under load. The right framework isn't the one with the "
                "best benchmark; it's the one your team can debug at 2 AM."
            )
        else:
            paras.append(
                "Most coverage of this topic stops at the announcement. What matters is how the mechanism behaves when "
                "data distributions shift, when adversarial inputs appear, or when the system has to explain its own "
                "decisions to an auditor."
            )

        # Source reference
        paras.append(
            f"Source: {source_name}. I recommend reading the primary source before drawing conclusions — "
            "secondary summaries often lose the caveats that matter most."
        )

        # Continuity
        if previous:
            paras.append(
                "Building on earlier discussions about deployment reality, this reinforces the pattern we've "
                "seen repeatedly: theoretical progress outpaces operational readiness."
            )

        # Closing
        closings = [
            "We should publish more critical analysis like this, not less. The AI ecosystem needs voices that prioritize deployment reality over marketing cycles.",
            "My take: if you're building with these systems, audit your assumptions before scaling. The gap between demo and production is where failures live.",
            "The question isn't whether this matters — it's whether your team is measuring the right things. In my experience, most aren't.",
        ]
        paras.append(random.choice(closings))

        return "\n\n".join(paras)

    def _template_rationale(self, topic: Dict[str, Any], judge: EditorialJudge, memory: MemorySystem) -> str:
        """Generate a rationale using templates when LLM is unavailable."""
        sources_str = ", ".join(topic.get("sources", [topic.get("url", "")]))
        title = topic.get("title", "")
        previous = memory.get_posts(limit=3)

        selected = f"Topic selected for its direct relevance to {self.domain}: {title.lower()} addresses active concerns in security, open-source governance, or ML systems engineering."
        timely = f"Timely because it reflects current production challenges — adversarial attacks, licensing gaps, or inference bottlenecks — not theoretical future problems."
        over_others = "Chosen over other candidates because it passed all editorial filters: not recently covered (memory check), quality score above threshold, current hook present, and directly relevant to persona interests."
        continuity = (
            "Connects to previous posts on deployment reality and critical evaluation, maintaining voice continuity."
            if previous
            else "Establishes the editorial baseline for future posts."
        )
        return f"{selected} {timely} {over_others} {continuity} Sources: {sources_str}"
