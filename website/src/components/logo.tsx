import { Link } from "@tanstack/react-router";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <span className="relative grid size-8 shrink-0 place-items-center rounded-xl bg-gradient-brand shadow-[0_8px_24px_-8px_var(--violet)]">
        <span className="size-3 rounded-[5px] bg-background/85 transition-transform duration-300 group-hover:rotate-45" />
      </span>
      {!compact && (
        <span className="text-[15px] font-semibold tracking-tight">
          Persona<span className="text-gradient">AI</span>
        </span>
      )}
    </Link>
  );
}
