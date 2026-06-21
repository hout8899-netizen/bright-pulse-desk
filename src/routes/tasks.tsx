import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { TaskTable } from "@/components/app/TaskTable";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — Task & Project Tracker" },
      { name: "description", content: "Search, filter, and manage every task across your projects." },
    ],
  }),
  component: TasksPage,
});

function TasksPage() {
  return (
    <AppShell>
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
        <p className="text-sm text-muted-foreground">All tasks across projects and departments.</p>
      </div>
      <TaskTable />
    </AppShell>
  );
}
