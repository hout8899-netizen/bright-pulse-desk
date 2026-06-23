import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ListChecks,
  FolderKanban,
  Building2,
  Users,
  Menu,
  X,
  LogOut,
  UserCircle2,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tasks", label: "Tasks", icon: ListChecks },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/departments", label: "Departments", icon: Building2 },
  { to: "/employees", label: "Employees", icon: Users },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const session = useSession();
  const router = useRouter();

  const handleLogout = () => {
    const report = signOut();
    const total = report.removedLocal.length + report.removedSession.length;
    console.info("[logout] cleared", report);

    if (report.ok) {
      toast.success("Signed out", {
        description: `Cleared ${report.removedLocal.length} local + ${report.removedSession.length} session item(s). Redirecting…`,
      });
    } else {
      toast.error("Signed out with warnings", {
        description: `Some items could not be cleared: ${report.remaining.join(", ") || "unknown"}`,
      });
    }

    router.navigate({ to: "/login", replace: true });
    if (typeof window !== "undefined") {
      setTimeout(() => window.location.replace("/login"), 80);
    }
    void total;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-navy text-navy-foreground shadow-elevated">
        <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-4 py-4 sm:px-6">
          <button
            className="rounded-md p-1.5 hover:bg-white/10 lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle navigation"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight sm:text-xl">
              TASK &amp; PROJECT TRACKER
            </h1>
            <p className="hidden text-xs text-white/70 sm:block">
              Track Tasks, Monitor Progress, Achieve Results
            </p>
          </div>
          <nav className="ml-auto hidden items-center gap-1 lg:flex">
            {nav.map((n) => {
              const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-white/15 text-white"
                      : "text-white/75 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <n.icon className="h-4 w-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-1 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-white/85 hover:bg-white/10">
                <UserCircle2 className="h-6 w-6" />
                <span className="hidden max-w-[140px] truncate sm:inline">
                  {session?.email ?? "Account"}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="truncate">
                {session?.email ?? "Not signed in"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {open && (
          <nav className="border-t border-white/10 bg-navy lg:hidden">
            <div className="mx-auto max-w-[1600px] px-4 py-2">
              {nav.map((n) => {
                const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm",
                      active ? "bg-white/15 text-white" : "text-white/80 hover:bg-white/10",
                    )}
                  >
                    <n.icon className="h-4 w-4" />
                    {n.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6">{children}</main>

      <footer className="mx-auto max-w-[1600px] px-4 pb-8 pt-2 text-xs text-muted-foreground sm:px-6">
        <p>
          <span className="font-semibold">Disclaimer:</span> This tracker is for internal use only.
          Data accuracy is the responsibility of the user.
        </p>
      </footer>
    </div>
  );
}
