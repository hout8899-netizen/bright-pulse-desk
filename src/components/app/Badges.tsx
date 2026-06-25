import { cn } from "@/lib/utils";
import type { Priority, Status } from "@/lib/mock-data";
import { useStatusLabel, usePriorityLabel, useI18n } from "@/lib/i18n";

export function StatusBadge({ status }: { status: Status }) {
  const statusLabel = useStatusLabel();
  const map: Record<Status, string> = {
    Completed: "bg-success/15 text-success border-success/30",
    "In Progress": "bg-warning/20 text-warning-foreground border-warning/40",
    Pending: "bg-purple/15 text-purple border-purple/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        map[status],
      )}
    >
      {statusLabel(status)}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const priorityLabel = usePriorityLabel();
  const map: Record<Priority, string> = {
    High: "bg-destructive/15 text-destructive border-destructive/30",
    Medium: "bg-warning/20 text-warning-foreground border-warning/40",
    Low: "bg-success/15 text-success border-success/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        map[priority],
      )}
    >
      {priorityLabel(priority)}
    </span>
  );
}

export function OverdueBadge() {
  const { t } = useI18n();
  return (
    <span className="inline-flex items-center rounded-full border border-destructive/40 bg-destructive/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-destructive">
      {t("status.Overdue")}
    </span>
  );
}
