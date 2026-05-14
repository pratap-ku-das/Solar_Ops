import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Building2, RefreshCcw, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import AuthShell from "../components/AuthShell";
import { useAuth } from "../context/AuthContext";
import { generateCaptcha, getPasswordStrength } from "../utils/authHelpers";

const initialForm = {
  name: "",
  company: "",
  address: "",
  phone: "",
  gstNumber: "",
  email: "",
  password: "",
  confirmPassword: "",
  terms: false
};

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [captcha, setCaptcha] = useState(() => generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  const passwordStrength = useMemo(() => getPasswordStrength(form.password), [form.password]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setCaptchaInput("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage({ type: "", text: "" });

    if (!form.name.trim() || !form.company.trim() || !form.email.trim() || !form.password) {
      setMessage({ type: "error", text: "Please fill in all required fields." });
      return;
    }

    if (form.password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }

    if (form.password !== form.confirmPassword) {
      setMessage({ type: "error", text: "Password and confirm password must match." });
      return;
    }

    if (!form.terms) {
      setMessage({ type: "error", text: "You must accept the terms and conditions." });
      return;
    }

    if (captchaInput.trim().toUpperCase() !== captcha) {
      setMessage({ type: "error", text: "Captcha does not match. Please try again." });
      return;
    }

    try {
      await register({
        name: form.name.trim(),
        company: form.company.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
        gstNumber: form.gstNumber.trim(),
        email: form.email.trim(),
        password: form.password
      });

      navigate("/dashboard");
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Unable to create account." });
      refreshCaptcha();
    }
  };

  const highlights = [
    "JWT-backed authentication with protected routes",
    "Secure password reset links with expiry",
    "Role-aware access for admin, operations, and BDM"
  ];

  return (
    <AuthShell
      eyebrow="Create Account"
      title="Build your solar workspace with a clean, secure login experience."
      subtitle="Create a company account with validation, CAPTCHA protection, and a password reset flow that is ready for real users."
      highlights={highlights}
      rightPanelClassName="max-w-2xl"
    >
      <div className="rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 sm:p-8 lg:p-10">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
            <Sparkles size={22} />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">Solar PM</p>
            <h2 className="text-2xl font-bold text-slate-900">Create your account</h2>
          </div>
        </div>

        <p className="mt-3 text-sm leading-6 text-slate-500">Enter your company details to start using the dashboard.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Full Name</label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  className="input h-11 pl-10"
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Company Name</label>
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  className="input h-11 pl-10"
                  value={form.company}
                  onChange={(event) => updateField("company", event.target.value)}
                  placeholder="Your company"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Company Address</label>
            <input
              className="input h-11"
              value={form.address}
              onChange={(event) => updateField("address", event.target.value)}
              placeholder="Street address"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Phone Number</label>
              <input
                className="input h-11"
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                placeholder="Company phone"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">GST Number</label>
              <input
                className="input h-11"
                value={form.gstNumber}
                onChange={(event) => updateField("gstNumber", event.target.value)}
                placeholder="GSTIN"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email Address</label>
            <input
              className="input h-11"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="name@company.com"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input
              className="input h-11"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              placeholder="Minimum 6 characters"
              required
            />
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>{passwordStrength.label}</span>
              <span>{form.password.length} characters</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-slate-100">
              <div className={`h-2 rounded-full transition-all ${passwordStrength.barClass} ${passwordStrength.widthClass}`} />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Confirm Password</label>
            <input
              className="input h-11"
              type="password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(event) => updateField("confirmPassword", event.target.value)}
              placeholder="Repeat your password"
              required
            />
            {form.confirmPassword ? (
              <p className={`mt-2 text-xs ${form.password === form.confirmPassword ? "text-emerald-600" : "text-rose-600"}`}>
                {form.password === form.confirmPassword ? "Passwords match." : "Passwords do not match."}
              </p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Captcha Verification</p>
                <p className="mt-1 text-sm text-slate-600">Enter the code exactly as shown below.</p>
              </div>
              <button type="button" onClick={refreshCaptcha} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white">
                <RefreshCcw size={16} />
                Refresh
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 font-mono text-lg font-bold tracking-[0.35em] text-slate-700 shadow-sm">
                {captcha}
              </div>
              <input
                className="input h-11 flex-1 min-w-48"
                value={captchaInput}
                onChange={(event) => setCaptchaInput(event.target.value.toUpperCase())}
                placeholder="Type captcha here"
                required
              />
            </div>
          </div>

          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              checked={form.terms}
              onChange={(event) => updateField("terms", event.target.checked)}
            />
            <span>
              I agree to the terms and conditions and understand this account will be used for secure access to the Solar PM dashboard.
            </span>
          </label>

          {message.text ? (
            <div className={`rounded-2xl px-4 py-3 text-sm ${message.type === "error" ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200" : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"}`}>
              {message.text}
            </div>
          ) : null}

          <button type="submit" disabled={loading} className="btn-primary flex w-full items-center justify-center gap-2 py-3 text-base disabled:cursor-not-allowed disabled:opacity-70">
            {loading ? "Creating account..." : "Create Account"}
            <ArrowRight size={18} />
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">
            Login here
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}