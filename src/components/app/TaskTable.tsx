import { useMemo, useState } from "react";
import { Search, Plus, Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TaskDetailSheet } from "./TaskDetailSheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useData } from "@/lib/data-store";
import { isOverdue, type Task } from "@/lib/mock-data";
import { PriorityBadge, StatusBadge, OverdueBadge } from "./Badges";
import { TaskForm } from "./TaskForm";
import { cn } from "@/lib/utils";
import { useI18n, useStatusLabel, usePriorityLabel } from "@/lib/i18n";

const ALL = "__all";

export function TaskTable({ defaultProject }: { defaultProject?: string }) {
  const { tasks, projects, departments, deleteTask } = useData();
  const { t } = useI18n();
  const statusLabel = useStatusLabel();
  const priorityLabel = usePriorityLabel();
  const [search, setSearch] = useState("");
  const [projectF, setProjectF] = useState<string>(defaultProject ?? ALL);
  const [deptF, setDeptF] = useState<string>(ALL);
  const [statusF, setStatusF] = useState<string>(ALL);
  const [priorityF, setPriorityF] = useState<string>(ALL);

  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewTask, setViewTask] = useState<Task | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((tt) => {
      if (q && !`${tt.id} ${tt.description} ${tt.employee}`.toLowerCase().includes(q)) return false;
      if (projectF !== ALL && tt.project !== projectF) return false;
      if (deptF !== ALL && tt.department !== deptF) return false;
      if (statusF !== ALL && tt.status !== statusF) return false;
      if (priorityF !== ALL && tt.priority !== priorityF) return false;
      return true;
    });
  }, [tasks, search, projectF, deptF, statusF, priorityF]);

  return (
    <div className="rounded-xl border bg-card shadow-card">
      <div className="border-b p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("tasks.searchPh")}
              className="pl-9"
            />
          </div>
          <FilterSelect value={projectF} onChange={setProjectF} placeholder={t("dash.allProjects")}
            options={projects.map((p) => ({ value: p.name, label: p.name }))} />
          <FilterSelect value={deptF} onChange={setDeptF} placeholder={t("dash.allDepartments")}
            options={departments.map((d) => ({ value: d.name, label: d.name }))} />
          <FilterSelect value={statusF} onChange={setStatusF} placeholder={t("tasks.allStatuses")}
            options={["Completed", "In Progress", "Pending"].map((v) => ({ value: v, label: statusLabel(v) }))} />
          <FilterSelect value={priorityF} onChange={setPriorityF} placeholder={t("tasks.allPriorities")}
            options={["High", "Medium", "Low"].map((v) => ({ value: v, label: priorityLabel(v) }))} />
          <Button onClick={() => { setEditingTask(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4" /> {t("tasks.newTask")}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="whitespace-nowrap">{t("tasks.col.id")}</TableHead>
              <TableHead>{t("common.employee")}</TableHead>
              <TableHead>{t("common.department")}</TableHead>
              <TableHead>{t("common.project")}</TableHead>
              <TableHead className="min-w-[220px]">{t("tasks.col.desc")}</TableHead>
              <TableHead>{t("common.priority")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead className="whitespace-nowrap">{t("common.start")}</TableHead>
              <TableHead className="whitespace-nowrap">{t("td.due")}</TableHead>
              <TableHead className="min-w-[140px]">{t("common.completion")}</TableHead>
              <TableHead className="whitespace-nowrap">{t("common.hours")}</TableHead>
              <TableHead>{t("common.manager")}</TableHead>
              <TableHead className="text-right">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} className="py-10 text-center text-sm text-muted-foreground">
                  {t("tasks.noMatch")}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((tt) => {
                const overdue = isOverdue(tt);
                return (
                  <TableRow key={tt.id} className={cn(overdue && "bg-destructive/5")}>
                    <TableCell className="font-mono text-xs">{tt.id}</TableCell>
                    <TableCell className="font-medium">{tt.employee}</TableCell>
                    <TableCell>{tt.department}</TableCell>
                    <TableCell>{tt.project}</TableCell>
                    <TableCell className="max-w-[300px]">
                      <div className="flex items-center gap-2">
                        <span className="truncate">{tt.description}</span>
                        {overdue && <OverdueBadge />}
                      </div>
                    </TableCell>
                    <TableCell><PriorityBadge priority={tt.priority} /></TableCell>
                    <TableCell><StatusBadge status={tt.status} /></TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{tt.startDate}</TableCell>
                    <TableCell className={cn("whitespace-nowrap text-xs", overdue ? "font-semibold text-destructive" : "text-muted-foreground")}>
                      {tt.dueDate}
                    </TableCell>
                    <TableCell>
                      <ProgressBar value={tt.completion} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{tt.hours}h</TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{tt.manager}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <IconBtn label={t("common.view")} onClick={() => setViewTask(tt)}><Eye className="h-4 w-4" /></IconBtn>
                        <IconBtn label={t("common.edit")} onClick={() => { setEditingTask(tt); setFormOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </IconBtn>
                        <IconBtn label={t("common.delete")} onClick={() => setDeleteId(tt.id)} destructive>
                          <Trash2 className="h-4 w-4" />
                        </IconBtn>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <TaskForm open={formOpen} onOpenChange={setFormOpen} task={editingTask} />

      <TaskDetailSheet
        task={viewTask}
        open={!!viewTask}
        onOpenChange={(o) => !o && setViewTask(null)}
        onEdit={(tt) => {
          setViewTask(null);
          setEditingTask(tt);
          setFormOpen(true);
        }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("tasks.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("tasks.deleteDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) deleteTask(deleteId); setDeleteId(null); }}>
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function FilterSelect({
  value, onChange, placeholder, options,
}: { value: string; onChange: (v: string) => void; placeholder: string; options: { value: string; label: string }[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[170px]"><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{placeholder}</SelectItem>
        {options.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
      </SelectContent>
    </Select>
  );
}

export function ProgressBar({ value }: { value: number }) {
  const color =
    value >= 100 ? "bg-success" : value >= 50 ? "bg-info" : value > 0 ? "bg-warning" : "bg-muted-foreground/30";
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${value}%` }} />
      </div>
      <span className="w-10 text-right text-xs font-medium tabular-nums">{value}%</span>
    </div>
  );
}

function IconBtn({
  children, onClick, label, destructive,
}: { children: React.ReactNode; onClick: () => void; label: string; destructive?: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
        destructive && "hover:bg-destructive/10 hover:text-destructive",
      )}
    >
      {children}
    </button>
  );
}
