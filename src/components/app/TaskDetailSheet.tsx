import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { isOverdue, type Task, type TaskHistoryEntry } from "@/lib/mock-data";
import { PriorityBadge, StatusBadge, OverdueBadge } from "./Badges";
import { ProgressBar } from "./TaskTable";
import { cn } from "@/lib/utils";
import {
  Calendar,
  CalendarCheck2,
  CalendarClock,
  CheckCircle2,
  Clock,
  FileText,
  Hourglass,
  Pencil,
  PlayCircle,
  PlusCircle,
  StickyNote,
  Timer,
  TrendingUp,
  User,
  Users,
  FolderKanban,
  Building2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface TaskDetailSheetProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onEdit?: (task: Task) => void;
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function daysBetween(a: string, b: string) {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.round(ms / 86400000);
}

interface EventEntry {
  icon: LucideIcon;
  title: string;
  date?: string;
  note?: string;
  tone: "neutral" | "info" | "success" | "warning" | "danger";
}

function entryToEvent(e: TaskHistoryEntry): EventEntry {
  const date = fmtDateTime(e.at);
  switch (e.field) {
    case "created":
      return { icon: PlusCircle, title: "Task created", date, note: e.message, tone: "neutral" };
    case "status": {
      const tone: EventEntry["tone"] =
        e.to === "Completed" ? "success" : e.to === "In Progress" ? "info" : "neutral";
      const icon = e.to === "Completed" ? CheckCircle2 : e.to === "In Progress" ? PlayCircle : Clock;
      return { icon, title: `Status changed to ${e.to}`, date, note: e.from ? `From ${e.from}` : undefined, tone };
    }
    case "priority": {
      const tone: EventEntry["tone"] =
        e.to === "High" ? "danger" : e.to === "Medium" ? "warning" : "success";
      return { icon: Flag, title: `Priority set to ${e.to}`, date, note: e.from ? `From ${e.from}` : undefined, tone };
    }
    case "completion":
      return {
        icon: TrendingUp,
        title: `Progress updated to ${e.to}`,
        date,
        note: e.from ? `From ${e.from}` : undefined,
        tone: "info",
      };
    case "notes":
      return { icon: StickyNote, title: e.message ?? "Notes updated", date, tone: "info" };
  }
}

function buildTimeline(task: Task): EventEntry[] {
  const today = new Date().toISOString().slice(0, 10);
  const history = (task.history ?? []).slice().sort((a, b) => a.at.localeCompare(b.at));
  const events: EventEntry[] = [];

  if (history.length === 0) {
    // Synthetic created event for pre-existing tasks with no recorded history
    events.push({
      icon: PlusCircle,
      title: "Task created",
      date: fmtDate(task.startDate),
      note: `Assigned to ${task.employee} · Managed by ${task.manager || "—"}`,
      tone: "neutral",
    });
  } else {
    events.push(...history.map(entryToEvent));
  }

  // Always append current due/overdue context as the latest item
  const overdue = isOverdue(task);
  if (task.status === "Completed" || task.completion >= 100) {
    events.push({
      icon: CheckCircle2,
      title: "Task completed",
      date: fmtDate(task.dueDate),
      note: `Total hours: ${task.hours}h`,
      tone: "success",
    });
  } else if (overdue) {
    const overdueBy = daysBetween(task.dueDate, today);
    events.push({
      icon: Hourglass,
      title: `Overdue by ${overdueBy} day${overdueBy === 1 ? "" : "s"}`,
      date: fmtDate(task.dueDate),
      note: "Due date passed without completion",
      tone: "danger",
    });
  } else {
    const daysLeft = daysBetween(today, task.dueDate);
    events.push({
      icon: CalendarCheck2,
      title: daysLeft > 0 ? `Due in ${daysLeft} day${daysLeft === 1 ? "" : "s"}` : "Due today",
      date: fmtDate(task.dueDate),
      tone: daysLeft <= 3 ? "warning" : "neutral",
    });
  }

  return events;
}

const toneStyles: Record<EventEntry["tone"], string> = {
  neutral: "bg-muted text-muted-foreground border-border",
  info: "bg-info/15 text-info border-info/30",
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/20 text-warning-foreground border-warning/40",
  danger: "bg-destructive/15 text-destructive border-destructive/30",
};

export function TaskDetailSheet({ task, open, onOpenChange, onEdit }: TaskDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-xl">
        {task && (
          <>
            <SheetHeader className="border-b bg-muted/30 p-6">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-mono text-muted-foreground">{task.id}</p>
                  <SheetTitle className="text-lg leading-tight">{task.description}</SheetTitle>
                  <SheetDescription className="sr-only">Task details and history</SheetDescription>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                    {isOverdue(task) && <OverdueBadge />}
                  </div>
                </div>
              </div>
              {onEdit && (
                <div className="mt-3 flex justify-end">
                  <Button size="sm" variant="outline" onClick={() => onEdit(task)}>
                    <Pencil className="h-4 w-4" /> Edit
                  </Button>
                </div>
              )}
            </SheetHeader>

            <div className="space-y-6 p-6">
              {/* Progress */}
              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Progress
                </h3>
                <ProgressBar value={task.completion} />
                <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                  <Stat icon={Timer} label="Hours" value={`${task.hours}h`} />
                  <Stat icon={Clock} label="Started" value={fmtDate(task.startDate)} />
                  <Stat
                    icon={Calendar}
                    label="Due"
                    value={fmtDate(task.dueDate)}
                    danger={isOverdue(task)}
                  />
                </div>
              </section>

              <Separator />

              {/* Meta */}
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Assignment
                </h3>
                <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Meta icon={User} label="Employee" value={task.employee} />
                  <Meta icon={Users} label="Manager" value={task.manager || "—"} />
                  <Meta icon={FolderKanban} label="Project" value={task.project} />
                  <Meta icon={Building2} label="Department" value={task.department} />
                </dl>
              </section>

              <Separator />

              {/* Notes */}
              <section>
                <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <StickyNote className="h-3.5 w-3.5" /> Notes
                </h3>
                {task.notes ? (
                  <p className="whitespace-pre-wrap rounded-lg border bg-muted/30 p-4 text-sm leading-relaxed">
                    {task.notes}
                  </p>
                ) : (
                  <p className="rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
                    No notes have been added for this task yet.
                  </p>
                )}
              </section>

              <Separator />

              {/* Timeline */}
              <section>
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Activity Timeline
                </h3>
                <ol className="relative space-y-4 border-l border-border pl-6">
                  {buildTimeline(task).map((e, i) => (
                    <li key={i} className="relative">
                      <span
                        className={cn(
                          "absolute -left-[33px] grid h-6 w-6 place-items-center rounded-full border bg-card",
                          toneStyles[e.tone],
                        )}
                      >
                        <e.icon className="h-3.5 w-3.5" />
                      </span>
                      <div className="rounded-lg border bg-card p-3 shadow-card">
                        <div className="flex items-baseline justify-between gap-3">
                          <p className="text-sm font-medium leading-tight">{e.title}</p>
                          {e.date && (
                            <span className="shrink-0 text-xs text-muted-foreground">{fmtDate(e.date)}</span>
                          )}
                        </div>
                        {e.note && <p className="mt-1 text-xs text-muted-foreground">{e.note}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Stat({
  icon: Icon, label, value, danger,
}: { icon: LucideIcon; label: string; value: string; danger?: boolean }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="mb-1 flex items-center justify-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <p className={cn("text-sm font-semibold", danger && "text-destructive")}>{value}</p>
    </div>
  );
}

function Meta({
  icon: Icon, label, value,
}: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
        <dd className="truncate text-sm font-medium">{value}</dd>
      </div>
    </div>
  );
}
