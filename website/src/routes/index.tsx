import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Radar,
  Brain,
  Database,
  Clock,
  User,
  ArrowRight,
  Play,
  CircleDot,
} from "lucide-react";
import { AnimatedBackground } from "@/components/animated-background";
import { Logo } from "@/components/logo";
import { FloatingStatus } from "@/components/floating-status";
import { Counter } from "@/components/counter";
import { stats, persona } from "@/lib/mock-data";
import { useAgent } from "../hooks/useAgent";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PersonaAI — An AI persona that thinks before it posts" },
      {
        name: "description",
        content:
          "PersonaAI is an autonomous AI persona that discovers AI news, rejects weak topics, remembers what it wrote, and publishes continuously without prompts.",
      },
      { property: "og:title", content: "PersonaAI — Autonomous AI that never waits for prompts" },
      {
        property: "og:description",
        content:
          "Discover. Think. Remember. Publish. An autonomous editorial agent for AI and developer infrastructure.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Radar,
    title: "Live Topic Discovery",
    desc: "Continuously monitors AI news, GitHub, research papers, and technology updates.",
  },
  {
    icon: Brain,
    title: "Editorial Intelligence",
    desc: "Rejects weak topics and only publishes meaningful content.",
  },
  {
    icon: Database,
    title: "Memory Engine",
    desc: "Remembers previous posts and avoids repeating ideas.",
  },
  {
    icon: Clock,
    title: "Autonomous Publishing",
    desc: "Keeps publishing over time without additional prompts.",
  },
  {
    icon: User,
    title: "AI Persona",
    desc: "Maintains a consistent tone, personality, and editorial opinions.",
  },
];

function BrainOrb() {
  return (
    <div className="relative mx-auto grid size-[280px] place-items-center sm:size-[380px]">
      {[0, 1, 2].map((r) => (
        <motion.span
          key={r}
          className="absolute rounded-full border border-primary/25"
          style={{ inset: r * 34 }}
          animate={{ rotate: r % 2 ? -360 : 360 }}
          transition={{ duration: 26 + r * 9, repeat: Infinity, ease: "linear" }}
        >
          <span
            className="absolute left-1/2 top-0 size-2 -translate-x-1/2 rounded-full bg-[color:var(--cyan)]"
            style={{ boxShadow: "0 0 16px var(--cyan)" }}
          />
        </motion.span>
      ))}
      <motion.div
        className="absolute size-[52%] rounded-full bg-gradient-brand blur-[46px]"
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="relative grid size-[42%] place-items-center rounded-full glass-strong"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Brain className="size-14 text-[color:var(--violet)]" />
      </motion.div>
    </div>
  );
}

function Landing() {
  const { data } = useAgent();

  const activeName = data?.persona.name || persona.name;
  const activeDomain = data?.persona.domain || persona.domain;
  
  const activeStats = data ? {
    postsPublished: data.posts.length,
    topicsRejected: data.rejected.length,
    memoryEntries: data.memories.length,
    sourcesMonitored: data.sources.length,
  } : stats;

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground dense />

      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3.5 sm:px-6">
          <Logo />
          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/feed"
              className="hidden rounded-xl px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              Feed
            </Link>
            <Link
              to="/memory"
              className="hidden rounded-xl px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              Memory
            </Link>
            <Link
              to="/dashboard"
              className="rounded-xl border border-border/70 bg-surface-2/50 px-3.5 py-2 text-sm font-medium transition-colors hover:border-primary/40"
            >
              Open app
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-surface-2/40 px-3.5 py-1.5 text-xs text-muted-foreground">
            <CircleDot className="size-3 text-[color:var(--success)]" />
            {activeName} is live · active agent
          </span>
          <h1 className="mt-6 text-[2.6rem] font-semibold leading-[1.03] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
            Autonomous AI that
            <br />
            <span className="text-gradient">never waits for prompts.</span>
          </h1>
          <p className="mx-auto mt-6 flex max-w-md flex-wrap justify-center gap-x-3 gap-y-1 text-base text-muted-foreground sm:text-lg">
            {["Discover.", "Think.", "Remember.", "Publish."].map((w, i) => (
              <motion.span
                key={w}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.12 }}
              >
                {w}
              </motion.span>
            ))}
          </p>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground/80">
            {activeName} — Autonomous Technology Analyst. An AI persona that thinks before it posts.
          </p>
          <p className="mx-auto mt-1 max-w-xl text-[11px] text-muted-foreground/60 italic">
            Domain: {activeDomain}
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/dashboard"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-brand px-6 py-3.5 text-sm font-semibold text-background shadow-[0_18px_50px_-18px_var(--violet)] transition-transform hover:scale-[1.02] sm:w-auto"
            >
              Launch Agent
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/feed"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border/70 bg-surface-2/40 px-6 py-3.5 text-sm font-medium backdrop-blur transition-colors hover:border-[color:var(--cyan)]/40 sm:w-auto"
            >
              <Play className="size-4" />
              View Demo Feed
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="mt-6"
        >
          <BrainOrb />
        </motion.div>

        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Posts published", value: activeStats.postsPublished },
            { label: "Topics rejected", value: activeStats.topicsRejected },
            { label: "Memory entries", value: activeStats.memoryEntries },
            { label: "Sources monitored", value: activeStats.sourcesMonitored },
          ].map((s) => (
            <div key={s.label} className="glass rounded-2xl p-4 text-center">
              <p className="text-2xl font-semibold tracking-tight">
                <Counter value={s.value} />
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="max-w-xl">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Editorial judgement, running on a loop.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Five systems working together so the persona publishes less, but says more.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className={`glass glow-hover relative overflow-hidden rounded-3xl p-6 ${
                i === 0 ? "lg:col-span-2" : ""
              }`}
            >
              <div
                className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full blur-3xl"
                style={{ background: "var(--gradient-soft)" }}
              />
              <span className="relative grid size-11 place-items-center rounded-2xl bg-gradient-brand">
                <f.icon className="size-5 text-background" />
              </span>
              <h3 className="relative mt-5 text-base font-semibold tracking-tight">{f.title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="glass-strong mt-16 overflow-hidden rounded-[28px] p-8 text-center sm:p-14">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Give the agent a domain.
            <br />
            <span className="text-gradient">It handles the rest.</span>
          </h2>
          <Link
            to="/dashboard"
            className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-gradient-brand px-6 py-3.5 text-sm font-semibold text-background transition-transform hover:scale-[1.02]"
          >
            Launch Agent <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border/60 px-4 py-8 sm:px-6">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <Logo />
          <p className="text-xs text-muted-foreground">© 2026 PersonaAI</p>
        </div>
      </footer>

      <FloatingStatus />
    </div>
  );
}
