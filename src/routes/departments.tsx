import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { useData } from "@/lib/data-store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMemo, useState } from "react";
import { DepartmentDetailSheet } from "@/components/app/DepartmentDetailSheet";
import type { Department } from "@/lib/mock-data";
import { ChevronRight } from "lucide-react";

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
  const { departments, employees, projects, tasks } = useData();
  const [selected, setSelected] = useState<Department | null>(null);

  const rows = useMemo(() => {
    return departments.map((d) => {
      const empCount = employees.filter((e) => e.department === d.name).length;
      const activeProjects = projects.filter((p) => p.department === d.name && p.status !== "Completed").length;
      const totalTasks = tasks.filter((t) => t.department === d.name).length;
      return { ...d, empCount, activeProjects, totalTasks };
    });
  }, [departments, employees, projects, tasks]);

  return (
    <AppShell>
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Departments</h1>
        <p className="text-sm text-muted-foreground">Click a department to see its team, projects, and tasks.</p>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Department</TableHead>
              <TableHead>Department Head</TableHead>
              <TableHead className="text-right">Employees</TableHead>
              <TableHead className="text-right">Active Projects</TableHead>
              <TableHead className="text-right">Total Tasks</TableHead>
              <TableHead className="w-8" />
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
                <TableCell className="text-right text-muted-foreground">
                  <ChevronRight className="h-4 w-4" />
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
      />
    </AppShell>
  );
}
