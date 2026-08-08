import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell,
  LayoutDashboard,
  Rss,
  Database,
  BarChart3,
  Settings as SettingsIcon,
  Menu,
  X,
  Search,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { FloatingStatus } from "@/components/floating-status";
import { AnimatedBackground } from "@/components/animated-background";
import { persona } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useAgent } from "../hooks/useAgent";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/feed", label: "Feed", icon: Rss },
  { to: "/memory", label: "Memory", icon: Database },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = pathname === item.to || pathname.startsWith(item.to + "/");
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId="nav-active"
                className="absolute inset-0 rounded-xl border border-primary/25 bg-primary/12"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <item.icon
              className={cn("relative size-[18px]", active && "text-[color:var(--violet)]")}
            />
            <span className="relative font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data } = useAgent();

  const activeName = data?.persona.name || persona.name;
  const activeStatus = data?.initialized ? "Running" : persona.status;

  return (
    <div className="min-h-screen">
      <AnimatedBackground />

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r border-border/70 bg-sidebar/70 px-4 py-5 backdrop-blur-xl lg:flex">
        <div className="px-1">
          <Logo />
        </div>
        <div className="mt-7">
          <p className="px-3 pb-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Agent
          </p>
          <NavLinks />
        </div>
        <div className="mt-auto rounded-2xl border border-border/70 bg-surface-2/50 p-3.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-[color:var(--success)]" />
            Autonomy uptime
          </div>
          <p className="mt-1.5 text-sm font-semibold">{persona.uptimeDays} days</p>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-secondary">
            <motion.div
              className="h-full rounded-full bg-gradient-brand"
              initial={{ width: 0 }}
              animate={{ width: "92%" }}
              transition={{ duration: 1.4, ease: "easeOut" }}
            />
          </div>
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col border-r border-border bg-sidebar px-4 py-5 lg:hidden"
            >
              <div className="flex items-center justify-between">
                <Logo />
                <button
                  aria-label="Close menu"
                  onClick={() => setMobileOpen(false)}
                  className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="mt-6">
                <NavLinks onNavigate={() => setMobileOpen(false)} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-30 border-b border-border/70 bg-background/70 backdrop-blur-xl">
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
            <button
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
              className="grid size-9 shrink-0 place-items-center rounded-xl border border-border/70 text-muted-foreground hover:bg-secondary lg:hidden"
            >
              <Menu className="size-4" />
            </button>
            <div className="hidden min-w-0 items-center gap-2 rounded-xl border border-border/70 bg-surface-2/40 px-3 py-2 text-sm text-muted-foreground lg:flex">
              <Search className="size-4 shrink-0" />
              <span className="truncate">Search posts, memory, sources…</span>
              <kbd className="ml-auto shrink-0 rounded-md border border-border px-1.5 py-0.5 font-mono text-[10px]">
                ⌘K
              </kbd>
            </div>
            <div className="min-w-0 lg:hidden" />
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <span className="hidden items-center gap-2 rounded-full border border-[color:var(--success)]/30 bg-[color:var(--success)]/10 px-3 py-1.5 text-xs font-medium text-[color:var(--success)] sm:inline-flex">
                <motion.span
                  className="size-1.5 rounded-full bg-[color:var(--success)]"
                  animate={{ opacity: [1, 0.25, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                />
                {activeStatus}
              </span>
              <button
                aria-label="Notifications"
                className="relative grid size-9 place-items-center rounded-xl border border-border/70 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <Bell className="size-4" />
                <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[color:var(--cyan)]" />
              </button>
              <div className="flex items-center gap-2.5 rounded-xl border border-border/70 py-1 pl-1 pr-1 sm:pr-3">
                <span className="grid size-7 place-items-center rounded-lg bg-gradient-brand text-xs font-bold text-background">
                  {activeName[0]}
                </span>
                <span className="hidden text-xs sm:block">
                  <span className="block font-medium leading-tight">{activeName}</span>
                  <span className="block leading-tight text-muted-foreground">Persona</span>
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-7 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mx-auto w-full max-w-[1180px]"
          >
            <div className="mb-7">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
              {subtitle && (
                <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
            {children}
          </motion.div>
        </main>
      </div>

      <FloatingStatus />
    </div>
  );
}
