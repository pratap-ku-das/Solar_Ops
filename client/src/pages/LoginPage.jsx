
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Lock, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthShell from "../components/AuthShell";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("solarRememberedEmail");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      await login(email.trim(), password);

      if (rememberMe) {
        localStorage.setItem("solarRememberedEmail", email.trim());
      } else {
        localStorage.removeItem("solarRememberedEmail");
      }

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    }
  };

  const highlights = [
    "Secure & Reliable – Bank-level security to protect your business and customer data",
    "Real-time Access – Access your projects and teams from anywhere, anytime",
    "Team Collaboration – Work together seamlessly and get more done",
    "Insights & Reports – Track performance and make smarter business decisions",
    "Trusted by 500+ Solar Companies – Powering efficient solar operations across India"
  ];

  return (
    <AuthShell
      eyebrow="SOLAROPS"
      title="Manage your solar operations with ease."
      subtitle="Projects, customers, installations, budgets and more — all in one secure dashboard."
      highlights={highlights}
    >
      <div className="rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-200">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="rounded-full bg-emerald-50 p-4 text-emerald-600 mb-4">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Sign in to your account</h2>
          <p className="text-sm text-slate-600 mt-2">Enter your credentials to access the SolarOps dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                className="w-full pl-12 pr-12 py-3 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 text-sm">
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="font-semibold text-emerald-700 hover:text-emerald-800 transition">
              Forgot password?
            </Link>
          </div>

          {error ? <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">{error}</div> : null}

          <button type="submit" className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition shadow-md">
            Sign In
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-500 font-medium">OR</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <button type="button" className="w-full py-3 px-4 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-2">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <div className="mt-6 text-center text-sm text-slate-600">
          <p>Don't have an account? <Link to="/register" className="font-semibold text-emerald-700 hover:text-emerald-800 transition">Create account</Link></p>
        </div>

        <div className="mt-6 rounded-lg bg-emerald-50 px-4 py-3 text-center text-xs text-emerald-800 ring-1 ring-emerald-200 flex items-center justify-center gap-1.5">
          <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
          Your data is <span className="font-semibold">100% secure</span> and encrypted
        </div>
      </div>
    </AuthShell>
  );
}
