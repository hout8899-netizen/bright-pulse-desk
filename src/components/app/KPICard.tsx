import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface KPICardProps {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  accent: "kpi-1" | "kpi-2" | "kpi-3" | "kpi-4" | "kpi-5" | "kpi-6" | "kpi-7";
  sub?: string;
}

const accentClasses: Record<KPICardProps["accent"], string> = {
  "kpi-1": "bg-kpi-1/15 text-kpi-1",
  "kpi-2": "bg-kpi-2/15 text-kpi-2",
  "kpi-3": "bg-kpi-3/15 text-kpi-3",
  "kpi-4": "bg-kpi-4/15 text-kpi-4",
  "kpi-5": "bg-kpi-5/15 text-kpi-5",
  "kpi-6": "bg-kpi-6/15 text-kpi-6",
  "kpi-7": "bg-kpi-7/15 text-kpi-7",
};

export function KPICard({ icon: Icon, label, value, accent, sub }: KPICardProps) {
  return (
    <div className="group rounded-xl border bg-card p-4 shadow-card transition-shadow hover:shadow-elevated">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {value}
          </p>
          {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-transform group-hover:scale-105",
            accentClasses[accent],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
