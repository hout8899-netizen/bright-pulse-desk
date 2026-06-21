import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useData } from "@/lib/data-store";
import type { Task, Priority, Status } from "@/lib/mock-data";

const PRIORITIES: Priority[] = ["High", "Medium", "Low"];
const STATUSES: Status[] = ["Completed", "In Progress", "Pending"];

interface TaskFormProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  task?: Task | null;
}

const empty = (): Omit<Task, "id"> => ({
  employee: "",
  department: "",
  project: "",
  description: "",
  priority: "Medium",
  status: "Pending",
  startDate: new Date().toISOString().slice(0, 10),
  dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
  completion: 0,
  hours: 0,
  manager: "",
  notes: "",
});

export function TaskForm({ open, onOpenChange, task }: TaskFormProps) {
  const { addTask, updateTask, employees, departments, projects } = useData();
  const [form, setForm] = useState<Omit<Task, "id">>(empty());

  useEffect(() => {
    if (open) {
      if (task) {
        const { id: _id, ...rest } = task;
        setForm(rest);
      } else {
        setForm(empty());
      }
    }
  }, [open, task]);

  const set = <K extends keyof Omit<Task, "id">>(k: K, v: Omit<Task, "id">[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.employee || !form.project || !form.description) return;
    if (task) updateTask(task.id, form);
    else addTask(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Add New Task"}</DialogTitle>
          <DialogDescription>
            {task ? "Update the task details below." : "Fill in the details to create a new task."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
          <Field label="Employee Name">
            <Select value={form.employee} onValueChange={(v) => set("employee", v)}>
              <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
              <SelectContent>
                {employees.map((e) => (<SelectItem key={e.id} value={e.name}>{e.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Department">
            <Select value={form.department} onValueChange={(v) => set("department", v)}>
              <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>
                {departments.map((d) => (<SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Project Name">
            <Select value={form.project} onValueChange={(v) => set("project", v)}>
              <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
              <SelectContent>
                {projects.map((p) => (<SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Manager">
            <Input value={form.manager} onChange={(e) => set("manager", e.target.value)} placeholder="Manager name" />
          </Field>
          <Field label="Task Description" className="sm:col-span-2">
            <Input value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What needs to be done?" />
          </Field>
          <Field label="Priority">
            <Select value={form.priority} onValueChange={(v) => set("priority", v as Priority)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Status">
            <Select value={form.status} onValueChange={(v) => set("status", v as Status)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Start Date">
            <Input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
          </Field>
          <Field label="Due Date">
            <Input type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
          </Field>
          <Field label="Completion %">
            <Input type="number" min={0} max={100} value={form.completion}
              onChange={(e) => set("completion", Math.max(0, Math.min(100, Number(e.target.value) || 0)))} />
          </Field>
          <Field label="Hours Worked">
            <Input type="number" min={0} step={0.5} value={form.hours}
              onChange={(e) => set("hours", Math.max(0, Number(e.target.value) || 0))} />
          </Field>
          <Field label="Notes" className="sm:col-span-2">
            <Textarea value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} rows={3} placeholder="Additional notes…" />
          </Field>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>{task ? "Save Changes" : "Create Task"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
