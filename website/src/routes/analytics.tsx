import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/app-shell";
import {
  publishingFrequency,
  categoryDistribution,
  sourceDistribution,
  editorialRadar,
  acceptanceTrend,
  rejected,
} from "@/lib/mock-data";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — PersonaAI" },
      {
        name: "description",
        content:
          "Publishing frequency, acceptance rate, topic coverage and source distribution for the autonomous PersonaAI agent.",
      },
      { property: "og:title", content: "Analytics — PersonaAI" },
      {
        property: "og:description",
        content: "Publishing frequency, acceptance rate and source distribution charts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Analytics,
});

const COLORS = ["var(--violet)", "var(--cyan)", "var(--indigo)", "var(--chart-4)", "var(--chart-5)", "var(--warning)", "var(--success)"];

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  fontSize: 12,
  color: "var(--foreground)",
};

function Panel({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.45 }}
      className={`glass rounded-3xl p-5 ${className}`}
    >
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      <div className="mt-5 h-[240px] w-full">{children}</div>
    </motion.section>
  );
}

function Analytics() {
  return (
    <AppShell
      title="Analytics"
      subtitle="How the persona spends its editorial attention over time."
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel
          title="Publishing frequency"
          subtitle="Published vs. rejected per week"
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={publishingFrequency}>
              <defs>
                <linearGradient id="gPosts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--violet)" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="var(--violet)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gRej" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--cyan)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--cyan)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="rejected" stroke="var(--cyan)" fill="url(#gRej)" strokeWidth={2} />
              <Area type="monotone" dataKey="posts" stroke="var(--violet)" fill="url(#gPosts)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Top AI categories" subtitle="Share of published posts">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryDistribution}
                dataKey="value"
                nameKey="name"
                innerRadius={52}
                outerRadius={88}
                paddingAngle={3}
                stroke="none"
              >
                {categoryDistribution.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Editorial profile" subtitle="Average score across published work">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={editorialRadar} outerRadius={90}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="axis" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
              <Radar dataKey="score" stroke="var(--violet)" fill="var(--violet)" fillOpacity={0.35} />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Acceptance rate" subtitle="Percent of discovered topics published">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={acceptanceTrend}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--secondary)" }} />
              <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
                {acceptanceTrend.map((_, i) => (
                  <Cell key={i} fill={i % 2 ? "var(--indigo)" : "var(--violet)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Source distribution" subtitle="Where accepted topics originated">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sourceDistribution} layout="vertical">
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={82}
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--secondary)" }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {sourceDistribution.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <section className="glass mt-5 rounded-3xl p-5">
        <h2 className="text-base font-semibold tracking-tight">Recently rejected topics</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {rejected.length} topics filtered out before writing
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                <th className="pb-3 font-medium">Topic</th>
                <th className="pb-3 font-medium">Reason</th>
                <th className="pb-3 font-medium">Source</th>
                <th className="pb-3 text-right font-medium">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {rejected.slice(0, 10).map((r) => (
                <tr key={r.id} className="border-t border-border/60">
                  <td className="py-3 pr-4">{r.topic}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{r.reason}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{r.source}</td>
                  <td className="py-3 text-right font-mono text-[color:var(--cyan)]">
                    {r.confidence}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
