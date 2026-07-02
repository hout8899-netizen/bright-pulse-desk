import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { useData } from "@/lib/data-store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProgressBar } from "@/components/app/TaskTable";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { EmployeeForm } from "@/components/app/EmployeeForm";
import { EmployeeDetailSheet } from "@/components/app/EmployeeDetailSheet";
import type { Employee } from "@/lib/mock-data";
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
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/employees")({
  head: () => ({
    meta: [
      { title: "Employees — Task & Project Tracker" },
      { name: "description", content: "Team directory with assignments and completion rates." },
    ],
  }),
  component: EmployeesPage,
});

function EmployeesPage() {
  const { employees, tasks, deleteEmployee } = useData();
  const { t } = useI18n();
  const [selected, setSelected] = useState<Employee | null>(null);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Employee | null>(null);

  const rows = useMemo(() => {
    return employees.map((e) => {
      const myTasks = tasks.filter((tt) => tt.employee === e.name);
      const assignedProjects = new Set(myTasks.map((tt) => tt.project)).size;
      const avgCompletion = myTasks.length
        ? Math.round(myTasks.reduce((s, tt) => s + tt.completion, 0) / myTasks.length)
        : 0;
      return { ...e, totalTasks: myTasks.length, assignedProjects, avgCompletion };
    });
  }, [employees, tasks]);

  const openNew = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (e: Employee) => { setEditing(e); setFormOpen(true); };
  const handleDelete = (e: Employee) => {
    deleteEmployee(e.id);
    toast.success(`${t("emp.deletedToast")}: "${e.name}"`);
    setConfirmDelete(null);
    if (selected?.id === e.id) setSelected(null);
  };

  return (
    <AppShell>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("emp.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("emp.subtitle")}</p>
        </div>
        <Button onClick={openNew} className="shrink-0">
          <Plus className="mr-1.5 h-4 w-4" /> {t("emp.new")}
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>{t("common.name")}</TableHead>
              <TableHead>{t("common.department")}</TableHead>
              <TableHead>{t("common.position")}</TableHead>
              <TableHead>{t("common.email")}</TableHead>
              <TableHead>{t("common.phone")}</TableHead>
              <TableHead className="text-right">{t("common.projects")}</TableHead>
              <TableHead className="text-right">{t("common.tasks")}</TableHead>
              <TableHead className="min-w-[160px]">{t("emp.completionPct")}</TableHead>
              <TableHead className="w-[130px] text-right">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((e) => (
              <TableRow
                key={e.id}
                className="cursor-pointer transition-colors hover:bg-muted/40"
                onClick={() => setSelected(e)}
              >
                <TableCell className="font-medium">{e.name}</TableCell>
                <TableCell>{e.department}</TableCell>
                <TableCell>{e.position}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{e.email}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{e.phone}</TableCell>
                <TableCell className="text-right tabular-nums">{e.assignedProjects}</TableCell>
                <TableCell className="text-right tabular-nums">{e.totalTasks}</TableCell>
                <TableCell><ProgressBar value={e.avgCompletion} /></TableCell>
                <TableCell className="text-right" onClick={(ev) => ev.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1 text-muted-foreground">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:text-primary"
                      title={t("common.view")}
                      onClick={() => setSelected(e)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:text-primary"
                      title={t("common.edit")}
                      onClick={() => openEdit(e)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                      title={t("common.delete")}
                      onClick={() => setConfirmDelete(e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EmployeeDetailSheet
        employee={selected}
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        onEdit={(e) => { setSelected(null); openEdit(e); }}
        onDelete={(e) => setConfirmDelete(e)}
      />

      <EmployeeForm open={formOpen} onOpenChange={setFormOpen} employee={editing} />

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("emp.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("emp.deleteDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDelete && handleDelete(confirmDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
