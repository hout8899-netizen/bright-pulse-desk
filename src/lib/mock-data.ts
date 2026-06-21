export type Priority = "High" | "Medium" | "Low";
export type Status = "Completed" | "In Progress" | "Pending";

export type HistoryField = "status" | "priority" | "notes" | "completion" | "created";

export interface TaskHistoryEntry {
  at: string; // ISO timestamp
  field: HistoryField;
  from?: string;
  to?: string;
  message?: string;
}

export interface Task {
  id: string;
  employee: string;
  department: string;
  project: string;
  description: string;
  priority: Priority;
  status: Status;
  startDate: string; // ISO yyyy-mm-dd
  dueDate: string;
  completion: number; // 0-100
  hours: number;
  manager: string;
  notes?: string;
  history?: TaskHistoryEntry[];
}

export interface Project {
  id: string;
  name: string;
  department: string;
  manager: string;
  startDate: string;
  endDate: string;
  status: Status;
  budget: number;
}

export interface Department {
  id: string;
  name: string;
  head: string;
}

export interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  email: string;
  phone: string;
}

export const departments: Department[] = [
  { id: "D01", name: "Engineering", head: "Sarah Connor" },
  { id: "D02", name: "Marketing", head: "John Reese" },
  { id: "D03", name: "Sales", head: "Lisa Wong" },
  { id: "D04", name: "Operations", head: "Mike Patel" },
  { id: "D05", name: "Design", head: "Emma Stone" },
];

export const employees: Employee[] = [
  { id: "E01", name: "Alice Johnson", department: "Engineering", position: "Senior Developer", email: "alice@co.com", phone: "555-0101" },
  { id: "E02", name: "Bob Smith", department: "Engineering", position: "Developer", email: "bob@co.com", phone: "555-0102" },
  { id: "E03", name: "Carol White", department: "Design", position: "UI Designer", email: "carol@co.com", phone: "555-0103" },
  { id: "E04", name: "David Lee", department: "Marketing", position: "Marketing Lead", email: "david@co.com", phone: "555-0104" },
  { id: "E05", name: "Eva Martinez", department: "Sales", position: "Account Manager", email: "eva@co.com", phone: "555-0105" },
  { id: "E06", name: "Frank Brown", department: "Operations", position: "Operations Analyst", email: "frank@co.com", phone: "555-0106" },
  { id: "E07", name: "Grace Kim", department: "Engineering", position: "QA Engineer", email: "grace@co.com", phone: "555-0107" },
  { id: "E08", name: "Henry Davis", department: "Marketing", position: "Content Strategist", email: "henry@co.com", phone: "555-0108" },
  { id: "E09", name: "Ivy Chen", department: "Design", position: "UX Researcher", email: "ivy@co.com", phone: "555-0109" },
  { id: "E10", name: "Jack Wilson", department: "Sales", position: "Sales Rep", email: "jack@co.com", phone: "555-0110" },
];

export const projects: Project[] = [
  { id: "P01", name: "Website Redesign", department: "Design", manager: "Emma Stone", startDate: "2026-01-15", endDate: "2026-07-30", status: "In Progress", budget: 85000 },
  { id: "P02", name: "Mobile App v2", department: "Engineering", manager: "Sarah Connor", startDate: "2026-02-01", endDate: "2026-08-15", status: "In Progress", budget: 220000 },
  { id: "P03", name: "Q3 Campaign", department: "Marketing", manager: "John Reese", startDate: "2026-05-01", endDate: "2026-09-30", status: "In Progress", budget: 65000 },
  { id: "P04", name: "Sales CRM Migration", department: "Sales", manager: "Lisa Wong", startDate: "2026-03-10", endDate: "2026-06-30", status: "Pending", budget: 45000 },
  { id: "P05", name: "Internal Ops Tooling", department: "Operations", manager: "Mike Patel", startDate: "2025-11-01", endDate: "2026-05-30", status: "Completed", budget: 38000 },
  { id: "P06", name: "API Platform", department: "Engineering", manager: "Sarah Connor", startDate: "2026-04-01", endDate: "2026-12-31", status: "In Progress", budget: 180000 },
];

function d(daysFromToday: number) {
  const dt = new Date();
  dt.setDate(dt.getDate() + daysFromToday);
  return dt.toISOString().slice(0, 10);
}

export const tasks: Task[] = [
  { id: "T001", employee: "Alice Johnson", department: "Engineering", project: "Mobile App v2", description: "Implement authentication module", priority: "High", status: "In Progress", startDate: d(-10), dueDate: d(5), completion: 65, hours: 28, manager: "Sarah Connor" },
  { id: "T002", employee: "Bob Smith", department: "Engineering", project: "Mobile App v2", description: "Build push notifications", priority: "Medium", status: "Pending", startDate: d(-5), dueDate: d(14), completion: 10, hours: 4, manager: "Sarah Connor" },
  { id: "T003", employee: "Carol White", department: "Design", project: "Website Redesign", description: "Design new homepage hero", priority: "High", status: "Completed", startDate: d(-25), dueDate: d(-5), completion: 100, hours: 32, manager: "Emma Stone" },
  { id: "T004", employee: "Carol White", department: "Design", project: "Website Redesign", description: "Component library v2 specs", priority: "Medium", status: "In Progress", startDate: d(-12), dueDate: d(8), completion: 55, hours: 22, manager: "Emma Stone" },
  { id: "T005", employee: "David Lee", department: "Marketing", project: "Q3 Campaign", description: "Launch plan and channel mix", priority: "High", status: "In Progress", startDate: d(-7), dueDate: d(10), completion: 40, hours: 18, manager: "John Reese" },
  { id: "T006", employee: "Henry Davis", department: "Marketing", project: "Q3 Campaign", description: "Write campaign copy", priority: "Medium", status: "Pending", startDate: d(-3), dueDate: d(21), completion: 5, hours: 2, manager: "John Reese" },
  { id: "T007", employee: "Eva Martinez", department: "Sales", project: "Sales CRM Migration", description: "Map legacy account fields", priority: "High", status: "In Progress", startDate: d(-20), dueDate: d(-3), completion: 70, hours: 36, manager: "Lisa Wong" },
  { id: "T008", employee: "Jack Wilson", department: "Sales", project: "Sales CRM Migration", description: "Train sales team on new CRM", priority: "Low", status: "Pending", startDate: d(2), dueDate: d(28), completion: 0, hours: 0, manager: "Lisa Wong" },
  { id: "T009", employee: "Frank Brown", department: "Operations", project: "Internal Ops Tooling", description: "Final QA and rollout", priority: "Medium", status: "Completed", startDate: d(-40), dueDate: d(-10), completion: 100, hours: 45, manager: "Mike Patel" },
  { id: "T010", employee: "Grace Kim", department: "Engineering", project: "API Platform", description: "End-to-end test harness", priority: "High", status: "In Progress", startDate: d(-15), dueDate: d(-2), completion: 80, hours: 40, manager: "Sarah Connor" },
  { id: "T011", employee: "Ivy Chen", department: "Design", project: "Website Redesign", description: "UX research synthesis", priority: "Low", status: "Completed", startDate: d(-30), dueDate: d(-12), completion: 100, hours: 24, manager: "Emma Stone" },
  { id: "T012", employee: "Alice Johnson", department: "Engineering", project: "API Platform", description: "Rate limiting middleware", priority: "Medium", status: "In Progress", startDate: d(-8), dueDate: d(12), completion: 35, hours: 14, manager: "Sarah Connor" },
  { id: "T013", employee: "Bob Smith", department: "Engineering", project: "API Platform", description: "OpenAPI documentation", priority: "Low", status: "Pending", startDate: d(0), dueDate: d(20), completion: 0, hours: 0, manager: "Sarah Connor" },
  { id: "T014", employee: "David Lee", department: "Marketing", project: "Q3 Campaign", description: "Influencer outreach list", priority: "Medium", status: "In Progress", startDate: d(-5), dueDate: d(7), completion: 50, hours: 12, manager: "John Reese" },
  { id: "T015", employee: "Eva Martinez", department: "Sales", project: "Sales CRM Migration", description: "Pipeline import validation", priority: "High", status: "In Progress", startDate: d(-10), dueDate: d(-1), completion: 60, hours: 20, manager: "Lisa Wong" },
];

export function isOverdue(t: Task): boolean {
  if (t.status === "Completed") return false;
  return new Date(t.dueDate) < new Date(new Date().toDateString());
}
