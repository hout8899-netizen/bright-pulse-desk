import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useData } from "@/lib/data-store";
import type { Employee } from "@/lib/mock-data";
import { isOverdue } from "@/lib/mock-data";
import { StatusBadge, PriorityBadge, OverdueBadge } from "./Badges";
import { ProgressBar } from "./TaskTable";
import { User, Mail, Phone, Building2, Briefcase, ListChecks, CheckCircle2, AlertTriangle, Clock, Pencil, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

interface Props {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onEdit?: (e: Employee) => void;
  onDelete?: (e: Employee) => void;
}

export function EmployeeDetailSheet({ employee, open, onOpenChange, onEdit, onDelete }: Props) {
  const { tasks } = useData();
  const { t } = useI18n();

  const summary = useMemo(() => {
    if (!employee) return null;
    const myTasks = tasks.filter((tt) => tt.employee === employee.name);
    const completed = myTasks.filter((tt) => tt.status === "Completed").length;
    const overdue = myTasks.filter(isOverdue).length;
    const totalHours = myTasks.reduce((s, tt) => s + tt.hours, 0);
    const avg = myTasks.length
      ? Math.round(myTasks.reduce((s, tt) => s + tt.completion, 0) / myTasks.length)
      : 0;
    const projects = Array.from(new Set(myTasks.map((tt) => tt.project)));
    return { myTasks, completed, overdue, totalHours, avg, projects };
  }, [employee, tasks]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-xl">
        {employee && summary && (
          <>
            <SheetHeader className="border-b bg-muted/30 p-6">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-mono text-muted-foreground">{employee.id}</p>
                  <SheetTitle className="text-lg leading-tight">{employee.name}</SheetTitle>
                  <SheetDescription className="flex items-center gap-1.5 text-sm">
                    <Briefcase className="h-3.5 w-3.5" /> {employee.position} · {employee.department}
                  </SheetDescription>
                </div>
                {(onEdit || onDelete) && (
                  <div className="flex shrink-0 items-center gap-1">
                    {onEdit && (
                      <Button variant="outline" size="sm" onClick={() => onEdit(employee)}>
                        <Pencil className="mr-1.5 h-3.5 w-3.5" /> {t("common.edit")}
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => onDelete(employee)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </SheetHeader>

            <div className="space-y-6 p-6">
              <section className="grid gap-2 text-sm">
                <InfoRow icon={Mail} value={employee.email} />
                <InfoRow icon={Phone} value={employee.phone} />
                <InfoRow icon={Building2} value={employee.department} />
              </section>

              <Separator />

              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("emp.workload")}
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Stat icon={ListChecks} label={t("common.tasks")} value={summary.myTasks.length} />
                  <Stat icon={CheckCircle2} label={t("common.completed")} value={summary.completed} />
                  <Stat icon={AlertTriangle} label={t("status.Overdue")} value={summary.overdue} danger={summary.overdue > 0} />
                  <Stat icon={Clock} label={t("common.hours")} value={summary.totalHours} />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t("emp.avgCompletion")}</span>
                    <span className="font-medium text-foreground">{summary.avg}%</span>
                  </div>
                  <ProgressBar value={summary.avg} />
                </div>
              </section>

              <Separator />

              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("common.tasks")} ({summary.myTasks.length})
                </h3>
                {summary.myTasks.length === 0 ? (
                  <p className="rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
                    {t("emp.noTasks")}
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {summary.myTasks.slice(0, 8).map((tt) => (
                      <li key={tt.id} className="rounded-lg border bg-card p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{tt.description}</p>
                            <p className="truncate text-xs text-muted-foreground">{tt.project}</p>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            <div className="flex items-center gap-1">
                              <PriorityBadge priority={tt.priority} />
                              {isOverdue(tt) && <OverdueBadge />}
                            </div>
                            <StatusBadge status={tt.status} />
                          </div>
                        </div>
                        <div className="mt-2"><ProgressBar value={tt.completion} /></div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function InfoRow({ icon: Icon, value }: { icon: LucideIcon; value: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate text-foreground">{value || "—"}</span>
    </div>
  );
}

function Stat({ icon: Icon, label, value, danger }: { icon: LucideIcon; label: string; value: number; danger?: boolean }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <p className={cn("text-lg font-semibold tabular-nums", danger && "text-destructive")}>{value}</p>
    </div>
  );
}
