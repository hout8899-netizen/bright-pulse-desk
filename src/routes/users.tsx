import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Shield, ShieldCheck, UserPlus, Trash2, Search, Crown, User as UserIcon, Eye, EyeOff, RefreshCw, Copy } from "lucide-react";
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
import { useI18n } from "@/lib/i18n";

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
  const { t } = useI18n();

  useEffect(() => {
    if (session === null) {
      navigate({ to: "/login" });
    } else if (session.role !== "admin") {
      toast.error(t("users.accessDenied"), { description: t("users.adminsOnly") });
      navigate({ to: "/" });
    }
  }, [session, navigate, t]);

  const [query, setQuery] = useState("");
  const [openInvite, setOpenInvite] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<Role>("member");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.email.toLowerCase().includes(q));
  }, [users, query]);

  const adminCount = users.filter((u) => u.role === "admin").length;

  const genPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    let out = "";
    for (let i = 0; i < 10; i++) out += chars[Math.floor(Math.random() * chars.length)];
    setNewPassword(out);
    setShowNewPw(true);
  };

  const handleInvite = () => {
    const email = newEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error(t("users.invalidEmail"));
      return;
    }
    if (newPassword.length < 6) {
      toast.error(t("users.passwordMin"));
      return;
    }
    try {
      upsertUser(email, newRole, newPassword);
      toast.success(t("users.userAdded"), { description: `${email} • ${newRole}` });
      setNewEmail("");
      setNewRole("member");
      setNewPassword("");
      setShowNewPw(false);
      setOpenInvite(false);
    } catch (e) {
      toast.error("Failed", { description: e instanceof Error ? e.message : "Unknown error" });
    }
  };

  const handleRoleChange = (email: string, role: Role) => {
    try {
      setUserRole(email, role);
      toast.success(t("users.roleUpdated"), { description: `${email} → ${role}` });
    } catch (e) {
      toast.error("Cannot change role", { description: e instanceof Error ? e.message : "Unknown error" });
    }
  };

  const handleRemove = (email: string) => {
    try {
      removeUser(email);
      toast.success(t("users.userRemoved"), { description: email });
    } catch (e) {
      toast.error("Cannot remove user", { description: e instanceof Error ? e.message : "Unknown error" });
    }
  };

  if (!session || session.role !== "admin") return null;

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-indigo-600">
            <Shield className="h-4 w-4" /> {t("users.adminBadge")}
          </div>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{t("users.title")}</h1>
          <p className="text-sm text-slate-500">{t("users.subtitle")}</p>
        </div>

        <Dialog open={openInvite} onOpenChange={setOpenInvite}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <UserPlus className="mr-2 h-4 w-4" /> {t("users.addUser")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("users.addUserTitle")}</DialogTitle>
              <DialogDescription>{t("users.addUserDesc")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email">{t("common.email")}</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder={t("users.emailPh")}
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("common.role")}</Label>
                <Select value={newRole} onValueChange={(v) => setNewRole(v as Role)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">{t("users.memberOpt")}</SelectItem>
                    <SelectItem value="admin">{t("users.adminOpt")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="invite-password">{t("common.password")}</Label>
                  <button
                    type="button"
                    onClick={genPassword}
                    className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    <RefreshCw className="h-3 w-3" /> {t("users.generate")}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="invite-password"
                    type={showNewPw ? "text" : "password"}
                    placeholder={t("users.passwordPh")}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-20"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {newPassword && (
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(newPassword);
                          toast.success(t("users.passwordCopied"));
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600"
                        aria-label="Copy password"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowNewPw((v) => !v)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                      aria-label={showNewPw ? "Hide password" : "Show password"}
                    >
                      {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">{t("users.passwordHint")}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenInvite(false)}>{t("common.cancel")}</Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleInvite}>
                {t("users.addUser")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <StatCard label={t("users.totalUsers")} value={users.length} icon={UserIcon} />
        <StatCard label={t("users.admins")} value={adminCount} icon={Crown} accent="indigo" />
        <StatCard label={t("users.members")} value={users.length - adminCount} icon={ShieldCheck} accent="emerald" />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 p-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder={t("users.searchPh")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("common.email")}</TableHead>
              <TableHead className="w-[180px]">{t("common.role")}</TableHead>
              <TableHead className="hidden md:table-cell">{t("common.created")}</TableHead>
              <TableHead className="hidden md:table-cell">{t("common.lastLogin")}</TableHead>
              <TableHead className="w-[80px] text-right">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-slate-500">
                  {t("users.noMatch")}
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
                        {isSelf && <Badge variant="secondary" className="text-[10px]">{t("common.you")}</Badge>}
                        {isDemo && <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-[10px]">{t("common.demo")}</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={u.role}
                        onValueChange={(v) => handleRoleChange(u.email, v as Role)}
                        disabled={isDemo}
                      >
                        <SelectTrigger className="h-8 w-[150px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">
                            <span className="flex items-center gap-2"><Crown className="h-3.5 w-3.5 text-indigo-600" /> {t("account.admin")}</span>
                          </SelectItem>
                          <SelectItem value="member">
                            <span className="flex items-center gap-2"><UserIcon className="h-3.5 w-3.5 text-slate-500" /> {t("account.member")}</span>
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
                        aria-label={t("common.delete")}
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
        <div className="font-semibold text-slate-800">{t("users.rolePermissions")}</div>
        <ul className="mt-2 space-y-1">
          <li><strong className="text-indigo-700">{t("account.admin")}</strong> — {t("users.adminPerm")}</li>
          <li><strong className="text-slate-700">{t("account.member")}</strong> — {t("users.memberPerm")}</li>
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
