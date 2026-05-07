import { cn } from "@/lib/utils";
import type { AppEvent } from "@/lib/metrics";

function StatusBadge({ status }: { status: AppEvent["status"] }) {
  if (status === "offline") {
    return (
      <span className="inline-flex items-center gap-1.5 border border-destructive/60 bg-destructive/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-destructive animate-neon-pulse">
        <span className="h-1.5 w-1.5 bg-destructive" />
        offline
      </span>
    );
  }
  if (status === "degraded") {
    return (
      <span className="inline-flex items-center gap-1.5 border border-chart-4/60 bg-chart-4/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-chart-4">
        <span className="h-1.5 w-1.5 bg-chart-4" />
        degraded
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 border border-primary/60 bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-primary">
      <span className="h-1.5 w-1.5 bg-primary" />
      online
    </span>
  );
}

export function EventsTable({ events }: { events: AppEvent[] }) {
  return (
    <div className="border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          Eventos Recentes / Sub-apps
        </div>
        <div className="font-mono text-[10px] uppercase tracking-widest neon-text">live</div>
      </div>
      <div className="divide-y divide-border">
        {events.map((e) => (
          <div
            key={e.id}
            className={cn(
              "grid grid-cols-12 items-center gap-3 px-5 py-3 text-sm",
              "hover:bg-muted/40"
            )}
          >
            <div className="col-span-2 font-mono text-[11px] tracking-wider text-muted-foreground">
              {e.timestamp}
            </div>
            <div className="col-span-2 font-mono text-[11px] uppercase tracking-widest text-foreground">
              {e.app}
            </div>
            <div className="col-span-2"><StatusBadge status={e.status} /></div>
            <div className="col-span-6 font-mono text-xs text-muted-foreground">
              {e.message}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}