import { useSyncExternalStore } from "react";

const KEY = "tpt.session";
const EVT = "tpt-auth-change";

export type Session = { email: string; loggedInAt: string } | null;

function read(): Session {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function signIn(email: string) {
  const session: Session = { email, loggedInAt: new Date().toISOString() };
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
  return k.startsWith("tpt.") || lk.includes("token") || lk.includes("auth") || lk.includes("session");
}

export function signOut(): SignOutReport {
  const report: SignOutReport = { ok: true, removedLocal: [], removedSession: [], remaining: [] };
  try {
    // Snapshot localStorage keys to remove
    const localKeys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && (k === KEY || isAuthKey(k))) localKeys.push(k);
    }
    localKeys.forEach((k) => {
      window.localStorage.removeItem(k);
      report.removedLocal.push(k);
    });

    // Snapshot sessionStorage keys then clear
    for (let i = 0; i < window.sessionStorage.length; i++) {
      const k = window.sessionStorage.key(i);
      if (k) report.removedSession.push(k);
    }
    window.sessionStorage.clear();

    // Clear non-HttpOnly cookies on this origin
    document.cookie.split(";").forEach((c) => {
      const name = c.split("=")[0]?.trim();
      if (name) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });

    // Verify nothing auth-related remains
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

function subscribe(cb: () => void) {
  window.addEventListener(EVT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function useSession(): Session {
  return useSyncExternalStore(subscribe, read, () => null);
}
