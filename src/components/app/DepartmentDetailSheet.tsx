import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useData } from "@/lib/data-store";
import type { Department } from "@/lib/mock-data";
import { isOverdue } from "@/lib/mock-data";
import { StatusBadge, PriorityBadge, OverdueBadge } from "./Badges";
import { ProgressBar } from "./TaskTable";
import { Building2, Users, FolderKanban, ListChecks, Clock, AlertTriangle, CheckCircle2, UserCog, Pencil, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

interface DepartmentDetailSheetProps {
  department: Department | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onEdit?: (d: Department) => void;
  onDelete?: (d: Department) => void;
}

export function DepartmentDetailSheet({ department, open, onOpenChange, onEdit, onDelete }: DepartmentDetailSheetProps) {
  const { employees, projects, tasks } = useData();
  const { t } = useI18n();

  const summary = useMemo(() => {
    if (!department) return null;
    const deptEmployees = employees.filter((e) => e.department === department.name);
    const deptProjects = projects.filter((p) => p.department === department.name);
    const deptTasks = tasks.filter((tt) => tt.department === department.name);
    const completed = deptTasks.filter((tt) => tt.status === "Completed").length;
    const overdue = deptTasks.filter(isOverdue).length;
    const totalHours = deptTasks.reduce((sum, tt) => sum + tt.hours, 0);
    const avgCompletion = deptTasks.length
      ? Math.round(deptTasks.reduce((s, tt) => s + tt.completion, 0) / deptTasks.length)
      : 0;
    return { deptEmployees, deptProjects, deptTasks, completed, overdue, totalHours, avgCompletion };
  }, [department, employees, projects, tasks]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-xl">
        {department && summary && (
          <>
            <SheetHeader className="border-b bg-muted/30 p-6">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-mono text-muted-foreground">{department.id}</p>
                  <SheetTitle className="text-lg leading-tight">{department.name}</SheetTitle>
                  <SheetDescription className="flex items-center gap-1.5 text-sm">
                    <UserCog className="h-3.5 w-3.5" /> {t("dept.head")}: {department.head}
                  </SheetDescription>
                </div>
                {(onEdit || onDelete) && (
                  <div className="flex shrink-0 items-center gap-1">
                    {onEdit && (
                      <Button variant="outline" size="sm" onClick={() => onEdit(department)}>
                        <Pencil className="mr-1.5 h-3.5 w-3.5" /> {t("common.edit")}
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => onDelete(department)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">{t("common.delete")}</span>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </SheetHeader>

            <div className="space-y-6 p-6">
              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("dept.overview")}
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Stat icon={Users} label={t("common.employees")} value={summary.deptEmployees.length} />
                  <Stat icon={FolderKanban} label={t("common.projects")} value={summary.deptProjects.length} />
                  <Stat icon={ListChecks} label={t("common.tasks")} value={summary.deptTasks.length} />
                  <Stat icon={AlertTriangle} label={t("status.Overdue")} value={summary.overdue} danger={summary.overdue > 0} />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t("dept.avgCompletion")}</span>
                    <span className="font-medium text-foreground">{summary.avgCompletion}%</span>
                  </div>
                  <ProgressBar value={summary.avgCompletion} />
                  <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-success" /> {summary.completed} {t("dept.completedSuffix")}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" /> {summary.totalHours}h {t("dept.loggedSuffix")}
                    </span>
                  </div>
                </div>
              </section>

              <Separator />

              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("dept.team")} ({summary.deptEmployees.length})
                </h3>
                {summary.deptEmployees.length === 0 ? (
                  <EmptyHint>{t("dept.noEmps")}</EmptyHint>
                ) : (
                  <ul className="space-y-2">
                    {summary.deptEmployees.map((e) => (
                      <li key={e.id} className="flex items-center justify-between rounded-lg border bg-card p-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{e.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{e.position}</p>
                        </div>
                        <span className="font-mono text-xs text-muted-foreground">{e.id}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <Separator />

              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("common.projects")} ({summary.deptProjects.length})
                </h3>
                {summary.deptProjects.length === 0 ? (
                  <EmptyHint>{t("dept.noProjects")}</EmptyHint>
                ) : (
                  <ul className="space-y-2">
                    {summary.deptProjects.map((p) => (
                      <li key={p.id} className="rounded-lg border bg-card p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{p.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{t("common.manager")}: {p.manager}</p>
                          </div>
                          <StatusBadge status={p.status} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <Separator />

              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("common.tasks")} ({summary.deptTasks.length})
                </h3>
                {summary.deptTasks.length === 0 ? (
                  <EmptyHint>{t("dept.noTasks")}</EmptyHint>
                ) : (
                  <ul className="space-y-2">
                    {summary.deptTasks.slice(0, 8).map((tt) => (
                      <li key={tt.id} className="rounded-lg border bg-card p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{tt.description}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {tt.employee} · {tt.project}
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            <div className="flex items-center gap-1">
                              <PriorityBadge priority={tt.priority} />
                              {isOverdue(tt) && <OverdueBadge />}
                            </div>
                            <StatusBadge status={tt.status} />
                          </div>
                        </div>
                        <div className="mt-2">
                          <ProgressBar value={tt.completion} />
                        </div>
                      </li>
                    ))}
                    {summary.deptTasks.length > 8 && (
                      <li className="text-center text-xs text-muted-foreground">
                        + {summary.deptTasks.length - 8} {t("dept.moreTasks")}
                      </li>
                    )}
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

function Stat({
  icon: Icon, label, value, danger,
}: { icon: LucideIcon; label: string; value: number; danger?: boolean }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <p className={cn("text-lg font-semibold tabular-nums", danger && "text-destructive")}>{value}</p>
    </div>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
      {children}
    </p>
  );
}
