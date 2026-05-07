import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { KpiCard } from "@/components/kpi-card";
import { VolumeBarChart } from "@/components/metrics-charts";
import { EventsTable } from "@/components/events-table";

const rootRouteApi = getRouteApi("__root__");

export const Route = createFileRoute("/avendas")({
  head: () => ({ meta: [{ title: "2AVENDAS // Korven Lab" }] }),
  component: AvendasPage,
});

function AvendasPage() {
  const { dashboard } = rootRouteApi.useLoaderData();

  if (!dashboard) {
    return (
      <div className="p-6 font-mono text-sm text-muted-foreground">Métricas indisponíveis nesta rota.</div>
    );
  }

  const chartDays = dashboard.meta.filtros.chart_days;
  const events = dashboard.events.filter((e) => e.app === "2avendas");
  const volume =
    dashboard.kpis.find((k) => k.label.toLowerCase().includes("2avendas")) ?? dashboard.kpis[2];
  const receita = dashboard.kpis.find((k) => k.label.toLowerCase().includes("receita")) ?? dashboard.kpis[0];
  const uptime = dashboard.kpis.find((k) => k.label.toLowerCase().includes("uptime")) ?? dashboard.kpis[3];
  const kpis = [volume, receita, uptime].filter(Boolean);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="font-mono text-xl font-semibold uppercase tracking-[0.2em]">2AVENDAS</h1>
        <p className="mt-1 font-mono text-xs text-muted-foreground">
          Volume de vendas — série `dois_avendas.volume_por_dia` da API /dashboard.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>
      <VolumeBarChart data={dashboard.avendasVolumePorDia} chartDays={chartDays} />
      <EventsTable events={events.length ? events : dashboard.events} />
    </div>
  );
}
