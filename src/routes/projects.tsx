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
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<Omit<Project, "id">>(emptyProject());
  const [viewing, setViewing] = useState<Project | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const rows = useMemo(() => {
    return projects.map((p) => {
      const projectTasks = tasks.filter((t) => t.project === p.name);
      const completed = projectTasks.filter((t) => t.status === "Completed").length;
      const progress = projectTasks.length
        ? Math.round(projectTasks.reduce((s, t) => s + t.completion, 0) / projectTasks.length)
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
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">Manage projects, owners, and budgets.</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4" /> New Project</Button>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>ID</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Budget</TableHead>
              <TableHead className="text-right">Total Tasks</TableHead>
              <TableHead className="text-right">Completed</TableHead>
              <TableHead className="min-w-[160px]">Progress</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                    <button onClick={() => setViewing(p)} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" title="View">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button onClick={() => openEdit(p)} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" title="Edit">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDeleteId(p.id)} className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" title="Delete">
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
            <DialogTitle>{editing ? "Edit Project" : "New Project"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Wrap label="Project Name" className="sm:col-span-2">
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </Wrap>
            <Wrap label="Department">
              <Select value={form.department} onValueChange={(v) => setForm((f) => ({ ...f, department: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (<SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </Wrap>
            <Wrap label="Manager">
              <Input value={form.manager} onChange={(e) => setForm((f) => ({ ...f, manager: e.target.value }))} />
            </Wrap>
            <Wrap label="Start Date">
              <Input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
            </Wrap>
            <Wrap label="End Date">
              <Input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
            </Wrap>
            <Wrap label="Status">
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as Status }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                </SelectContent>
              </Select>
            </Wrap>
            <Wrap label="Budget ($)">
              <Input type="number" min={0} value={form.budget} onChange={(e) => setForm((f) => ({ ...f, budget: Number(e.target.value) || 0 }))} />
            </Wrap>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit}>{editing ? "Save" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="sm:max-w-lg">
          {viewing && (
            <>
              <DialogHeader><DialogTitle>{viewing.name}</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Info label="ID" value={viewing.id} />
                <Info label="Department" value={viewing.department} />
                <Info label="Manager" value={viewing.manager} />
                <Info label="Status" value={<StatusBadge status={viewing.status} />} />
                <Info label="Start" value={viewing.startDate} />
                <Info label="End" value={viewing.endDate} />
                <Info label="Budget" value={`$${viewing.budget.toLocaleString()}`} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this project?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) deleteProject(deleteId); setDeleteId(null); }}>Delete</AlertDialogAction>
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
