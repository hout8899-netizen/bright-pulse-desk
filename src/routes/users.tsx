import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Shield, ShieldCheck, UserPlus, Trash2, Search, Crown, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  upsertUser,
  setUserRole,
  removeUser,
  useUsers,
  useSession,
  DEMO_ADMIN_EMAIL,
  type Role,
} from "@/lib/auth";

export const Route = createFileRoute("/users")({
  head: () => ({
    meta: [
      { title: "Users & Roles — Task & Project Tracker" },
      { name: "description", content: "Manage user access and roles." },
    ],
  }),
  component: UsersPage,
});

function UsersPage() {
  const navigate = useNavigate();
  const session = useSession();
  const users = useUsers();

  // Client-side guard
  useEffect(() => {
    if (session === null) {
      navigate({ to: "/login" });
    } else if (session.role !== "admin") {
      toast.error("Access denied", { description: "Admins only." });
      navigate({ to: "/" });
    }
  }, [session, navigate]);

  const [query, setQuery] = useState("");
  const [openInvite, setOpenInvite] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<Role>("member");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.email.toLowerCase().includes(q));
  }, [users, query]);

  const adminCount = users.filter((u) => u.role === "admin").length;

  const handleInvite = () => {
    const email = newEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid email");
      return;
    }
    upsertUser(email, newRole);
    toast.success("User added", { description: `${email} • ${newRole}` });
    setNewEmail("");
    setNewRole("member");
    setOpenInvite(false);
  };

  const handleRoleChange = (email: string, role: Role) => {
    try {
      setUserRole(email, role);
      toast.success("Role updated", { description: `${email} → ${role}` });
    } catch (e) {
      toast.error("Cannot change role", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    }
  };

  const handleRemove = (email: string) => {
    try {
      removeUser(email);
      toast.success("User removed", { description: email });
    } catch (e) {
      toast.error("Cannot remove user", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    }
  };

  if (!session || session.role !== "admin") {
    return null;
  }

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-indigo-600">
            <Shield className="h-4 w-4" /> Admin
          </div>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Users &amp; Roles</h1>
          <p className="text-sm text-slate-500">
            Manage who can access this workspace and what they can do.
          </p>
        </div>

        <Dialog open={openInvite} onOpenChange={setOpenInvite}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <UserPlus className="mr-2 h-4 w-4" /> Add user
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a user</DialogTitle>
              <DialogDescription>
                The user will be able to sign in with this email (mock mode — any password works).
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="person@company.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={newRole} onValueChange={(v) => setNewRole(v as Role)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member — view & edit content</SelectItem>
                    <SelectItem value="admin">Admin — full access &amp; user management</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenInvite(false)}>Cancel</Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleInvite}>
                Add user
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <StatCard label="Total users" value={users.length} icon={UserIcon} />
        <StatCard label="Admins" value={adminCount} icon={Crown} accent="indigo" />
        <StatCard label="Members" value={users.length - adminCount} icon={ShieldCheck} accent="emerald" />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 p-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead className="w-[180px]">Role</TableHead>
              <TableHead className="hidden md:table-cell">Created</TableHead>
              <TableHead className="hidden md:table-cell">Last login</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-slate-500">
                  No users match your search.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((u) => {
                const isSelf = u.email === session.email;
                const isDemo = u.email === DEMO_ADMIN_EMAIL;
                return (
                  <TableRow key={u.email}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">{u.email}</span>
                        {isSelf && <Badge variant="secondary" className="text-[10px]">you</Badge>}
                        {isDemo && <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-[10px]">demo</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={u.role}
                        onValueChange={(v) => handleRoleChange(u.email, v as Role)}
                        disabled={isDemo}
                      >
                        <SelectTrigger className="h-8 w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">
                            <span className="flex items-center gap-2"><Crown className="h-3.5 w-3.5 text-indigo-600" /> Admin</span>
                          </SelectItem>
                          <SelectItem value="member">
                            <span className="flex items-center gap-2"><UserIcon className="h-3.5 w-3.5 text-slate-500" /> Member</span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-slate-500">
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-600"
                        disabled={isDemo || isSelf}
                        onClick={() => handleRemove(u.email)}
                        aria-label={`Remove ${u.email}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
        <div className="font-semibold text-slate-800">Role permissions</div>
        <ul className="mt-2 space-y-1">
          <li><strong className="text-indigo-700">Admin</strong> — full access to all pages, plus user &amp; role management.</li>
          <li><strong className="text-slate-700">Member</strong> — can view and edit tasks, projects, departments, and employees. Cannot manage users.</li>
        </ul>
      </div>
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent = "slate",
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  accent?: "slate" | "indigo" | "emerald";
}) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    indigo: "bg-indigo-100 text-indigo-700",
    emerald: "bg-emerald-100 text-emerald-700",
  } as const;
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className={`grid h-10 w-10 place-items-center rounded-lg ${tones[accent]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-xs uppercase tracking-wider text-slate-500">{label}</div>
        <div className="text-xl font-bold text-slate-900">{value}</div>
      </div>
    </div>
  );
}
