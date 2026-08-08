import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  FileText,
  XCircle,
  Radio,
  Database,
  Gauge,
  CheckCircle2,
  Sparkles,
  Send,
  Search,
  ArrowUpRight,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Counter } from "@/components/counter";
import { useAgent } from "../hooks/useAgent";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Agent Dashboard — PersonaAI" },
      {
        name: "description",
        content:
          "Live control room for the PersonaAI agent: publishing stats, rejection rate, monitored sources and a real-time editorial activity timeline.",
      },
      { property: "og:title", content: "Agent Dashboard — PersonaAI" },
      {
        property: "og:description",
        content: "Publishing stats, rejection rate and a live editorial activity timeline.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const KIND_META = {
  discover: { icon: Search, color: "var(--cyan)", label: "Discovery" },
  reject: { icon: XCircle, color: "oklch(0.63 0.22 25.5)", label: "Rejected" },
  accept: { icon: CheckCircle2, color: "var(--success)", label: "Accepted" },
  generate: { icon: Sparkles, color: "var(--violet)", label: "Generating" },
  publish: { icon: Send, color: "var(--indigo)", label: "Published" },
} as const;

function Dashboard() {
  const { data, loading, triggerCycle } = useAgent();

  if (loading || !data) {
    return (
      <AppShell title="Agent control room" subtitle="Loading live statistics...">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="glass h-28 rounded-2xl bg-secondary/35" />
          ))}
        </div>
      </AppShell>
    );
  }

  const posts = data.posts || [];
  const rejected = data.rejected || [];
  const sources = data.sources || [];
  const activity = data.activity || [];
  const stats = data.stats;

  const totalEvaluated = posts.length + rejected.length;
  const filterRate = totalEvaluated > 0 ? Math.round((rejected.length / totalEvaluated) * 100) : 67;

  const statCards = [
    { label: "Posts Published", value: stats.postsPublished, icon: FileText, hint: `Total active feed` },
    { label: "Topics Rejected", value: stats.topicsRejected, icon: XCircle, hint: `${filterRate}% filter rate` },
    { label: "Sources Monitored", value: stats.sourcesMonitored, icon: Radio, hint: `${sources.filter(s => s.enabled).length} active` },
    { label: "Memory Entries", value: stats.memoryEntries, icon: Database, hint: "Context graph" },
    { label: "Publishing Score", value: stats.publishingScore, icon: Gauge, hint: "Excellent" },
  ];

  return (
    <AppShell
      title="Agent control room"
      subtitle={`Everything ${data.persona.name || 'the persona'} discovered, judged, and published — without being asked.`}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
            className="glass glow-hover relative overflow-hidden rounded-2xl p-4"
          >
            <div
              className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full blur-2xl"
              style={{ background: "var(--gradient-soft)" }}
            />
            <span className="relative grid size-9 place-items-center rounded-xl bg-gradient-brand">
              <c.icon className="size-4 text-background" />
            </span>
            <p className="relative mt-4 text-2xl font-semibold tracking-tight">
              <Counter value={c.value} />
              {c.label === "Publishing Score" && (
                <span className="text-base text-muted-foreground">/100</span>
              )}
            </p>
            <p className="relative mt-0.5 text-xs text-muted-foreground">{c.label}</p>
            <p className="relative mt-2 text-[11px] text-[color:var(--cyan)]">{c.hint}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="glass rounded-3xl p-5 sm:p-6">
          <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <h2 className="text-base font-semibold tracking-tight">Live activity</h2>
              <p className="text-xs text-muted-foreground">Today · autonomous cycle</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={triggerCycle}
                className="rounded-xl border border-border/70 bg-surface-2/50 px-3 py-1 text-xs font-medium transition-colors hover:border-[color:var(--cyan)]/45"
              >
                Scan news now
              </button>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[color:var(--success)]/30 bg-[color:var(--success)]/10 px-2.5 py-1 text-[11px] text-[color:var(--success)]">
                <motion.span
                  className="size-1.5 rounded-full bg-current"
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                />
                streaming
              </span>
            </div>
          </header>

          {activity.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground text-center py-10">No recent activity. Scan news to start.</p>
          ) : (
            <ol className="relative mt-6 pl-8">
              <motion.span
                className="absolute left-[13px] top-1 w-px bg-gradient-to-b from-[color:var(--violet)] via-[color:var(--indigo)] to-transparent"
                initial={{ height: 0 }}
                animate={{ height: "100%" }}
                transition={{ duration: 1.6, ease: "easeOut" }}
              />
              {activity.map((step, i) => {
                const meta = KIND_META[step.kind];
                return (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.15, duration: 0.4 }}
                    className="relative pb-6 last:pb-0"
                  >
                    <span
                      className="absolute -left-8 grid size-7 place-items-center rounded-full border border-border bg-surface"
                      style={{ color: meta.color }}
                    >
                      <meta.icon className="size-3.5" />
                    </span>
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3">
                      <p className="truncate text-sm font-medium">{step.title}</p>
                      <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                        {step.time}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {step.detail}
                    </p>
                    <span
                      className="mt-2 inline-block rounded-md px-1.5 py-0.5 text-[10px] uppercase tracking-[0.1em]"
                      style={{ color: meta.color, background: `color-mix(in oklab, ${meta.color} 14%, transparent)` }}
                    >
                      {meta.label}
                    </span>
                  </motion.li>
                );
              })}
            </ol>
          )}
        </section>

        <div className="grid gap-5">
          <section className="glass rounded-3xl p-5 sm:p-6">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <h2 className="truncate text-base font-semibold tracking-tight">Recent posts</h2>
              <Link
                to="/feed"
                className="shrink-0 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                All <ArrowUpRight className="size-3" />
              </Link>
            </div>
            <ul className="mt-4 space-y-2">
              {posts.slice(0, 4).map((p) => (
                <li key={p.id}>
                  <Link
                    to="/post/$id"
                    params={{ id: p.id }}
                    className="block rounded-xl border border-border/60 p-3 transition-colors hover:border-primary/35 hover:bg-secondary/40"
                  >
                    <p className="line-clamp-1 text-sm font-medium">{p.title}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {p.category} · {p.readingTime} min · {p.likes.toLocaleString()} likes
                    </p>
                  </Link>
                </li>
              ))}
              {posts.length === 0 && (
                <p className="text-xs text-muted-foreground py-4 text-center">No posts published yet.</p>
              )}
            </ul>
          </section>

          <section className="glass rounded-3xl p-5 sm:p-6">
            <h2 className="text-base font-semibold tracking-tight">Top sources today</h2>
            <ul className="mt-4 space-y-3">
              {sources.slice(0, 5).map((s) => (
                <li key={s.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm">{s.name}</p>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-secondary">
                      <motion.span
                        className="block h-full rounded-full bg-gradient-brand"
                        initial={{ width: 0 }}
                        animate={{ width: `${s.reliability}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">
                    {s.itemsToday}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
