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

const ALL = "__all";

export function TaskTable({ defaultProject }: { defaultProject?: string }) {
  const { tasks, projects, departments, deleteTask } = useData();
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
    return tasks.filter((t) => {
      if (q && !`${t.id} ${t.description} ${t.employee}`.toLowerCase().includes(q)) return false;
      if (projectF !== ALL && t.project !== projectF) return false;
      if (deptF !== ALL && t.department !== deptF) return false;
      if (statusF !== ALL && t.status !== statusF) return false;
      if (priorityF !== ALL && t.priority !== priorityF) return false;
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
              placeholder="Search tasks…"
              className="pl-9"
            />
          </div>
          <FilterSelect value={projectF} onChange={setProjectF} placeholder="All Projects"
            options={projects.map((p) => p.name)} />
          <FilterSelect value={deptF} onChange={setDeptF} placeholder="All Departments"
            options={departments.map((d) => d.name)} />
          <FilterSelect value={statusF} onChange={setStatusF} placeholder="All Statuses"
            options={["Completed", "In Progress", "Pending"]} />
          <FilterSelect value={priorityF} onChange={setPriorityF} placeholder="All Priorities"
            options={["High", "Medium", "Low"]} />
          <Button onClick={() => { setEditingTask(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4" /> New Task
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="whitespace-nowrap">Task ID</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Project</TableHead>
              <TableHead className="min-w-[220px]">Description</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="whitespace-nowrap">Start</TableHead>
              <TableHead className="whitespace-nowrap">Due</TableHead>
              <TableHead className="min-w-[140px]">Completion</TableHead>
              <TableHead className="whitespace-nowrap">Hours</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} className="py-10 text-center text-sm text-muted-foreground">
                  No tasks match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((t) => {
                const overdue = isOverdue(t);
                return (
                  <TableRow key={t.id} className={cn(overdue && "bg-destructive/5")}>
                    <TableCell className="font-mono text-xs">{t.id}</TableCell>
                    <TableCell className="font-medium">{t.employee}</TableCell>
                    <TableCell>{t.department}</TableCell>
                    <TableCell>{t.project}</TableCell>
                    <TableCell className="max-w-[300px]">
                      <div className="flex items-center gap-2">
                        <span className="truncate">{t.description}</span>
                        {overdue && <OverdueBadge />}
                      </div>
                    </TableCell>
                    <TableCell><PriorityBadge priority={t.priority} /></TableCell>
                    <TableCell><StatusBadge status={t.status} /></TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{t.startDate}</TableCell>
                    <TableCell className={cn("whitespace-nowrap text-xs", overdue ? "font-semibold text-destructive" : "text-muted-foreground")}>
                      {t.dueDate}
                    </TableCell>
                    <TableCell>
                      <ProgressBar value={t.completion} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{t.hours}h</TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{t.manager}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <IconBtn label="View" onClick={() => setViewTask(t)}><Eye className="h-4 w-4" /></IconBtn>
                        <IconBtn label="Edit" onClick={() => { setEditingTask(t); setFormOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </IconBtn>
                        <IconBtn label="Delete" onClick={() => setDeleteId(t.id)} destructive>
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

      <Dialog open={!!viewTask} onOpenChange={(o) => !o && setViewTask(null)}>
        <DialogContent className="sm:max-w-lg">
          {viewTask && (
            <>
              <DialogHeader>
                <DialogTitle>{viewTask.description}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Info label="Task ID" value={viewTask.id} />
                <Info label="Employee" value={viewTask.employee} />
                <Info label="Department" value={viewTask.department} />
                <Info label="Project" value={viewTask.project} />
                <Info label="Priority" value={<PriorityBadge priority={viewTask.priority} />} />
                <Info label="Status" value={<StatusBadge status={viewTask.status} />} />
                <Info label="Start Date" value={viewTask.startDate} />
                <Info label="Due Date" value={viewTask.dueDate} />
                <Info label="Completion" value={`${viewTask.completion}%`} />
                <Info label="Hours" value={`${viewTask.hours}h`} />
                <Info label="Manager" value={viewTask.manager} />
                {viewTask.notes && (
                  <div className="col-span-2">
                    <p className="text-xs font-medium uppercase text-muted-foreground">Notes</p>
                    <p className="mt-1 text-sm">{viewTask.notes}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) deleteTask(deleteId); setDeleteId(null); }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function FilterSelect({
  value, onChange, placeholder, options,
}: { value: string; onChange: (v: string) => void; placeholder: string; options: string[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[170px]"><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{placeholder}</SelectItem>
        {options.map((o) => (<SelectItem key={o} value={o}>{o}</SelectItem>))}
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

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <div className="mt-0.5">{value}</div>
    </div>
  );
}
