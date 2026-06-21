import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  tasks as initialTasks,
  projects as initialProjects,
  departments as initialDepartments,
  employees as initialEmployees,
  type Task,
  type TaskHistoryEntry,
  type Project,
  type Department,
  type Employee,
} from "./mock-data";

interface DataContextValue {
  tasks: Task[];
  projects: Project[];
  departments: Department[];
  employees: Employee[];
  addTask: (t: Omit<Task, "id">) => void;
  updateTask: (id: string, t: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addProject: (p: Omit<Project, "id">) => void;
  updateProject: (id: string, p: Partial<Project>) => void;
  deleteProject: (id: string) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

function nextId(prefix: string, items: { id: string }[]) {
  const max = items.reduce((m, i) => {
    const n = parseInt(i.id.replace(/\D/g, ""), 10) || 0;
    return Math.max(m, n);
  }, 0);
  return prefix + String(max + 1).padStart(3, "0");
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [departments] = useState<Department[]>(initialDepartments);
  const [employees] = useState<Employee[]>(initialEmployees);

  const value = useMemo<DataContextValue>(
    () => ({
      tasks,
      projects,
      departments,
      employees,
      addTask: (t) =>
        setTasks((prev) => {
          const id = nextId("T", prev);
          const now = new Date().toISOString();
          const created: Task = {
            ...t,
            id,
            history: [
              ...(t.history ?? []),
              { at: now, field: "created", message: `Task created and assigned to ${t.employee || "—"}` },
            ],
          };
          return [...prev, created];
        }),
      updateTask: (id, patch) =>
        setTasks((prev) =>
          prev.map((t) => {
            if (t.id !== id) return t;
            const now = new Date().toISOString();
            const entries: TaskHistoryEntry[] = [];
            if (patch.status !== undefined && patch.status !== t.status) {
              entries.push({ at: now, field: "status", from: t.status, to: patch.status });
            }
            if (patch.priority !== undefined && patch.priority !== t.priority) {
              entries.push({ at: now, field: "priority", from: t.priority, to: patch.priority });
            }
            if (patch.notes !== undefined && (patch.notes ?? "") !== (t.notes ?? "")) {
              const wasEmpty = !(t.notes ?? "").trim();
              const isEmpty = !(patch.notes ?? "").trim();
              entries.push({
                at: now,
                field: "notes",
                message: wasEmpty ? "Notes added" : isEmpty ? "Notes cleared" : "Notes updated",
              });
            }
            if (patch.completion !== undefined && patch.completion !== t.completion) {
              entries.push({
                at: now,
                field: "completion",
                from: `${t.completion}%`,
                to: `${patch.completion}%`,
              });
            }
            return {
              ...t,
              ...patch,
              history: entries.length ? [...(t.history ?? []), ...entries] : t.history,
            };
          }),
        ),
      deleteTask: (id) => setTasks((prev) => prev.filter((t) => t.id !== id)),
      addProject: (p) => setProjects((prev) => [...prev, { ...p, id: nextId("P", prev) }]),
      updateProject: (id, patch) =>
        setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p))),
      deleteProject: (id) => setProjects((prev) => prev.filter((p) => p.id !== id)),
    }),
    [tasks, projects, departments, employees],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
