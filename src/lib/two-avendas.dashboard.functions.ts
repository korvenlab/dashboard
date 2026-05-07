import { createServerFn } from "@tanstack/react-start";
import { setResponseHeaders } from "@tanstack/react-start/server";
import { z } from "zod";
import {
  buildFallbackDashboardViewModel,
  mapDashboardApiPayload,
  mergeDualDashboardViewModels,
  type DashboardViewModel,
} from "@/lib/dashboard-view";
import { getTwoAvendasServerEnv, getWagooServerEnv } from "@/lib/server-env";

const dashboardQuerySchema = z.object({
  organization_id: z.string().uuid().optional(),
  period_days: z.number().min(1).max(366).optional(),
  chart_days: z.number().min(1).max(366).optional(),
});

export type DashboardQueryInput = z.infer<typeof dashboardQuerySchema>;

type PullResult = { vm: DashboardViewModel | null; warn?: string };

async function pullDashboardJson(
  label: string,
  apiBaseUrl: string | undefined,
  apiKey: string | undefined,
  filtros: DashboardViewModel["meta"]["filtros"],
): Promise<PullResult> {
  const base = apiBaseUrl?.trim();
  const key = apiKey?.trim();

  if (!base || !key) {
    return {
      vm: null,
      warn: `${label}: defina ${label === "Wagoo" ? "WAGOO_API_BASE_URL e WAGOO_METRICS_API_KEY" : "TWO_AVENDAS_API_BASE_URL e TWO_AVENDAS_METRICS_API_KEY"} no servidor.`,
    };
  }

  const url = new URL(`${base.replace(/\/+$/, "")}/dashboard`);
  url.searchParams.set("period_days", String(filtros.period_days));
  url.searchParams.set("chart_days", String(filtros.chart_days));
  if (filtros.organization_id) url.searchParams.set("organization_id", filtros.organization_id);

  try {
    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${key}`,
        "X-API-Key": key,
        Accept: "application/json",
      },
    });

    const text = await res.text();
    let json: unknown;
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      return { vm: null, warn: `${label}: resposta não é JSON válido.` };
    }

    if (!res.ok) {
      return { vm: null, warn: `${label}: HTTP ${res.status}` };
    }

    const mapped = mapDashboardApiPayload(json, filtros);
    if (!mapped) {
      return { vm: null, warn: `${label}: payload sem KPIs/séries reconhecíveis.` };
    }

    return { vm: mapped };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { vm: null, warn: `${label}: ${msg}` };
  }
}

/** Consome **Wagoo** e **2AVENDAS** em paralelo (`GET /dashboard` em cada base URL) e unifica o view model. */
export const fetchTwoAvendasDashboard = createServerFn({ method: "GET" })
  .inputValidator(dashboardQuerySchema)
  .handler(async ({ data }): Promise<DashboardViewModel> => {
    setResponseHeaders(
      new Headers({
        "Cache-Control": "private, no-store",
      }),
    );

    const filtros = {
      organization_id: data.organization_id,
      period_days: data.period_days ?? 30,
      chart_days: data.chart_days ?? 14,
    };

    const wagooEnv = getWagooServerEnv();
    const avendasEnv = getTwoAvendasServerEnv();

    const [wagooPull, avendasPull] = await Promise.all([
      pullDashboardJson("Wagoo", wagooEnv.apiBaseUrl, wagooEnv.metricsApiKey, filtros),
      pullDashboardJson("2AVENDAS", avendasEnv.apiBaseUrl, avendasEnv.metricsApiKey, filtros),
    ]);

    const warnings = [wagooPull.warn, avendasPull.warn].filter(
      (w): w is string => typeof w === "string" && w.length > 0,
    );

    if (!wagooPull.vm && !avendasPull.vm) {
      return buildFallbackDashboardViewModel(
        filtros,
        warnings.length ? warnings.join(" ") : "Configure as APIs Wagoo e 2AVENDAS no servidor.",
      );
    }

    return mergeDualDashboardViewModels(wagooPull.vm, avendasPull.vm, filtros, warnings);
  });
