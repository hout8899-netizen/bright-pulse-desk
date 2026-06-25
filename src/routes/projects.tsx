import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useData } from "@/lib/data-store";
import type { Project, Status } from "@/lib/mock-data";
import { StatusBadge } from "@/components/app/Badges";
import { ProgressBar } from "@/components/app/TaskTable";
import { useI18n, useStatusLabel } from "@/lib/i18n";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — Task & Project Tracker" },
      { name: "description", content: "Manage every active and completed project." },
    ],
  }),
  component: ProjectsPage,
});

const STATUSES: Status[] = ["Completed", "In Progress", "Pending"];

const emptyProject = (): Omit<Project, "id"> => ({
  name: "",
  department: "",
  manager: "",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
  status: "Pending",
  budget: 0,
});

function ProjectsPage() {
  const { projects, tasks, departments, addProject, updateProject, deleteProject } = useData();
  const { t } = useI18n();
  const statusLabel = useStatusLabel();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<Omit<Project, "id">>(emptyProject());
  const [viewing, setViewing] = useState<Project | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const rows = useMemo(() => {
    return projects.map((p) => {
      const projectTasks = tasks.filter((tt) => tt.project === p.name);
      const completed = projectTasks.filter((tt) => tt.status === "Completed").length;
      const progress = projectTasks.length
        ? Math.round(projectTasks.reduce((s, tt) => s + tt.completion, 0) / projectTasks.length)
        : 0;
      return { ...p, totalTasks: projectTasks.length, completed, progress };
    });
  }, [projects, tasks]);

  const openNew = () => { setEditing(null); setForm(emptyProject()); setOpen(true); };
  const openEdit = (p: Project) => {
    setEditing(p);
    const { id: _id, ...rest } = p;
    setForm(rest);
    setOpen(true);
  };
  const submit = () => {
    if (!form.name || !form.department) return;
    if (editing) updateProject(editing.id, form);
    else addProject(form);
    setOpen(false);
  };

  return (
    <AppShell>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("proj.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("proj.subtitle")}</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4" /> {t("proj.new")}</Button>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>{t("common.id")}</TableHead>
              <TableHead>{t("common.project")}</TableHead>
              <TableHead>{t("common.department")}</TableHead>
              <TableHead>{t("common.manager")}</TableHead>
              <TableHead>{t("common.start")}</TableHead>
              <TableHead>{t("common.end")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead className="text-right">{t("common.budget")}</TableHead>
              <TableHead className="text-right">{t("proj.totalTasks")}</TableHead>
              <TableHead className="text-right">{t("common.completed")}</TableHead>
              <TableHead className="min-w-[160px]">{t("common.progress")}</TableHead>
              <TableHead className="text-right">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-xs">{p.id}</TableCell>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>{p.department}</TableCell>
                <TableCell>{p.manager}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{p.startDate}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{p.endDate}</TableCell>
                <TableCell><StatusBadge status={p.status} /></TableCell>
                <TableCell className="text-right tabular-nums">${p.budget.toLocaleString()}</TableCell>
                <TableCell className="text-right tabular-nums">{p.totalTasks}</TableCell>
                <TableCell className="text-right tabular-nums">{p.completed}</TableCell>
                <TableCell><ProgressBar value={p.progress} /></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => setViewing(p)} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" title={t("common.view")}>
                      <Eye className="h-4 w-4" />
                    </button>
                    <button onClick={() => openEdit(p)} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" title={t("common.edit")}>
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDeleteId(p.id)} className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" title={t("common.delete")}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? t("proj.edit") : t("proj.new")}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Wrap label={t("tform.projectName")} className="sm:col-span-2">
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </Wrap>
            <Wrap label={t("common.department")}>
              <Select value={form.department} onValueChange={(v) => setForm((f) => ({ ...f, department: v }))}>
                <SelectTrigger><SelectValue placeholder={t("tform.selectDepartment")} /></SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (<SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </Wrap>
            <Wrap label={t("common.manager")}>
              <Input value={form.manager} onChange={(e) => setForm((f) => ({ ...f, manager: e.target.value }))} />
            </Wrap>
            <Wrap label={t("common.startDate")}>
              <Input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
            </Wrap>
            <Wrap label={t("common.endDate")}>
              <Input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
            </Wrap>
            <Wrap label={t("common.status")}>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as Status }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (<SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>))}
                </SelectContent>
              </Select>
            </Wrap>
            <Wrap label={t("proj.budgetLabel")}>
              <Input type="number" min={0} value={form.budget} onChange={(e) => setForm((f) => ({ ...f, budget: Number(e.target.value) || 0 }))} />
            </Wrap>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>{t("common.cancel")}</Button>
            <Button onClick={submit}>{editing ? t("common.save") : t("common.create")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="sm:max-w-lg">
          {viewing && (
            <>
              <DialogHeader><DialogTitle>{viewing.name}</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Info label={t("common.id")} value={viewing.id} />
                <Info label={t("common.department")} value={viewing.department} />
                <Info label={t("common.manager")} value={viewing.manager} />
                <Info label={t("common.status")} value={<StatusBadge status={viewing.status} />} />
                <Info label={t("common.start")} value={viewing.startDate} />
                <Info label={t("common.end")} value={viewing.endDate} />
                <Info label={t("common.budget")} value={`$${viewing.budget.toLocaleString()}`} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("proj.deleteTitle")}</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) deleteProject(deleteId); setDeleteId(null); }}>{t("common.delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

function Wrap({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <div className="mt-0.5">{value}</div>
    </div>
  );
}
