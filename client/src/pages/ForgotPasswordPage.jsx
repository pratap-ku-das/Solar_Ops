import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mail, ShieldCheck } from "lucide-react";
import api from "../api/api";
import AuthShell from "../components/AuthShell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: "", text: "" });

    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setStatus({ type: "success", text: data.message || "Reset link sent. Check your inbox." });
    } catch (error) {
      setStatus({ type: "error", text: error.response?.data?.message || "Unable to send reset link." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Password Help"
      title="Forgot your password?"
      subtitle="Enter your email address and we’ll send a secure reset link if the account exists."
      highlights={[
        "Secure reset tokens with expiry",
        "Friendly email-based recovery",
        "Protected backend validation"
      ]}
    >
      <div className="rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
            <ShieldCheck size={22} />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">Reset Access</p>
            <h2 className="text-2xl font-bold text-slate-900">Forgot password</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Enter Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                className="input pl-10"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@company.com"
                required
              />
            </div>
          </div>

          {status.text ? (
            <div className={`rounded-2xl px-4 py-3 text-sm ${status.type === "error" ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200" : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"}`}>
              {status.text}
            </div>
          ) : null}

          <button type="submit" disabled={loading} className="btn-primary flex w-full items-center justify-center gap-2 py-3 text-base disabled:cursor-not-allowed disabled:opacity-70">
            {loading ? "Sending link..." : "Send Reset Link"}
            <ArrowRight size={18} />
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Remembered your password?{" "}
          <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">
            Back to login
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}