export type Kpi = {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
};

export type SeriesPoint = { t: string; receita: number; assinaturas: number; vendas: number };

export type AppEvent = {
  id: string;
  app: "wagoo" | "2avendas" | "core";
  status: "online" | "degraded" | "offline";
  message: string;
  timestamp: string;
};

export type MetricsResponse = {
  kpis: Kpi[];
  series: SeriesPoint[];
  events: AppEvent[];
};

const MOCK: MetricsResponse = {
  kpis: [
    { label: "Receita Total", value: "R$ 482.910", delta: "+12.4%", trend: "up" },
    { label: "Assinaturas Ativas (Wagoo)", value: "3.142", delta: "+4.8%", trend: "up" },
    { label: "Volume de Vendas (2AVENDAS)", value: "18.764", delta: "-2.1%", trend: "down" },
    { label: "Uptime Médio", value: "99.92%", delta: "+0.03%", trend: "up" },
  ],
  series: Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const seed = Math.sin(i * 1.3) * 0.5 + 1;
    return {
      t: d.toISOString().slice(5, 10),
      receita: Math.round(28000 + seed * 12000 + i * 600),
      assinaturas: Math.round(2400 + seed * 200 + i * 30),
      vendas: Math.round(1100 + seed * 500 + (i % 4) * 80),
    };
  }),
  events: [
    { id: "1", app: "wagoo", status: "online", message: "Deploy v2.14.3 finalizado", timestamp: "12:42:08" },
    { id: "2", app: "2avendas", status: "degraded", message: "Latência elevada no checkout", timestamp: "12:38:51" },
    { id: "3", app: "core", status: "online", message: "Sync de billing OK (1.204 registros)", timestamp: "12:30:11" },
    { id: "4", app: "2avendas", status: "offline", message: "Worker de notificações caiu", timestamp: "12:21:44" },
    { id: "5", app: "wagoo", status: "online", message: "Novo usuário admin criado", timestamp: "12:14:02" },
    { id: "6", app: "core", status: "online", message: "Backup S3 concluído", timestamp: "11:58:23" },
  ],
};

/** @deprecated Os dados vêm do servidor via `fetchTwoAvendasDashboard` (Wagoo + 2AVENDAS agregados) — não exponha chaves no browser. */
export async function fetchMetrics(_signal?: AbortSignal): Promise<MetricsResponse> {
  return MOCK;
}

export { MOCK as mockMetrics };