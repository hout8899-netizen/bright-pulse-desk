import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Mail, Eye, EyeOff, LogIn, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { signIn } from "@/lib/auth";

const DEMO_EMAIL = "demo@tracker.app";
const DEMO_PASSWORD = "demo1234";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Task & Project Tracker" },
      { name: "description", content: "Sign in to access your project dashboard." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email";
    if (!password) next.password = "Password is required";
    else if (password.length < 6) next.password = "Password must be at least 6 characters";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      signIn(email);
      toast.success("Welcome back!", { description: email });
      navigate({ to: "/" });
    }, 700);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50">
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none"
             style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #6366f1 0, transparent 40%), radial-gradient(circle at 80% 70%, #06b6d4 0, transparent 45%)" }} />
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-white/10 grid place-items-center backdrop-blur">
              <LogIn className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold tracking-widest uppercase">Task &amp; Project Tracker</span>
          </div>
        </div>
        <div className="relative space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Plan smarter.<br />Ship faster.
          </h1>
          <p className="text-slate-300 max-w-md">
            Track projects, monitor tasks, and keep every team in sync — all from one professional dashboard.
          </p>
          <ul className="space-y-2 text-sm text-slate-200">
            {["Real-time KPIs and charts", "Department & employee insights", "Task history and timelines"].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative text-xs text-slate-400">© {new Date().getFullYear()} Task &amp; Project Tracker</div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Sign in to your account</h2>
            <p className="mt-1 text-sm text-slate-500">Enter your credentials to continue.</p>
          </div>

          <div className="mb-6 rounded-lg border border-indigo-200 bg-indigo-50/70 p-3">
            <div className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 text-indigo-600" />
              <div className="flex-1 text-xs text-slate-700">
                <div className="font-semibold text-indigo-900">Demo account</div>
                <div className="mt-1 font-mono text-[11px]">
                  <div>Email: <span className="text-slate-900">{DEMO_EMAIL}</span></div>
                  <div>Password: <span className="text-slate-900">{DEMO_PASSWORD}</span></div>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 border-indigo-300 text-indigo-700 hover:bg-indigo-100"
                onClick={() => {
                  setEmail(DEMO_EMAIL);
                  setPassword(DEMO_PASSWORD);
                  setErrors({});
                  toast.info("Demo credentials filled");
                }}
              >
                Use
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-11"
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10 h-11"
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="remember" checked={remember} onCheckedChange={(v) => setRemember(!!v)} />
              <Label htmlFor="remember" className="text-sm font-normal text-slate-600 cursor-pointer">
                Remember me for 30 days
              </Label>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-11 bg-indigo-600 hover:bg-indigo-700">
              {loading ? "Signing in..." : "Sign in"}
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
              <div className="relative flex justify-center"><span className="bg-slate-50 px-2 text-xs text-slate-500">OR</span></div>
            </div>

            <Button type="button" variant="outline" className="w-full h-11">
              <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
              Continue with Google
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
