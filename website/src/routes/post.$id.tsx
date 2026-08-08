import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowLeft, Clock, Calendar, ExternalLink, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Markdown } from "@/components/markdown";
import type { Post } from "@/lib/mock-data";

export const Route = createFileRoute("/post/$id")({
  loader: async ({ params }): Promise<{ post: Post; related: Post[]; personaName: string }> => {
    let db;
    if (typeof window !== 'undefined') {
      try {
        const localStateStr = localStorage.getItem('agent_db_state');
        if (localStateStr) {
          db = JSON.parse(localStateStr);
        }
      } catch (e) {
        console.error("Loader failed to parse localStorage state", e);
      }
    }

    if (!db) {
      if (typeof window === 'undefined') {
        const { readDb } = await import('../lib/agent');
        db = readDb();
      } else {
        const res = await fetch('/api/agent/status');
        db = await res.json();
      }
    }

    const post = db.posts.find((p: any) => p.id === params.id);
    if (!post) throw notFound();

    const idx = db.posts.findIndex((p: any) => p.id === params.id);
    const related = Array.from({ length: 3 }, (_, i) => db.posts[(idx + i + 1) % db.posts.length]).filter(Boolean) as Post[];

    return { 
      post: post as Post, 
      related,
      personaName: db.persona.name || "Nova"
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Post unavailable — PersonaAI" }, { name: "robots", content: "noindex" }],
      };
    }
    const { post } = loaderData;
    return {
      meta: [
        { title: `${post.title} — PersonaAI` },
        { name: "description", content: post.excerpt },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.excerpt },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: PostDetail,
});

function PostDetail() {
  const { post, related, personaName } = Route.useLoaderData() as { post: Post; related: Post[]; personaName: string };
  const date = new Date(post.publishedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <AppShell title={post.title} subtitle={post.excerpt}>
      <Link
        to="/feed"
        className="mb-6 inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Back to feed
      </Link>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <article className="glass rounded-3xl p-6 sm:p-9">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="grid size-6 place-items-center rounded-lg bg-gradient-brand text-[10px] font-bold text-background">
                {personaName[0]}
              </span>
              {personaName}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5" /> {date}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" /> {post.readingTime} min read
            </span>
            <span className="rounded-full border border-border/70 px-2.5 py-0.5">
              {post.category}
            </span>
          </div>

          <div className="mt-3 h-px w-full bg-gradient-brand opacity-40" />

          <Markdown content={post.body} />

          <div className="mt-10 flex flex-wrap gap-1.5">
            {post.tags.map((t, idx) => (
              <span
                key={`${t}-${idx}`}
                className="rounded-lg border border-border/60 bg-secondary/40 px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
              >
                #{t}
              </span>
            ))}
          </div>
        </article>

        <aside className="space-y-5">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-5"
          >
            <h2 className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-[color:var(--violet)]">
              <Sparkles className="size-3" /> Editorial rationale
            </h2>
            <p className="mt-2.5 text-[13px] leading-relaxed text-muted-foreground">
              {post.rationale}
            </p>
          </motion.section>

          <section className="glass rounded-3xl p-5">
            <h2 className="text-sm font-semibold tracking-tight">Sources</h2>
            <ul className="mt-3 space-y-2">
              {post.sources.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-xl border border-border/60 px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-[color:var(--cyan)]/40 hover:text-foreground"
                  >
                    <ExternalLink className="size-3.5 shrink-0" />
                    <span className="truncate">{s.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section className="glass rounded-3xl p-5">
            <h2 className="text-sm font-semibold tracking-tight">Related previous posts</h2>
            <ul className="mt-3 space-y-2">
              {related.map((r) => (
                <li key={r.id}>
                  <Link
                    to="/post/$id"
                    params={{ id: r.id }}
                    className="block rounded-xl border border-border/60 p-3 transition-colors hover:border-primary/35 hover:bg-secondary/40"
                  >
                    <p className="line-clamp-2 text-xs font-medium leading-snug">{r.title}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{r.category}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
