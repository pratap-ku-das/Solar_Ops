import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, KeyRound, LockKeyhole } from "lucide-react";
import api from "../api/api";
import AuthShell from "../components/AuthShell";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "", text: "" });

    if (password.length < 6) {
      setStatus({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }

    if (password !== confirmPassword) {
      setStatus({ type: "error", text: "Password and confirm password must match." });
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password });
      setStatus({ type: "success", text: data.message || "Password updated successfully." });
      setTimeout(() => navigate("/login"), 1200);
    } catch (error) {
      setStatus({ type: "error", text: error.response?.data?.message || "Unable to reset password." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Secure Reset"
      title="Create a new password."
      subtitle="Use a strong password and keep your Solar PM account secure. This reset token is validated on the backend."
      highlights={[
        "Token verification before update",
        "Bcrypt-hashed password storage",
        "Immediate login-ready recovery"
      ]}
    >
      <div className="rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
            <KeyRound size={22} />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">Reset Password</p>
            <h2 className="text-2xl font-bold text-slate-900">Choose a new password</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">New Password</label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                className="input pl-10"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 6 characters"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Confirm Password</label>
            <input
              className="input"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repeat the new password"
              required
            />
          </div>

          {status.text ? (
            <div className={`rounded-2xl px-4 py-3 text-sm ${status.type === "error" ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200" : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"}`}>
              {status.text}
            </div>
          ) : null}

          <button type="submit" disabled={loading} className="btn-primary flex w-full items-center justify-center gap-2 py-3 text-base disabled:cursor-not-allowed disabled:opacity-70">
            {loading ? "Updating password..." : "Update Password"}
            <ArrowRight size={18} />
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">
            Back to login
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}