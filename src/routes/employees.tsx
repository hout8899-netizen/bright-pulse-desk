import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { useData } from "@/lib/data-store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProgressBar } from "@/components/app/TaskTable";
import { useMemo } from "react";

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
  const { employees, tasks } = useData();

  const rows = useMemo(() => {
    return employees.map((e) => {
      const myTasks = tasks.filter((t) => t.employee === e.name);
      const assignedProjects = new Set(myTasks.map((t) => t.project)).size;
      const avgCompletion = myTasks.length
        ? Math.round(myTasks.reduce((s, t) => s + t.completion, 0) / myTasks.length)
        : 0;
      return { ...e, totalTasks: myTasks.length, assignedProjects, avgCompletion };
    });
  }, [employees, tasks]);

  return (
    <AppShell>
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Employees</h1>
        <p className="text-sm text-muted-foreground">Team directory and individual workload.</p>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-right">Projects</TableHead>
              <TableHead className="text-right">Tasks</TableHead>
              <TableHead className="min-w-[160px]">Completion %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-medium">{e.name}</TableCell>
                <TableCell>{e.department}</TableCell>
                <TableCell>{e.position}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{e.email}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{e.phone}</TableCell>
                <TableCell className="text-right tabular-nums">{e.assignedProjects}</TableCell>
                <TableCell className="text-right tabular-nums">{e.totalTasks}</TableCell>
                <TableCell><ProgressBar value={e.avgCompletion} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AppShell>
  );
}
