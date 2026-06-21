import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  tasks as initialTasks,
  projects as initialProjects,
  departments as initialDepartments,
  employees as initialEmployees,
  type Task,
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
      addTask: (t) => setTasks((prev) => [...prev, { ...t, id: nextId("T", prev) }]),
      updateTask: (id, patch) =>
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t))),
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
