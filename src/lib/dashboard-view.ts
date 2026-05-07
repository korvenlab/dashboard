import { mockMetrics, type AppEvent, type Kpi } from "@/lib/metrics";

export type DashboardSource = "api" | "fallback";

export type DashboardMeta = {
  source: DashboardSource;
  ok?: boolean;
  gerado_em?: string;
  message?: string;
  filtros: {
    organization_id?: string;
    period_days: number;
    chart_days: number;
  };
};

export type ChartPointReceita = { t: string; receita: number };
export type ChartPointVolume = { t: string; volume: number };

export type UiSidebarItem = { label: string; href: string; icon?: string };

export type DashboardUiConfig = {
  sidebar_itens?: UiSidebarItem[];
  topbar?: Record<string, unknown>;
};

export type DashboardViewModel = {
  meta: DashboardMeta;
  kpis: Kpi[];
  wagooReceitaPorDia: ChartPointReceita[];
  avendasVolumePorDia: ChartPointVolume[];
  events: AppEvent[];
  ui: DashboardUiConfig;
};

function num(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function record(v: unknown): Record<string, unknown> | undefined {
  return v !== null && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : undefined;
}

/** Extrai número de um campo que pode ser número ou { valor, delta_pct, ... } */
function metricNumber(obj: Record<string, unknown>, key: string): number | undefined {
  const raw = obj[key];
  const direct = num(raw);
  if (direct !== undefined) return direct;
  const nested = record(raw);
  if (!nested) return undefined;
  return num(nested.valor) ?? num(nested.value) ?? num(nested.total);
}

function metricDelta(obj: Record<string, unknown>, key: string): { pct: number | undefined } {
  const raw = obj[key];
  const nested = record(raw);
  if (!nested) return { pct: undefined };
  const pct = num(nested.delta_pct) ?? num(nested.delta) ?? num(nested.variacao_pct);
  return { pct };
}

function formatDayLabel(isoOrDay: string): string {
  const s = isoOrDay.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(5, 10);
  return s.slice(0, 10);
}

function seriesReceita(raw: unknown): ChartPointReceita[] {
  if (!Array.isArray(raw)) return [];
  const out: ChartPointReceita[] = [];
  for (const row of raw) {
    const o = record(row);
    if (!o) continue;
    const day =
      (typeof o.data === "string" && o.data) ||
      (typeof o.date === "string" && o.date) ||
      (typeof o.dia === "string" && o.dia) ||
      (typeof o.t === "string" && o.t);
    if (!day) continue;
    const receita =
      num(o.receita) ?? num(o.valor) ?? num(o.total) ?? num(o.amount) ?? num(o.value) ?? 0;
    out.push({ t: formatDayLabel(day), receita });
  }
  return out;
}

function seriesVolume(raw: unknown): ChartPointVolume[] {
  if (!Array.isArray(raw)) return [];
  const out: ChartPointVolume[] = [];
  for (const row of raw) {
    const o = record(row);
    if (!o) continue;
    const day =
      (typeof o.data === "string" && o.data) ||
      (typeof o.date === "string" && o.date) ||
      (typeof o.dia === "string" && o.dia) ||
      (typeof o.t === "string" && o.t);
    if (!day) continue;
    const volume =
      num(o.volume) ??
      num(o.vendas) ??
      num(o.quantidade) ??
      num(o.count) ??
      num(o.valor) ??
      0;
    out.push({ t: formatDayLabel(day), volume });
  }
  return out;
}

function parseKpis(raw: unknown): Kpi[] | undefined {
  const obj = record(raw);
  if (!obj) return undefined;

  const pairs: { key: string; label: string }[] = [
    { key: "receita_total", label: "Receita Total" },
    { key: "assinaturas_ativas_wagoo", label: "Assinaturas Ativas (Wagoo)" },
    { key: "volume_vendas_2avendas", label: "Volume de Vendas (2AVENDAS)" },
    { key: "uptime_medio", label: "Uptime Médio" },
  ];

  const cards: Kpi[] = [];
  for (const { key, label } of pairs) {
    const value = metricNumber(obj, key);
    if (value === undefined) continue;
    const { pct } = metricDelta(obj, key);
    const isUptime = key === "uptime_medio";
    const valueStr = isUptime ? formatPercent(value) : formatBrl(value);
    const deltaStr =
      pct !== undefined ? `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%` : isUptime ? "—" : "—";
    const trend: Kpi["trend"] = pct === undefined ? "up" : pct >= 0 ? "up" : "down";
    cards.push({ label, value: valueStr, delta: deltaStr, trend });
  }

  return cards.length ? cards : undefined;
}

function parseEvents(raw: unknown): AppEvent[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: AppEvent[] = [];
  let i = 0;
  for (const row of raw) {
    const o = record(row);
    if (!o) continue;
    const id = typeof o.id === "string" ? o.id : String(++i);
    const message =
      (typeof o.message === "string" && o.message) ||
      (typeof o.mensagem === "string" && o.mensagem) ||
      (typeof o.descricao === "string" && o.descricao) ||
      "";
    const ts =
      (typeof o.timestamp === "string" && o.timestamp) ||
      (typeof o.criado_em === "string" && o.criado_em) ||
      (typeof o.tempo === "string" && o.tempo) ||
      "";
    const statusRaw = typeof o.status === "string" ? o.status.toLowerCase() : "online";
    const status =
      statusRaw === "offline" || statusRaw === "degraded" || statusRaw === "online"
        ? statusRaw
        : "online";
    const appRaw =
      (typeof o.app === "string" && o.app) ||
      (typeof o.origem === "string" && o.origem) ||
      (typeof o.fonte === "string" && o.fonte) ||
      "core";
    const appNorm = appRaw.toLowerCase();
    const app: AppEvent["app"] =
      appNorm.includes("wagoo") ? "wagoo" : appNorm.includes("2avendas") || appNorm.includes("avendas") ? "2avendas" : "core";
    out.push({ id, app, status, message, timestamp: ts });
  }
  return out.length ? out : undefined;
}

function parseUi(raw: unknown): DashboardUiConfig {
  const o = record(raw);
  if (!o) return {};
  const sidebarRaw = o.sidebar_itens ?? o.sidebar_items;
  let sidebar_itens: UiSidebarItem[] | undefined;
  if (Array.isArray(sidebarRaw)) {
    sidebar_itens = [];
    for (const item of sidebarRaw) {
      const r = record(item);
      if (!r) continue;
      const label = typeof r.label === "string" ? r.label : typeof r.title === "string" ? r.title : "";
      const href =
        (typeof r.href === "string" && r.href) ||
        (typeof r.path === "string" && r.path) ||
        (typeof r.url === "string" && r.url) ||
        "";
      const icon = typeof r.icon === "string" ? r.icon : undefined;
      if (label && href) sidebar_itens.push({ label, href, icon });
    }
    if (!sidebar_itens.length) sidebar_itens = undefined;
  }
  const topbar = record(o.topbar);
  return { sidebar_itens, topbar: topbar ?? undefined };
}

export function formatBrl(n: number): string {
  try {
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 });
  } catch {
    return `R$ ${n.toFixed(2)}`;
  }
}

export function formatPercent(n: number): string {
  return `${n.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;
}

export function buildFallbackDashboardViewModel(
  filtros: DashboardMeta["filtros"],
  message?: string,
): DashboardViewModel {
  const kpis = mockMetrics.kpis;
  const wagooReceitaPorDia: ChartPointReceita[] = mockMetrics.series.map((s) => ({
    t: s.t,
    receita: s.receita,
  }));
  const avendasVolumePorDia: ChartPointVolume[] = mockMetrics.series.map((s) => ({
    t: s.t,
    volume: s.vendas,
  }));

  return {
    meta: {
      source: "fallback",
      message,
      filtros,
    },
    kpis,
    wagooReceitaPorDia,
    avendasVolumePorDia,
    events: mockMetrics.events,
    ui: {},
  };
}

export function mapDashboardApiPayload(
  raw: unknown,
  filtros: DashboardMeta["filtros"],
): DashboardViewModel | null {
  const root = record(raw);
  if (!root) return null;

  const fallback = buildFallbackDashboardViewModel(filtros);

  const kpis = parseKpis(root.kpis) ?? parseKpis(root.KPIs);

  const wagoo = record(root.wagoo) ?? record(root.Wagoo);
  const dois = record(root.dois_avendas) ?? record(root.doisAvendas) ?? record(root["2avendas"]);

  const wagooReceitaPorDia = seriesReceita(wagoo?.receita_por_dia ?? wagoo?.serie_receita);
  const avendasVolumePorDia = seriesVolume(dois?.volume_por_dia ?? dois?.serie_volume);

  const events =
    parseEvents(root.eventos_recentes) ??
    parseEvents(root.eventos) ??
    parseEvents(root.recent_events);

  const ui = parseUi(root.ui);

  const gerado_em =
    (typeof root.gerado_em === "string" && root.gerado_em) ||
    (typeof root.generated_at === "string" && root.generated_at);

  const ok = typeof root.ok === "boolean" ? root.ok : true;

  const hasAnything =
    !!kpis ||
    wagooReceitaPorDia.length > 0 ||
    avendasVolumePorDia.length > 0 ||
    !!events ||
    Object.keys(ui).length > 0 ||
    !!wagoo ||
    !!dois;

  if (!hasAnything) return null;

  return {
    meta: {
      source: "api",
      ok,
      gerado_em,
      filtros,
    },
    kpis: kpis ?? fallback.kpis,
    wagooReceitaPorDia: wagooReceitaPorDia.length ? wagooReceitaPorDia : fallback.wagooReceitaPorDia,
    avendasVolumePorDia: avendasVolumePorDia.length ? avendasVolumePorDia : fallback.avendasVolumePorDia,
    events: events ?? fallback.events,
    ui,
  };
}

function mergeEventsLists(a: AppEvent[] | undefined, b: AppEvent[] | undefined, fb: AppEvent[]): AppEvent[] {
  const map = new Map<string, AppEvent>();
  for (const e of [...(a ?? []), ...(b ?? [])]) {
    map.set(e.id, e);
  }
  const merged = [...map.values()];
  return merged.length ? merged.slice(0, 60) : fb;
}

function mergeUiConfigs(w: DashboardUiConfig | undefined, a: DashboardUiConfig | undefined): DashboardUiConfig {
  const seen = new Set<string>();
  const sidebar_itens: UiSidebarItem[] = [];
  for (const list of [w?.sidebar_itens, a?.sidebar_itens]) {
    if (!list) continue;
    for (const it of list) {
      const href = it.href.startsWith("/") ? it.href : `/${it.href}`;
      if (seen.has(href)) continue;
      seen.add(href);
      sidebar_itens.push({ ...it, href });
    }
  }
  const topbar = {
    ...(typeof w?.topbar === "object" && w.topbar ? w.topbar : {}),
    ...(typeof a?.topbar === "object" && a.topbar ? a.topbar : {}),
  } as Record<string, unknown>;
  return {
    sidebar_itens: sidebar_itens.length ? sidebar_itens : undefined,
    topbar: Object.keys(topbar).length ? topbar : undefined,
  };
}

/** Une respostas das APIs Wagoo e 2AVENDAS (cada uma pode ser `null` se falhou ou veio vazia). */
export function mergeDualDashboardViewModels(
  wagoo: DashboardViewModel | null,
  avendas: DashboardViewModel | null,
  filtros: DashboardMeta["filtros"],
  warnings: string[],
): DashboardViewModel {
  const fb = buildFallbackDashboardViewModel(
    filtros,
    warnings.filter(Boolean).join(" · ") || undefined,
  );

  const receita =
    wagoo?.kpis.find((k) => k.label.toLowerCase().includes("receita")) ??
    avendas?.kpis.find((k) => k.label.toLowerCase().includes("receita"));
  const assinaturas = wagoo?.kpis.find(
    (k) => k.label.toLowerCase().includes("wagoo") || k.label.toLowerCase().includes("assinatura"),
  );
  const volume = avendas?.kpis.find(
    (k) => k.label.toLowerCase().includes("2avendas") || k.label.toLowerCase().includes("volume"),
  );
  const uptime =
    wagoo?.kpis.find((k) => k.label.toLowerCase().includes("uptime")) ??
    avendas?.kpis.find((k) => k.label.toLowerCase().includes("uptime"));

  const mergedKpis: Kpi[] = [];
  if (receita) mergedKpis.push(receita);
  if (assinaturas) mergedKpis.push(assinaturas);
  if (volume) mergedKpis.push(volume);
  if (uptime) mergedKpis.push(uptime);

  const kpisFinal = mergedKpis.length ? mergedKpis : fb.kpis;

  const wagooReceitaPorDia =
    wagoo && wagoo.wagooReceitaPorDia.length > 0 ? wagoo.wagooReceitaPorDia : fb.wagooReceitaPorDia;

  const avendasVolumePorDia =
    avendas && avendas.avendasVolumePorDia.length > 0
      ? avendas.avendasVolumePorDia
      : fb.avendasVolumePorDia;

  const events = mergeEventsLists(wagoo?.events, avendas?.events, fb.events);
  const ui = mergeUiConfigs(wagoo?.ui, avendas?.ui);

  const source: DashboardSource =
    wagoo?.meta.source === "api" || avendas?.meta.source === "api" ? "api" : "fallback";

  const msgParts = [
    ...warnings,
    wagoo?.meta.message,
    avendas?.meta.message,
  ].filter((x): x is string => typeof x === "string" && x.length > 0);

  return {
    meta: {
      source,
      ok: true,
      gerado_em: avendas?.meta.gerado_em ?? wagoo?.meta.gerado_em,
      filtros,
      message: msgParts.length ? msgParts.join(" · ") : undefined,
    },
    kpis: kpisFinal,
    wagooReceitaPorDia,
    avendasVolumePorDia,
    events,
    ui,
  };
}
