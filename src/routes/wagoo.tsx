import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { KpiCard } from "@/components/kpi-card";
import { RevenueAreaChart } from "@/components/metrics-charts";
import { EventsTable } from "@/components/events-table";

const rootRouteApi = getRouteApi("__root__");

export const Route = createFileRoute("/wagoo")({
  head: () => ({ meta: [{ title: "Wagoo // Korven Lab" }] }),
  component: WagooPage,
});

function WagooPage() {
  const { dashboard } = rootRouteApi.useLoaderData();

  if (!dashboard) {
    return (
      <div className="p-6 font-mono text-sm text-muted-foreground">Métricas indisponíveis nesta rota.</div>
    );
  }

  const chartDays = dashboard.meta.filtros.chart_days;
  const events = dashboard.events.filter((e) => e.app === "wagoo" || e.app === "core");
  const primary =
    dashboard.kpis.find((k) => k.label.toLowerCase().includes("wagoo")) ?? dashboard.kpis[1];
  const receita = dashboard.kpis.find((k) => k.label.toLowerCase().includes("receita")) ?? dashboard.kpis[0];
  const uptime = dashboard.kpis.find((k) => k.label.toLowerCase().includes("uptime")) ?? dashboard.kpis[3];
  const kpis = [primary, receita, uptime].filter(Boolean);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="font-mono text-xl font-semibold uppercase tracking-[0.2em]">Wagoo</h1>
        <p className="mt-1 font-mono text-xs text-muted-foreground">
          Assinaturas e receita — série `wagoo.receita_por_dia` da API /dashboard.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>
      <RevenueAreaChart data={dashboard.wagooReceitaPorDia} chartDays={chartDays} />
      <EventsTable events={events.length ? events : dashboard.events} />
    </div>
  );
}
