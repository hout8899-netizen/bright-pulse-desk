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
import { useI18n, useStatusLabel, usePriorityLabel } from "@/lib/i18n";

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
  const { t } = useI18n();
  const statusLabel = useStatusLabel();
  const priorityLabel = usePriorityLabel();
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
          <DialogTitle>{task ? t("tform.edit") : t("tform.add")}</DialogTitle>
          <DialogDescription>{task ? t("tform.editDesc") : t("tform.addDesc")}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
          <Field label={t("tform.employee")}>
            <Select value={form.employee} onValueChange={(v) => set("employee", v)}>
              <SelectTrigger><SelectValue placeholder={t("tform.selectEmployee")} /></SelectTrigger>
              <SelectContent>
                {employees.map((e) => (<SelectItem key={e.id} value={e.name}>{e.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </Field>
          <Field label={t("common.department")}>
            <Select value={form.department} onValueChange={(v) => set("department", v)}>
              <SelectTrigger><SelectValue placeholder={t("tform.selectDepartment")} /></SelectTrigger>
              <SelectContent>
                {departments.map((d) => (<SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </Field>
          <Field label={t("tform.projectName")}>
            <Select value={form.project} onValueChange={(v) => set("project", v)}>
              <SelectTrigger><SelectValue placeholder={t("tform.selectProject")} /></SelectTrigger>
              <SelectContent>
                {projects.map((p) => (<SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </Field>
          <Field label={t("common.manager")}>
            <Input value={form.manager} onChange={(e) => set("manager", e.target.value)} placeholder={t("tform.managerPh")} />
          </Field>
          <Field label={t("tform.descLabel")} className="sm:col-span-2">
            <Input value={form.description} onChange={(e) => set("description", e.target.value)} placeholder={t("tform.descPh")} />
          </Field>
          <Field label={t("common.priority")}>
            <Select value={form.priority} onValueChange={(v) => set("priority", v as Priority)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => (<SelectItem key={p} value={p}>{priorityLabel(p)}</SelectItem>))}
              </SelectContent>
            </Select>
          </Field>
          <Field label={t("common.status")}>
            <Select value={form.status} onValueChange={(v) => set("status", v as Status)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (<SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>))}
              </SelectContent>
            </Select>
          </Field>
          <Field label={t("common.startDate")}>
            <Input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
          </Field>
          <Field label={t("common.dueDate")}>
            <Input type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
          </Field>
          <Field label={t("tform.completionPct")}>
            <Input type="number" min={0} max={100} value={form.completion}
              onChange={(e) => set("completion", Math.max(0, Math.min(100, Number(e.target.value) || 0)))} />
          </Field>
          <Field label={t("tform.hoursWorked")}>
            <Input type="number" min={0} step={0.5} value={form.hours}
              onChange={(e) => set("hours", Math.max(0, Number(e.target.value) || 0))} />
          </Field>
          <Field label={t("common.notes")} className="sm:col-span-2">
            <Textarea value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} rows={3} placeholder={t("tform.notesPh")} />
          </Field>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
          <Button onClick={submit}>{task ? t("common.saveChanges") : t("tform.createTask")}</Button>
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
