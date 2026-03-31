import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const demoAccounts = [
  { role: "Admin", email: "admin@solar.com", password: "admin123" },
  { role: "Operations", email: "ops@solar.com", password: "ops123" },
  { role: "BDM", email: "bdm@solar.com", password: "bdm123" }
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register, loading } = useAuth();
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "admin@solar.com", password: "admin123", role: "admin" });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register(form);
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to authenticate.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-amber-50 p-4">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-xl">
          <p className="text-sm uppercase tracking-[0.35em] text-brand-400">Solar PM</p>
          <h1 className="mt-3 text-4xl font-bold">Manage solar projects from lead to subsidy.</h1>
          <p className="mt-4 text-slate-300">
            One platform for workflow automation, inventory, expenses, document management, and installation scheduling.
          </p>

          <div className="mt-6 space-y-3">
            {demoAccounts.map((account) => (
              <button
                key={account.role}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, email: account.email, password: account.password }))}
                className="flex w-full items-center justify-between rounded-2xl border border-slate-700 px-4 py-3 text-left hover:bg-slate-800"
              >
                <span>{account.role} Demo</span>
                <span className="text-xs text-slate-400">Use account</span>
              </button>
            ))}
          </div>
        </div>

        <div className="card self-center p-8">
          <div className="mb-6 flex gap-2">
            <button onClick={() => setMode("login")} className={mode === "login" ? "btn-primary" : "btn-secondary"}>Login</button>
            <button onClick={() => setMode("register")} className={mode === "register" ? "btn-primary" : "btn-secondary"}>Register</button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === "register" && (
              <>
                <input className="input" name="name" placeholder="Full name" value={form.name} onChange={handleChange} required />
                <select className="input" name="role" value={form.role} onChange={handleChange}>
                  <option value="admin">Admin</option>
                  <option value="operations">Operations</option>
                  <option value="bdm">BDM</option>
                </select>
              </>
            )}

            <input className="input" type="email" name="email" placeholder="Email address" value={form.email} onChange={handleChange} required />
            <input className="input" type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <button className="btn-primary w-full" disabled={loading} type="submit">
              {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
