import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { TaskTable } from "@/components/app/TaskTable";
import { useI18n } from "@/lib/i18n";

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
  const { t } = useI18n();
  return (
    <AppShell>
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">{t("tasks.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("tasks.subtitle")}</p>
      </div>
      <TaskTable />
    </AppShell>
  );
}
