import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { useData } from "@/lib/data-store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMemo, useState } from "react";
import { DepartmentDetailSheet } from "@/components/app/DepartmentDetailSheet";
import { DepartmentForm } from "@/components/app/DepartmentForm";
import type { Department } from "@/lib/mock-data";
import { ChevronRight, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export const Route = createFileRoute("/departments")({
  head: () => ({
    meta: [
      { title: "Departments — Task & Project Tracker" },
      { name: "description", content: "Overview of every department, headcount, and workload." },
    ],
  }),
  component: DepartmentsPage,
});

function DepartmentsPage() {
  const { departments, employees, projects, tasks, deleteDepartment } = useData();
  const { t } = useI18n();
  const [selected, setSelected] = useState<Department | null>(null);
  const [editing, setEditing] = useState<Department | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Department | null>(null);

  const rows = useMemo(() => {
    return departments.map((d) => {
      const empCount = employees.filter((e) => e.department === d.name).length;
      const activeProjects = projects.filter((p) => p.department === d.name && p.status !== "Completed").length;
      const totalTasks = tasks.filter((tt) => tt.department === d.name).length;
      return { ...d, empCount, activeProjects, totalTasks };
    });
  }, [departments, employees, projects, tasks]);

  const openNew = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (d: Department) => { setEditing(d); setFormOpen(true); };
  const handleDelete = (d: Department) => {
    deleteDepartment(d.id);
    toast.success(`${t("dept.deletedToast")}: "${d.name}"`);
    setConfirmDelete(null);
    if (selected?.id === d.id) setSelected(null);
  };

  return (
    <AppShell>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("dept.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("dept.subtitle")}</p>
        </div>
        <Button onClick={openNew} className="shrink-0">
          <Plus className="mr-1.5 h-4 w-4" /> {t("dept.new")}
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>{t("common.department")}</TableHead>
              <TableHead>{t("dept.head")}</TableHead>
              <TableHead className="text-right">{t("common.employees")}</TableHead>
              <TableHead className="text-right">{t("common.activeProjects")}</TableHead>
              <TableHead className="text-right">{t("common.totalTasks")}</TableHead>
              <TableHead className="w-20 text-right">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((d) => (
              <TableRow
                key={d.id}
                className="cursor-pointer transition-colors hover:bg-muted/40"
                onClick={() => setSelected(d)}
              >
                <TableCell className="font-medium">{d.name}</TableCell>
                <TableCell>{d.head}</TableCell>
                <TableCell className="text-right tabular-nums">{d.empCount}</TableCell>
                <TableCell className="text-right tabular-nums">{d.activeProjects}</TableCell>
                <TableCell className="text-right tabular-nums">{d.totalTasks}</TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1 text-muted-foreground">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">{t("common.actions")}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelected(d)}>
                          <ChevronRight className="mr-2 h-4 w-4" /> {t("dept.viewDetails")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(d)}>
                          <Pencil className="mr-2 h-4 w-4" /> {t("common.edit")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setConfirmDelete(d)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> {t("common.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DepartmentDetailSheet
        department={selected}
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        onEdit={(d) => { setSelected(null); openEdit(d); }}
        onDelete={(d) => setConfirmDelete(d)}
      />

      <DepartmentForm open={formOpen} onOpenChange={setFormOpen} department={editing} />

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dept.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("dept.deleteDesc")}</AlertDialogDescription>
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
