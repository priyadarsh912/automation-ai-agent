import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Check, Moon, Bell, Sliders, Rss } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { cn } from "@/lib/utils";
import { useAgent } from "../hooks/useAgent";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Agent Settings — PersonaAI" },
      {
        name: "description",
        content:
          "Tune the PersonaAI persona: editorial style, aggressiveness, publishing frequency, monitored sources and notification preferences.",
      },
      { property: "og:title", content: "Agent Settings — PersonaAI" },
      {
        property: "og:description",
        content: "Tune personality, editorial aggressiveness and publishing cadence.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Settings,
});

const STYLES = ["Analytical", "Conversational", "Contrarian", "Reportorial"];
const FREQUENCIES = ["2× daily", "Daily", "Every 2 days", "Weekly"];

function Card({
  icon: Icon,
  title,
  desc,
  children,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
      className="glass rounded-3xl p-5 sm:p-6"
    >
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-brand">
          <Icon className="size-4 text-background" />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </motion.section>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border/60 px-3.5 py-3 text-left transition-colors hover:bg-secondary/40"
    >
      <span className="truncate text-sm">{label}</span>
      <span
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors",
          checked ? "bg-gradient-brand" : "bg-secondary",
        )}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
          className={cn(
            "absolute top-0.5 size-4 rounded-full bg-foreground",
            checked ? "left-[18px]" : "left-0.5",
          )}
        />
      </span>
    </button>
  );
}

function Settings() {
  const { data, loading, saveSettings } = useAgent();

  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [style, setStyle] = useState(STYLES[0]!);
  const [frequency, setFrequency] = useState(FREQUENCIES[1]!);
  const [aggressiveness, setAggressiveness] = useState(68);
  const [darkMode, setDarkMode] = useState(true);
  const [notifs, setNotifs] = useState({ publish: true, reject: false, weekly: true });
  const [sources, setSources] = useState<any[]>([]);

  // Sync state once data loads
  useEffect(() => {
    if (data) {
      setName(data.persona.name || "");
      setDomain(data.persona.domain || "");
      setStyle(data.persona.style || STYLES[0]!);
      setFrequency(data.persona.frequency || FREQUENCIES[1]!);
      setAggressiveness(data.persona.aggressiveness ?? 68);
      setSources(data.sources || []);
    }
  }, [data]);

  const handleSave = async () => {
    try {
      await saveSettings({
        name,
        domain,
        style,
        frequency,
        aggressiveness,
        sources
      });
      toast.success("Configuration saved successfully!");
    } catch (err: any) {
      toast.error("Failed to save configuration: " + err.message);
    }
  };

  const toggleSource = (index: number) => {
    setSources((prev) =>
      prev.map((src, i) => (i === index ? { ...src, enabled: !src.enabled } : src))
    );
  };

  if (loading || !data) {
    return (
      <AppShell title="Settings" subtitle="Loading configuration...">
        <div className="grid gap-5 lg:grid-cols-2 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass h-64 rounded-3xl bg-secondary/35" />
          ))}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Settings" subtitle="Shape the persona's judgement, voice, and publishing cadence.">
      <div className="grid gap-5 lg:grid-cols-2">
        <Card icon={Sliders} title="Persona" desc="Identity and domain of expertise">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-brand text-xl font-bold text-background">
                {name[0] ?? "N"}
              </span>
              <div className="min-w-0 flex-1">
                <label className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  Persona name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border/60 bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary/50"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                Domain
              </label>
              <input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-border/60 bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                Editorial style
              </label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {STYLES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={cn(
                      "rounded-xl px-3 py-1.5 text-xs transition-colors",
                      style === s
                        ? "bg-gradient-brand font-medium text-background"
                        : "border border-border/60 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card icon={Moon} title="Behaviour" desc="How strict and how often the agent publishes">
          <div className="space-y-5">
            <div>
              <div className="flex items-baseline justify-between">
                <label className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  Editorial aggressiveness
                </label>
                <span className="font-mono text-xs text-[color:var(--cyan)]">
                  {aggressiveness}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={aggressiveness}
                onChange={(e) => setAggressiveness(Number(e.target.value))}
                className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-[color:var(--violet)]"
              />
              <p className="mt-2 text-[11px] text-muted-foreground">
                Higher values reject more topics and publish fewer, sharper posts.
              </p>
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                Publishing frequency
              </label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {FREQUENCIES.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFrequency(f)}
                    className={cn(
                      "rounded-xl px-3 py-1.5 text-xs transition-colors",
                      frequency === f
                        ? "bg-gradient-brand font-medium text-background"
                        : "border border-border/60 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <Toggle checked={darkMode} onChange={setDarkMode} label="Dark mode" />
          </div>
        </Card>

        <Card icon={Rss} title="News sources" desc={`${sources.length} sources monitored`}>
          <div className="max-h-[300px] space-y-2 overflow-y-auto pr-1">
            {sources.map((s, i) => (
              <div
                key={s.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border/60 px-3.5 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm">{s.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {s.domain} · {s.kind} · {s.reliability}% reliable
                  </p>
                </div>
                <button
                  onClick={() => toggleSource(i)}
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-lg border transition-colors",
                    s.enabled
                      ? "border-transparent bg-gradient-brand text-background"
                      : "border-border text-muted-foreground",
                  )}
                  aria-label={`Toggle ${s.name}`}
                >
                  {s.enabled && <Check className="size-3.5" />}
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card icon={Bell} title="Notifications" desc="What the agent should tell you about">
          <div className="space-y-2">
            <Toggle
              checked={notifs.publish}
              onChange={(v) => setNotifs((n) => ({ ...n, publish: v }))}
              label="When a new post is published"
            />
            <Toggle
              checked={notifs.reject}
              onChange={(v) => setNotifs((n) => ({ ...n, reject: v }))}
              label="When a topic is rejected"
            />
            <Toggle
              checked={notifs.weekly}
              onChange={(v) => setNotifs((n) => ({ ...n, weekly: v }))}
              label="Weekly editorial digest"
            />
          </div>
        </Card>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          className="rounded-2xl bg-gradient-brand px-6 py-3 text-sm font-semibold text-background transition-transform hover:scale-[1.02]"
        >
          Save configuration
        </button>
      </div>
    </AppShell>
  );
}
