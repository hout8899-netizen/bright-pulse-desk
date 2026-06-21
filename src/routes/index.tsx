import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ListChecks,
  CheckCircle2,
  Loader2,
  Clock,
  AlertTriangle,
  Percent,
  Timer,
  Calendar,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import { AppShell } from "@/components/app/AppShell";
import { KPICard } from "@/components/app/KPICard";
import { ChartCard } from "@/components/app/ChartCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useData } from "@/lib/data-store";
import { isOverdue } from "@/lib/mock-data";

const ALL = "__all";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Task & Project Tracker" },
      { name: "description", content: "KPIs, charts, and task overview for your projects and team." },
    ],
  }),
  component: Dashboard,
});

// Status colors — Completed: Green, In Progress: Yellow/Orange, Pending: Purple, Overdue: Red
const STATUS_COLORS: Record<string, string> = {
  Completed: "oklch(0.65 0.17 150)",
  "In Progress": "oklch(0.75 0.17 60)",
  Pending: "oklch(0.6 0.2 295)",
  Overdue: "oklch(0.6 0.23 27)",
};

const PRIORITY_COLORS: Record<string, string> = {
  High: "oklch(0.6 0.23 27)",
  Medium: "oklch(0.78 0.16 75)",
  Low: "oklch(0.65 0.17 150)",
};

const DEPT_COLORS = [
  "oklch(0.6 0.18 255)",
  "oklch(0.65 0.17 150)",
  "oklch(0.75 0.17 60)",
  "oklch(0.6 0.2 295)",
  "oklch(0.65 0.15 195)",
  "oklch(0.6 0.18 320)",
];

function Dashboard() {
  const { tasks, projects, departments } = useData();
  const [projectF, setProjectF] = useState<string>(ALL);
  const [deptF, setDeptF] = useState<string>(ALL);

  const filtered = useMemo(
    () =>
      tasks.filter(
        (t) => (projectF === ALL || t.project === projectF) && (deptF === ALL || t.department === deptF),
      ),
    [tasks, projectF, deptF],
  );

  const stats = useMemo(() => {
    const total = filtered.length;
    const completed = filtered.filter((t) => t.status === "Completed").length;
    const inProgress = filtered.filter((t) => t.status === "In Progress").length;
    const pending = filtered.filter((t) => t.status === "Pending").length;
    const overdue = filtered.filter(isOverdue).length;
    const avgCompletion = total ? Math.round(filtered.reduce((s, t) => s + t.completion, 0) / total) : 0;
    const totalHours = filtered.reduce((s, t) => s + t.hours, 0);
    return { total, completed, inProgress, pending, overdue, avgCompletion, totalHours };
  }, [filtered]);

  const byDepartment = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((t) => map.set(t.department, (map.get(t.department) ?? 0) + 1));
    return Array.from(map, ([name, value]) => ({ name, value }));
  }, [filtered]);

  const byStatus = useMemo(
    () => [
      { name: "Completed", value: stats.completed },
      { name: "In Progress", value: stats.inProgress },
      { name: "Pending", value: stats.pending },
      { name: "Overdue", value: stats.overdue },
    ].filter((d) => d.value > 0),
    [stats],
  );

  const byPriority = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((t) => map.set(t.priority, (map.get(t.priority) ?? 0) + 1));
    return Array.from(map, ([name, value]) => ({ name, value }));
  }, [filtered]);

  const completionByEmployee = useMemo(() => {
    const map = new Map<string, { total: number; sum: number }>();
    filtered.forEach((t) => {
      const e = map.get(t.employee) ?? { total: 0, sum: 0 };
      e.total += 1;
      e.sum += t.completion;
      map.set(t.employee, e);
    });
    return Array.from(map, ([name, v]) => ({ name, value: Math.round(v.sum / v.total) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filtered]);

  const hoursByProject = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((t) => map.set(t.project, (map.get(t.project) ?? 0) + t.hours));
    return Array.from(map, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filtered]);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <AppShell>
      {/* Filters */}
      <div className="mb-6 rounded-xl border bg-card p-4 shadow-card">
        <div className="flex flex-wrap items-center gap-3">
          <div className="mr-auto flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{today}</span>
          </div>
          <Select value={projectF} onValueChange={setProjectF}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Projects" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All Projects</SelectItem>
              {projects.map((p) => (<SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={deptF} onValueChange={setDeptF}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Departments" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All Departments</SelectItem>
              {departments.map((d) => (<SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        <KPICard icon={ListChecks} label="Total Tasks" value={stats.total} accent="kpi-1" />
        <KPICard icon={CheckCircle2} label="Completed" value={stats.completed} accent="kpi-2" />
        <KPICard icon={Loader2} label="In Progress" value={stats.inProgress} accent="kpi-3" />
        <KPICard icon={Clock} label="Pending" value={stats.pending} accent="kpi-4" />
        <KPICard icon={AlertTriangle} label="Overdue" value={stats.overdue} accent="kpi-5" />
        <KPICard icon={Percent} label="Avg Completion" value={`${stats.avgCompletion}%`} accent="kpi-6" />
        <KPICard icon={Timer} label="Hours Worked" value={`${stats.totalHours}h`} accent="kpi-7" />
      </div>

      {/* Charts row 1 */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Tasks by Department">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={byDepartment} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {byDepartment.map((_, i) => (
                  <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Task Status Distribution">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {byStatus.map((d, i) => (
                  <Cell key={i} fill={STATUS_COLORS[d.name]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Priority Breakdown">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={byPriority} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {byPriority.map((d, i) => (
                  <Cell key={i} fill={PRIORITY_COLORS[d.name]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Completion % by Employee" subtitle="Top contributors">
          <ResponsiveContainer>
            <BarChart data={completionByEmployee} layout="vertical" margin={{ left: 8, right: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.01 255)" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Bar dataKey="value" fill="oklch(0.6 0.18 255)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Hours Worked by Project">
          <ResponsiveContainer>
            <BarChart data={hoursByProject} layout="vertical" margin={{ left: 8, right: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.01 255)" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `${v}h`} />
              <Bar dataKey="value" fill="oklch(0.65 0.17 150)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Legend & notes */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <LegendCard title="Priority Legend" items={[
          { color: "bg-destructive", label: "High Priority" },
          { color: "bg-warning", label: "Medium Priority" },
          { color: "bg-success", label: "Low Priority" },
        ]} />
        <LegendCard title="Status Legend" items={[
          { color: "bg-success", label: "Completed" },
          { color: "bg-warning", label: "In Progress" },
          { color: "bg-purple", label: "Pending" },
          { color: "bg-destructive", label: "Overdue" },
        ]} />
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h3 className="text-sm font-semibold">Notes</h3>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            <li>• Update task status daily.</li>
            <li>• Ensure completion % is updated regularly.</li>
            <li>• Overdue tasks are highlighted automatically.</li>
          </ul>
        </div>
      </div>
    </AppShell>
  );
}

function LegendCard({ title, items }: { title: string; items: { color: string; label: string }[] }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-card">
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-2 space-y-1.5">
        {items.map((i) => (
          <li key={i.label} className="flex items-center gap-2 text-sm">
            <span className={`inline-block h-3 w-3 rounded-full ${i.color}`} />
            <span>{i.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
