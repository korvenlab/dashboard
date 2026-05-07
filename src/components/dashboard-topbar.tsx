import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter, useSearch } from "@tanstack/react-router";
import type { DashboardUiConfig } from "@/lib/dashboard-view";

const PERIODS = [
  { label: "Últimas 24h", days: 1 },
  { label: "Últimos 7 dias", days: 7 },
  { label: "Últimos 30 dias", days: 30 },
  { label: "Trimestre", days: 90 },
];

/** UUIDs de exemplo — substitua pelos IDs reais da sua conta ou carregue da API de organizações. */
const ORGS = [
  { value: "__all__", label: "Todas as organizações" },
  {
    value: "00000000-0000-4000-8000-000000000001",
    label: "Korven Lab (UUID demo)",
  },
  {
    value: "00000000-0000-4000-8000-000000000002",
    label: "Wagoo (UUID demo)",
  },
  {
    value: "00000000-0000-4000-8000-000000000003",
    label: "2AVENDAS (UUID demo)",
  },
];

type Props = {
  generatedAt?: string;
  topbarUi?: DashboardUiConfig["topbar"];
};

export function DashboardTopbar({ generatedAt, topbarUi }: Props) {
  const search = useSearch({ from: "__root__" });
  const router = useRouter();

  const organization_id = search.organization_id;
  const period_days = search.period_days;

  let orgChoices = [...ORGS];
  if (organization_id && !orgChoices.some((o) => o.value === organization_id)) {
    orgChoices = [
      ORGS[0],
      { value: organization_id, label: `Organização ${organization_id.slice(0, 8)}…` },
      ...ORGS.slice(1),
    ];
  }

  const orgSelectValue = organization_id ?? "__all__";

  const periodLabel =
    PERIODS.find((p) => p.days === period_days)?.label ?? `Últimos ${period_days} dias`;

  const remoteTitle =
    topbarUi && typeof topbarUi === "object" && topbarUi !== null && "title" in topbarUi
      ? String((topbarUi as { title?: unknown }).title ?? "")
      : "";
  const remoteSubtitle =
    topbarUi && typeof topbarUi === "object" && topbarUi !== null && "subtitle" in topbarUi
      ? String((topbarUi as { subtitle?: unknown }).subtitle ?? "")
      : "";

  return (
    <header className="sticky top-0 z-20 flex h-14 flex-wrap items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
      <div className="ml-1 hidden h-5 w-px bg-border md:block" />
      <Select
        value={orgSelectValue}
        onValueChange={(v) => {
          router.navigate({
            search: (prev) => ({
              ...prev,
              organization_id: v === "__all__" ? undefined : v,
            }),
            replace: true,
          });
        }}
      >
        <SelectTrigger className="h-8 min-w-[200px] rounded-none border-border bg-card font-mono text-xs uppercase tracking-wider">
          <SelectValue placeholder="Organização" />
        </SelectTrigger>
        <SelectContent className="rounded-none">
          {orgChoices.map((o) => (
            <SelectItem key={o.value} value={o.value} className="font-mono text-xs">
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="h-8 gap-2 rounded-none border-border bg-card font-mono text-xs uppercase tracking-wider"
          >
            <CalendarIcon className="h-3.5 w-3.5 text-primary" />
            {periodLabel}
            <ChevronDown className="h-3 w-3 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="rounded-none">
          {PERIODS.map((p) => (
            <DropdownMenuItem
              key={p.days}
              onClick={() =>
                router.navigate({
                  search: (prev) => ({
                    ...prev,
                    period_days: p.days,
                  }),
                  replace: true,
                })
              }
              className="font-mono text-xs uppercase tracking-wider"
            >
              {p.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {(remoteTitle || remoteSubtitle) && (
        <div className="hidden min-w-0 flex-1 flex-col md:flex">
          {remoteTitle ? (
            <span className="truncate font-mono text-[10px] uppercase tracking-[0.25em] text-foreground">
              {remoteTitle}
            </span>
          ) : null}
          {remoteSubtitle ? (
            <span className="truncate font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {remoteSubtitle}
            </span>
          ) : null}
        </div>
      )}

      <div className="ml-auto flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        {generatedAt ? (
          <span className="hidden lg:inline" title="gerado_em (API)">
            api {generatedAt}
          </span>
        ) : (
          <span className="hidden md:inline">build 2026.05.07</span>
        )}
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 animate-pulse bg-primary shadow-[0_0_8px_var(--neon-cyan)]" />
          live
        </span>
      </div>
    </header>
  );
}
