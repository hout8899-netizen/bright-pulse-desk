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

export function signOut() {
  try {
    window.localStorage.removeItem(KEY);
    // Clear any other auth-related keys (tokens, remember-me, etc.)
    for (let i = window.localStorage.length - 1; i >= 0; i--) {
      const k = window.localStorage.key(i);
      if (k && (k.startsWith("tpt.") || k.toLowerCase().includes("token") || k.toLowerCase().includes("auth"))) {
        window.localStorage.removeItem(k);
      }
    }
    window.sessionStorage.clear();
  } catch {
    // ignore storage errors
  }
  window.dispatchEvent(new Event(EVT));
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
