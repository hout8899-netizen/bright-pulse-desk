import { useSyncExternalStore } from "react";

const KEY = "tpt.session";
const USERS_KEY = "tpt.users";
const EVT = "tpt-auth-change";
const USERS_EVT = "tpt-users-change";

export const DEMO_ADMIN_EMAIL = "demo@tracker.app";

export type Role = "admin" | "member";

export type ManagedUser = {
  email: string;
  role: Role;
  password: string;
  createdAt: string;
  lastLoginAt?: string;
};

export const DEMO_ADMIN_PASSWORD = "demo1234";

export type Session = {
  email: string;
  role: Role;
  loggedInAt: string;
} | null;

// ---------- Session cache ----------
let cachedRaw: string | null = null;
let cachedSession: Session = null;

function read(): Session {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === cachedRaw) return cachedSession;
    cachedRaw = raw;
    cachedSession = raw ? (JSON.parse(raw) as Session) : null;
    return cachedSession;
  } catch {
    cachedRaw = null;
    cachedSession = null;
    return null;
  }
}

// ---------- Users registry ----------
let cachedUsersRaw: string | null = null;
let cachedUsers: ManagedUser[] = [];

function readUsersRaw(): ManagedUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    if (raw === cachedUsersRaw) return cachedUsers;
    cachedUsersRaw = raw;
    cachedUsers = raw ? (JSON.parse(raw) as ManagedUser[]) : [];
    return cachedUsers;
  } catch {
    cachedUsersRaw = null;
    cachedUsers = [];
    return [];
  }
}

function writeUsers(users: ManagedUser[]) {
  cachedUsersRaw = JSON.stringify(users);
  cachedUsers = users;
  window.localStorage.setItem(USERS_KEY, cachedUsersRaw);
  window.dispatchEvent(new Event(USERS_EVT));
}

function ensureSeed(): ManagedUser[] {
  const users = readUsersRaw();
  if (users.length === 0) {
    const seeded: ManagedUser[] = [
      { email: DEMO_ADMIN_EMAIL, role: "admin", createdAt: new Date().toISOString() },
    ];
    writeUsers(seeded);
    return seeded;
  }
  // Make sure demo is always admin
  const demo = users.find((u) => u.email === DEMO_ADMIN_EMAIL);
  if (!demo) {
    const next = [
      ...users,
      { email: DEMO_ADMIN_EMAIL, role: "admin" as Role, createdAt: new Date().toISOString() },
    ];
    writeUsers(next);
    return next;
  }
  if (demo.role !== "admin") {
    const next = users.map((u) => (u.email === DEMO_ADMIN_EMAIL ? { ...u, role: "admin" as Role } : u));
    writeUsers(next);
    return next;
  }
  return users;
}

export function listUsers(): ManagedUser[] {
  return ensureSeed();
}

export function getUserByEmail(email: string): ManagedUser | undefined {
  return ensureSeed().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function upsertUser(email: string, role: Role = "member"): ManagedUser {
  const users = ensureSeed();
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    const next = users.map((u) =>
      u === existing ? { ...u, lastLoginAt: new Date().toISOString() } : u,
    );
    writeUsers(next);
    return next.find((u) => u.email === existing.email)!;
  }
  const created: ManagedUser = {
    email,
    role,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };
  writeUsers([...users, created]);
  return created;
}

export function setUserRole(email: string, role: Role) {
  const users = ensureSeed();
  // Guard: keep at least one admin
  if (role === "member") {
    const admins = users.filter((u) => u.role === "admin");
    if (admins.length === 1 && admins[0].email.toLowerCase() === email.toLowerCase()) {
      throw new Error("Cannot demote the last admin");
    }
  }
  const next = users.map((u) =>
    u.email.toLowerCase() === email.toLowerCase() ? { ...u, role } : u,
  );
  writeUsers(next);

  // If we changed the current user's role, sync the session too
  const current = read();
  if (current && current.email.toLowerCase() === email.toLowerCase()) {
    const updated: Session = { ...current, role };
    window.localStorage.setItem(KEY, JSON.stringify(updated));
    cachedRaw = null; // force re-parse
    window.dispatchEvent(new Event(EVT));
  }
}

export function removeUser(email: string) {
  const users = ensureSeed();
  if (email === DEMO_ADMIN_EMAIL) throw new Error("Cannot remove the demo admin");
  const target = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (target?.role === "admin") {
    const admins = users.filter((u) => u.role === "admin");
    if (admins.length <= 1) throw new Error("Cannot remove the last admin");
  }
  writeUsers(users.filter((u) => u.email.toLowerCase() !== email.toLowerCase()));
}

// ---------- Sign-in / sign-out ----------
export function signIn(email: string) {
  ensureSeed();
  const user = upsertUser(email, email === DEMO_ADMIN_EMAIL ? "admin" : "member");
  const session: Session = {
    email: user.email,
    role: user.role,
    loggedInAt: new Date().toISOString(),
  };
  window.localStorage.setItem(KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(EVT));
}

export type SignOutReport = {
  ok: boolean;
  removedLocal: string[];
  removedSession: string[];
  remaining: string[];
};

function isAuthKey(k: string) {
  const lk = k.toLowerCase();
  // Note: we deliberately keep `tpt.users` registry so admin-managed roles persist across logins
  if (k === USERS_KEY) return false;
  return k.startsWith("tpt.session") || lk.includes("token") || lk.includes("auth") || lk.includes("session");
}

export function signOut(): SignOutReport {
  const report: SignOutReport = { ok: true, removedLocal: [], removedSession: [], remaining: [] };
  try {
    const localKeys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && (k === KEY || isAuthKey(k))) localKeys.push(k);
    }
    localKeys.forEach((k) => {
      window.localStorage.removeItem(k);
      report.removedLocal.push(k);
    });

    for (let i = 0; i < window.sessionStorage.length; i++) {
      const k = window.sessionStorage.key(i);
      if (k) report.removedSession.push(k);
    }
    window.sessionStorage.clear();

    document.cookie.split(";").forEach((c) => {
      const name = c.split("=")[0]?.trim();
      if (name) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });

    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && (k === KEY || isAuthKey(k))) report.remaining.push(`local:${k}`);
    }
    for (let i = 0; i < window.sessionStorage.length; i++) {
      const k = window.sessionStorage.key(i);
      if (k) report.remaining.push(`session:${k}`);
    }
    report.ok = report.remaining.length === 0;
  } catch (e) {
    report.ok = false;
    console.error("[auth] signOut error", e);
  }

  console.info("[auth] signOut report", report);
  window.dispatchEvent(new Event(EVT));
  return report;
}

// ---------- Subscriptions / hooks ----------
function subscribe(cb: () => void) {
  window.addEventListener(EVT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVT, cb);
    window.removeEventListener("storage", cb);
  };
}

function subscribeUsers(cb: () => void) {
  window.addEventListener(USERS_EVT, cb);
  window.addEventListener(EVT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(USERS_EVT, cb);
    window.removeEventListener(EVT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function useSession(): Session {
  return useSyncExternalStore(subscribe, read, () => null);
}

export function useUsers(): ManagedUser[] {
  return useSyncExternalStore(subscribeUsers, listUsers, () => []);
}

export function useIsAdmin(): boolean {
  const s = useSession();
  return s?.role === "admin";
}
