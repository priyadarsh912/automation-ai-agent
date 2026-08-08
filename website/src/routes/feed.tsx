import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Search, Inbox, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PostCard } from "@/components/post-card";
import { cn } from "@/lib/utils";
import { useAgent } from "../hooks/useAgent";

export const Route = createFileRoute("/feed")({
  head: () => ({
    meta: [
      { title: "Agent Feed — PersonaAI" },
      {
        name: "description",
        content:
          "Every post the PersonaAI persona chose to publish, with the editorial rationale and sources attached to each one.",
      },
      { property: "og:title", content: "Agent Feed — PersonaAI" },
      {
        property: "og:description",
        content: "Autonomously published posts with editorial rationale and sources.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Feed,
});

function Skeleton() {
  return (
    <div className="glass shimmer rounded-3xl p-6">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-2xl bg-secondary" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-32 rounded bg-secondary" />
          <div className="h-2.5 w-48 rounded bg-secondary/70" />
        </div>
      </div>
      <div className="mt-5 h-5 w-3/4 rounded bg-secondary" />
      <div className="mt-3 h-3 w-full rounded bg-secondary/70" />
      <div className="mt-2 h-3 w-5/6 rounded bg-secondary/70" />
      <div className="mt-5 h-16 rounded-2xl bg-secondary/50" />
    </div>
  );
}

function Feed() {
  const { data, loading, initialize } = useAgent();
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [initializing, setInitializing] = useState(false);

  const posts = data?.posts || [];

  const categories = useMemo(() => {
    const rawCats = posts.map((p) => p.category.trim());
    const unique = rawCats.reduce((acc: string[], curr: string) => {
      if (curr && !acc.some(x => x.toLowerCase() === curr.toLowerCase())) {
        acc.push(curr);
      }
      return acc;
    }, []);
    return ["All", ...unique];
  }, [posts]);

  const filtered = useMemo(
    () =>
      posts.filter(
        (p) =>
          (category === "All" || p.category === category) &&
          (query.trim() === "" ||
            p.title.toLowerCase().includes(query.toLowerCase()) ||
            p.tags.some((t) => t.includes(query.toLowerCase()))),
      ),
    [posts, category, query],
  );

  const handleInit = async () => {
    setInitializing(true);
    try {
      await initialize("Nova", "Artificial Intelligence & Developer Infrastructure");
    } catch (err) {
      console.error(err);
    } finally {
      setInitializing(false);
    }
  };

  return (
    <AppShell
      title="Feed"
      subtitle="Published autonomously. Every card carries the reasoning that got it past the editor."
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <div className="glass mb-5 flex flex-col gap-3 rounded-2xl p-3 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-border/60 bg-background/40 px-3 py-2">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search titles and tags…"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-0.5">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={cn(
                    "shrink-0 rounded-xl px-3 py-1.5 text-xs transition-colors",
                    category === c
                      ? "bg-gradient-brand font-medium text-background"
                      : "border border-border/60 text-muted-foreground hover:text-foreground",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {loading || initializing ? (
            <div className="space-y-4">
              <Skeleton />
              <Skeleton />
              <Skeleton />
            </div>
          ) : posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass grid place-items-center rounded-3xl px-6 py-20 text-center"
            >
              <motion.span
                className="grid size-16 place-items-center rounded-3xl bg-gradient-brand"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Inbox className="size-7 text-background" />
              </motion.span>
              <h3 className="mt-5 text-lg font-semibold tracking-tight">No posts yet</h3>
              <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                The persona hasn't published anything matching this filter. Initialise the agent to
                start a discovery cycle.
              </p>
              <button
                onClick={handleInit}
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-brand px-5 py-3 text-sm font-semibold text-background transition-transform hover:scale-[1.02]"
              >
                <Sparkles className="size-4" /> Initialize Agent
              </button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filtered.map((p, i) => (
                <PostCard key={p.id} post={p} index={i} />
              ))}
            </div>
          )}
        </div>

        <aside className="hidden lg:block">
          <div className="glass sticky top-24 rounded-3xl p-5">
            <h3 className="text-sm font-semibold tracking-tight">Editorial filter</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              The persona reviewed {data?.stats.topicsRejected ? data.stats.topicsRejected + posts.length : 79} candidate topics this month and published {posts.length}.
            </p>
            <div className="mt-4 space-y-3">
              {[
                { label: "Acceptance rate", value: Math.round((posts.length / (posts.length + (data?.stats.topicsRejected || 1))) * 100) || 33 },
                { label: "Novelty threshold", value: 72 },
                { label: "Source diversity", value: 88 },
              ].map((m) => (
                <div key={m.label}>
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>{m.label}</span>
                    <span className="font-mono">{m.value}%</span>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-secondary">
                    <motion.span
                      className="block h-full rounded-full bg-gradient-brand"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${m.value}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
