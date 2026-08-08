import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Search, Network, Layers } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { cn } from "@/lib/utils";
import { useAgent } from "../hooks/useAgent";

export const Route = createFileRoute("/memory")({
  head: () => ({
    meta: [
      { title: "Memory Engine — PersonaAI" },
      {
        name: "description",
        content:
          "Browse the PersonaAI memory graph: stored topics, embedding scores, importance weighting and the posts each memory shaped.",
      },
      { property: "og:title", content: "Memory Engine — PersonaAI" },
      {
        property: "og:description",
        content: "The memory graph that stops the persona from repeating itself.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Memory,
});

const NODES = Array.from({ length: 22 }, (_, i) => {
  const angle = (i / 22) * Math.PI * 2;
  const radius = i % 3 === 0 ? 34 : i % 3 === 1 ? 22 : 43;
  return {
    id: i,
    x: 50 + Math.cos(angle) * radius,
    y: 50 + Math.sin(angle) * radius * 0.78,
    r: i % 4 === 0 ? 5 : 3,
  };
});

function MemoryGraph({ count }: { count: number }) {
  return (
    <div className="glass relative overflow-hidden rounded-3xl p-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold tracking-tight">Memory graph</h2>
          <p className="text-xs text-muted-foreground">
            {count} entries · 7 semantic clusters
          </p>
        </div>
        <Network className="size-4 shrink-0 text-[color:var(--cyan)]" />
      </div>
      <svg viewBox="0 0 100 100" className="mt-3 h-[280px] w-full sm:h-[340px]">
        <defs>
          <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--violet)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        {NODES.map((n, i) => (
          <motion.line
            key={`e-${i}`}
            x1={50}
            y1={50}
            x2={n.x}
            y2={n.y}
            stroke="url(#edge)"
            strokeWidth="0.25"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.1, delay: i * 0.04 }}
          />
        ))}
        {NODES.map((n, i) =>
          i % 4 === 0 ? (
            <motion.line
              key={`c-${i}`}
              x1={n.x}
              y1={n.y}
              x2={NODES[(i + 5) % NODES.length]!.x}
              y2={NODES[(i + 5) % NODES.length]!.y}
              stroke="var(--indigo)"
              strokeOpacity="0.22"
              strokeWidth="0.18"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.4, delay: 0.6 + i * 0.05 }}
            />
          ) : null,
        )}
        <motion.circle
          cx={50}
          cy={50}
          r={7}
          fill="var(--violet)"
          animate={{ r: [7, 7.8, 7], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        {NODES.map((n, i) => (
          <motion.circle
            key={`n-${i}`}
            cx={n.x}
            cy={n.y}
            r={n.r}
            fill={i % 4 === 0 ? "var(--cyan)" : "var(--indigo)"}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: [0.55, 1, 0.55] }}
            transition={{
              scale: { duration: 0.4, delay: 0.3 + i * 0.04 },
              opacity: { duration: 3 + (i % 5), repeat: Infinity },
            }}
            style={{ transformOrigin: `${n.x}px ${n.y}px` }}
          />
        ))}
      </svg>
    </div>
  );
}

function Memory() {
  const { data, loading } = useAgent();
  const [query, setQuery] = useState("");
  const [cluster, setCluster] = useState("All");
  const [sort, setSort] = useState<"importance" | "recent">("importance");

  const memories = data?.memories || [];

  const clusters = useMemo(() => {
    const rawClusts = memories.map((m) => m.cluster.trim());
    const unique = rawClusts.reduce((acc: string[], curr: string) => {
      if (curr && !acc.some(x => x.toLowerCase() === curr.toLowerCase())) {
        acc.push(curr);
      }
      return acc;
    }, []);
    return ["All", ...unique];
  }, [memories]);

  const filtered = useMemo(() => {
    const list = memories.filter(
      (m) =>
        (cluster === "All" || m.cluster === cluster) &&
        m.topic.toLowerCase().includes(query.toLowerCase()),
    );
    return [...list].sort((a, b) =>
      sort === "importance"
        ? b.importance - a.importance
        : b.createdAt.localeCompare(a.createdAt),
    );
  }, [memories, query, cluster, sort]);

  if (loading || !data) {
    return (
      <AppShell title="Memory" subtitle="Loading memory graph...">
        <div className="glass h-64 rounded-3xl animate-pulse bg-secondary/35 mb-5" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass h-36 rounded-2xl bg-secondary/35 animate-pulse" />
          ))}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Memory"
      subtitle="Everything the persona remembers, scored by importance and semantic distance."
    >
      <MemoryGraph count={memories.length} />

      <div className="glass my-5 flex flex-col gap-3 rounded-2xl p-3 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-border/60 bg-background/40 px-3 py-2">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search memory entries…"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {clusters.map((c) => (
            <button
              key={c}
              onClick={() => setCluster(c)}
              className={cn(
                "shrink-0 rounded-xl px-3 py-1.5 text-xs transition-colors",
                cluster === c
                  ? "bg-gradient-brand font-medium text-background"
                  : "border border-border/60 text-muted-foreground hover:text-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <button
          onClick={() => setSort((s) => (s === "importance" ? "recent" : "importance"))}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-border/60 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <Layers className="size-3.5" />
          {sort === "importance" ? "By importance" : "Most recent"}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.slice(0, 36).map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.35, delay: Math.min(i, 8) * 0.04 }}
            className="glass glow-hover rounded-2xl p-4"
          >
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <p className="text-sm font-medium leading-snug">{m.topic}</p>
              <span className="shrink-0 rounded-lg border border-border/60 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                {m.cluster}
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {m.summary}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-[11px] text-muted-foreground">
              <div>
                <p>Embedding</p>
                <p className="font-mono text-foreground">{m.embeddingScore}</p>
              </div>
              <div>
                <p>Importance</p>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-secondary">
                  <motion.span
                    className="block h-full rounded-full bg-gradient-brand"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${m.importance}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9 }}
                  />
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3 text-[11px]">
              <span className="text-muted-foreground">
                {new Date(m.createdAt).toLocaleDateString("en-GB")}
              </span>
              {m.relatedPostIds.map((pid) => (
                <Link
                  key={pid}
                  to="/post/$id"
                  params={{ id: pid }}
                  className="rounded-md bg-secondary/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:text-[color:var(--cyan)]"
                >
                  {pid}
                </Link>
              ))}
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-center text-xs text-muted-foreground py-10">No memories match search criteria.</p>
        )}
      </div>
    </AppShell>
  );
}
