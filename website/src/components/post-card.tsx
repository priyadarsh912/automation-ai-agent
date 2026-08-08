import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Bookmark, Heart, Share2, ExternalLink, Sparkles, Clock } from "lucide-react";
import type { Post } from "@/lib/mock-data";
import { persona } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useAgent } from "../hooks/useAgent";

function timeAgo(iso: string) {
  const diff = Date.UTC(2026, 7, 7, 17, 0, 0) - new Date(iso).getTime();
  const h = Math.max(1, Math.round(diff / 3600000));
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export function PostCard({ post, index = 0 }: { post: Post; index?: number }) {
  const { data } = useAgent();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const activeName = data?.persona.name || persona.name;
  const activeRole = data?.persona.domain || persona.role;
  const activeHandle = `@${activeName.toLowerCase().replace(/\s+/g, '')}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: Math.min(index, 6) * 0.05, ease: "easeOut" }}
      className="glass glow-hover rounded-3xl p-5 sm:p-6"
    >
      <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-gradient-brand text-sm font-bold text-background">
          {activeName[0]}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            {activeName}{" "}
            <span className="font-normal text-muted-foreground">{activeHandle}</span>
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {activeRole} · {timeAgo(post.publishedAt)}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-border/70 bg-surface-2/50 px-2.5 py-1 text-[11px] text-muted-foreground">
          {post.category}
        </span>
      </header>

      <Link to="/post/$id" params={{ id: post.id }} className="mt-4 block">
        <h2 className="text-lg font-semibold leading-snug tracking-tight transition-colors hover:text-[color:var(--cyan)] sm:text-xl">
          {post.title}
        </h2>
      </Link>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {post.tags.map((t, idx) => (
          <span
            key={`${t}-${idx}`}
            className="rounded-lg border border-border/60 bg-secondary/40 px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
          >
            #{t}
          </span>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/8 p-3.5">
        <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-[color:var(--violet)]">
          <Sparkles className="size-3" /> Editorial rationale
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{post.rationale}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {post.sources.map((s) => (
          <a
            key={s.label}
            href={s.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-[color:var(--cyan)]/40 hover:text-foreground"
          >
            <ExternalLink className="size-3" />
            {s.label}
          </a>
        ))}
      </div>

      <footer className="mt-5 flex items-center gap-1 border-t border-border/60 pt-4">
        <button
          onClick={() => setLiked((v) => !v)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors hover:bg-secondary",
            liked ? "text-[color:var(--violet)]" : "text-muted-foreground",
          )}
        >
          <Heart className={cn("size-4", liked && "fill-current")} />
          {(post.likes + (liked ? 1 : 0)).toLocaleString()}
        </button>
        <button
          onClick={() => setSaved((v) => !v)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors hover:bg-secondary",
            saved ? "text-[color:var(--cyan)]" : "text-muted-foreground",
          )}
        >
          <Bookmark className={cn("size-4", saved && "fill-current")} />
          {post.bookmarks}
        </button>
        <button className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary">
          <Share2 className="size-4" />
          {post.shares}
        </button>
        <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          {post.readingTime} min
        </span>
      </footer>
    </motion.article>
  );
}
