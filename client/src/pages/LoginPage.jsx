import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const starterAccounts = [
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
          <h1 className="mt-3 text-4xl font-bold">Company-ready solar operations, from lead to subsidy.</h1>
          <p className="mt-4 text-slate-300">
            Manage customer onboarding, workflow stages, documents, inventory, expenses, invoices, and team access in one secure platform.
          </p>

          <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-800/60 p-4 text-sm text-slate-200">
            <p className="font-semibold text-white">Starter access</p>
            <p className="mt-1 text-slate-300">Use these only for initial setup and change passwords after your first company login.</p>
          </div>

          <div className="mt-4 space-y-3">
            {starterAccounts.map((account) => (
              <button
                key={account.role}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, email: account.email, password: account.password }))}
                className="flex w-full items-center justify-between rounded-2xl border border-slate-700 px-4 py-3 text-left hover:bg-slate-800"
              >
                <span>{account.role} Starter</span>
                <span className="text-xs text-slate-400">Fill credentials</span>
              </button>
            ))}
          </div>
        </div>

        <div className="card self-center p-8">
          <div className="mb-3 flex gap-2">
            <button onClick={() => setMode("login")} className={mode === "login" ? "btn-primary" : "btn-secondary"}>Login</button>
            <button onClick={() => setMode("register")} className={mode === "register" ? "btn-primary" : "btn-secondary"}>Initial Setup</button>
          </div>
          <p className="mb-6 text-sm text-slate-500">After the first admin signs in, create all future staff accounts from the `Team` page.</p>

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
