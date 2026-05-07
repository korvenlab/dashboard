import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
};

export function KpiCard({ label, value, delta, trend }: Props) {
  return (
    <div className="group relative overflow-hidden border border-border bg-card p-6">
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="font-mono text-3xl font-semibold tracking-tight text-foreground [text-shadow:0_0_12px_color-mix(in_oklab,var(--neon-white)_25%,transparent)]">
          {value}
        </div>
        <div
          className={cn(
            "flex items-center gap-1 font-mono text-xs",
            trend === "up" ? "text-foreground" : "text-destructive"
          )}
        >
          {trend === "up" ? (
            <ArrowUpRight className="h-3.5 w-3.5" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5" />
          )}
          {delta}
        </div>
      </div>
    </div>
  );
}