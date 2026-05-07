import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartPointReceita, ChartPointVolume } from "@/lib/dashboard-view";

const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 0,
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  color: "var(--foreground)",
};

export function RevenueAreaChart({ data, chartDays }: { data: ChartPointReceita[]; chartDays?: number }) {
  const days = chartDays ?? (data.length > 0 ? data.length : 14);
  return (
    <div className="border border-border bg-card p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Receita / Wagoo
          </div>
          <div className="mt-1 font-mono text-lg text-foreground">Fluxo agregado</div>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{days}d</div>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="grad-receita" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--neon-white)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--neon-white)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="t" stroke="var(--muted-foreground)" tick={{ fontFamily: "var(--font-mono)", fontSize: 10 }} tickLine={false} axisLine={{ stroke: "var(--border)" }} />
            <YAxis stroke="var(--muted-foreground)" tick={{ fontFamily: "var(--font-mono)", fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "var(--neon-white)", strokeWidth: 1, strokeDasharray: "2 2" }} />
            <Area type="monotone" dataKey="receita" stroke="var(--neon-white)" strokeWidth={1.5} fill="url(#grad-receita)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function VolumeBarChart({ data, chartDays }: { data: ChartPointVolume[]; chartDays?: number }) {
  const days = chartDays ?? (data.length > 0 ? data.length : 14);
  return (
    <div className="border border-border bg-card p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Volume / 2AVENDAS
          </div>
          <div className="mt-1 font-mono text-lg text-foreground">Transações por dia</div>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/80">{days}d</div>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <XAxis dataKey="t" stroke="var(--muted-foreground)" tick={{ fontFamily: "var(--font-mono)", fontSize: 10 }} tickLine={false} axisLine={{ stroke: "var(--border)" }} />
            <YAxis stroke="var(--muted-foreground)" tick={{ fontFamily: "var(--font-mono)", fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "color-mix(in oklab, var(--neon-white) 6%, transparent)" }} />
            <Bar dataKey="volume" fill="var(--neon-white)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}