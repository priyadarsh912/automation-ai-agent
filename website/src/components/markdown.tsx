import { Fragment } from "react";

/** Minimal markdown renderer for the agent's generated article bodies. */
export function Markdown({ content }: { content: string }) {
  const blocks: React.ReactNode[] = [];
  const lines = content.split("\n");
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i]!;

    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i]!.startsWith("```")) code.push(lines[i++]!);
      i++;
      blocks.push(
        <div key={key++} className="my-6 overflow-hidden rounded-2xl border border-border/70">
          <div className="flex items-center gap-2 border-b border-border/70 bg-surface-2/60 px-4 py-2">
            <span className="size-2.5 rounded-full bg-destructive/60" />
            <span className="size-2.5 rounded-full bg-[color:var(--warning)]/60" />
            <span className="size-2.5 rounded-full bg-[color:var(--success)]/60" />
            <span className="ml-2 font-mono text-[11px] text-muted-foreground">{lang || "code"}</span>
          </div>
          <pre className="overflow-x-auto bg-background/60 p-4 font-mono text-[12.5px] leading-relaxed text-muted-foreground">
            <code>{code.join("\n")}</code>
          </pre>
        </div>,
      );
      continue;
    }

    if (line.startsWith("> ")) {
      const quote: string[] = [];
      while (i < lines.length && lines[i]!.startsWith("> ")) quote.push(lines[i++]!.slice(2));
      blocks.push(
        <blockquote
          key={key++}
          className="my-6 rounded-2xl border border-[color:var(--cyan)]/25 bg-[color:var(--cyan)]/8 p-5 text-[15px] font-medium leading-relaxed"
        >
          {quote.join(" ")}
        </blockquote>,
      );
      continue;
    }

    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i]!.startsWith("- ")) items.push(lines[i++]!.slice(2));
      blocks.push(
        <ul key={key++} className="my-5 space-y-2.5">
          {items.map((it, n) => (
            <li key={n} className="flex gap-3 text-[15px] leading-relaxed text-muted-foreground">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gradient-brand" />
              <span>{inline(it)}</span>
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push(
        <h3 key={key++} className="mt-8 text-lg font-semibold tracking-tight">
          {line.slice(4)}
        </h3>,
      );
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push(
        <h2 key={key++} className="mt-10 text-xl font-semibold tracking-tight sm:text-2xl">
          {line.slice(3)}
        </h2>,
      );
      i++;
      continue;
    }

    if (line.trim() === "") {
      i++;
      continue;
    }

    const para: string[] = [];
    while (i < lines.length && lines[i]!.trim() !== "" && !/^(#|>|-\s|```)/.test(lines[i]!))
      para.push(lines[i++]!);
    blocks.push(
      <p key={key++} className="mt-4 text-[15px] leading-[1.8] text-muted-foreground">
        {inline(para.join(" "))}
      </p>,
    );
  }

  return <div>{blocks}</div>;
}

function inline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g).filter(Boolean);
  return parts.map((p, i) => {
    if (p.startsWith("**"))
      return (
        <strong key={i} className="font-semibold text-foreground">
          {p.slice(2, -2)}
        </strong>
      );
    if (p.startsWith("`"))
      return (
        <code
          key={i}
          className="rounded-md border border-border/70 bg-secondary/60 px-1.5 py-0.5 font-mono text-[13px] text-foreground"
        >
          {p.slice(1, -1)}
        </code>
      );
    if (p.startsWith("*"))
      return (
        <em key={i} className="italic">
          {p.slice(1, -1)}
        </em>
      );
    return <Fragment key={i}>{p}</Fragment>;
  });
}
