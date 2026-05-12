import { useEffect, useMemo, useState } from "react";
import { Building2, CheckCircle2, Download, Mail, Phone, RefreshCw, Save, UserCircle2 } from "lucide-react";
import { Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

function ToggleRow({ label, enabled, onChange }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-sm font-semibold text-slate-800">{label}</p>
      <button type="button" onClick={() => onChange(!enabled)} className={`relative h-7 w-12 rounded-full ${enabled ? "bg-emerald-500" : "bg-slate-300"}`}>
        <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow ${enabled ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { updateUser } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleLogoFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maxWidth = 320;
        const maxHeight = 160;
        const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));

        const context = canvas.getContext("2d");
        if (!context) return;
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        const compressedLogo = canvas.toDataURL("image/jpeg", 0.85);

        setSettings((s) => ({
          ...s,
          profile: {
            ...s.profile,
            logo: compressedLogo
          }
        }));
      };
      image.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    api
      .get("/system/settings")
      .then((res) => {
        setSettings(res.data);
        setError("");
      })
      .catch((err) => {
        setError(err?.response?.data?.message || "Unable to load settings from the database.");
      })
      .finally(() => setLoading(false));
  }, []);

  const saveSettings = () => {
    if (!settings) return;
    setSaving(true);
    api
      .put("/system/settings", settings)
      .then((res) => {
        setSettings(res.data);
        setError("");
        updateUser((currentUser) =>
          currentUser
            ? {
                ...currentUser,
                name: res.data?.profile?.fullName || currentUser.name,
                company: res.data?.profile?.companyName || currentUser.company,
                email: res.data?.profile?.email || currentUser.email,
                role: res.data?.profile?.role ? currentUser.role : currentUser.role
              }
            : currentUser
        );
      })
      .catch((err) => {
        setError(err?.response?.data?.message || "Unable to save settings.");
      })
      .finally(() => setSaving(false));
  };

  const apiUsageData = useMemo(() => {
    const used = Number(settings?.account?.apiUsagePct || 0);
    return [{ name: "Used", value: used, color: "#2563eb" }, { name: "Remaining", value: Math.max(0, 100 - used), color: "#e2e8f0" }];
  }, [settings?.account?.apiUsagePct]);

  if (loading) return <div className="card text-sm text-slate-500">Loading settings from database...</div>;
  if (!settings) {
    return <div className="card text-sm text-rose-600">{error || "Settings are unavailable right now."}</div>;
  }

  const used = Number(settings.account.storageUsedGb || 0);
  const total = Number(settings.account.storageTotalGb || 1);
  const loginActivity = (settings.account.monthlyLoginActivity || [0, 0, 0, 0, 0, 0, 0]).map((v, i) => ({ day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i], logins: v }));

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-3">
        <div className="card xl:col-span-2">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-600 to-indigo-700 text-white shadow-lg"><UserCircle2 className="h-12 w-12" /></div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{settings.profile.fullName}</h3>
                <p className="mt-1 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">{settings.profile.role}</p>
                <div className="mt-3 grid gap-1 text-sm text-slate-600">
                  <p className="inline-flex items-center gap-2"><Mail className="h-4 w-4" /> {settings.profile.email}</p>
                  <p className="inline-flex items-center gap-2"><Phone className="h-4 w-4" /> {settings.profile.phone}</p>
                  <p className="inline-flex items-center gap-2"><Building2 className="h-4 w-4" /> {settings.profile.companyName}</p>
                </div>
                <p className="mt-3 text-xs font-medium text-slate-500">Last Login: Today, 09:24 AM � Account Status: <span className="text-emerald-700">Active</span></p>
              </div>
            </div>
            <button className="btn-primary inline-flex items-center gap-2" onClick={saveSettings}><Save className="h-4 w-4" />{saving ? "Saving..." : "Save Changes"}</button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-bold text-slate-900">Account Status</h3>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200"><p className="text-slate-500">Storage Used</p><p className="font-bold">{used}GB / {total}GB</p></div>
            <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200"><p className="text-slate-500">Team Members</p><p className="font-bold">{settings.account.teamMembersActive} Active</p></div>
            <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200"><p className="text-slate-500">Projects Managed</p><p className="font-bold">{settings.account.projectsManaged}</p></div>
            <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200"><p className="text-slate-500">Plan</p><p className="font-bold text-blue-700">{settings.account.subscriptionPlan}</p></div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="h-28"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={apiUsageData} dataKey="value" innerRadius={30} outerRadius={44} stroke="none">{apiUsageData.map((e) => <Cell key={e.name} fill={e.color} />)}</Pie></PieChart></ResponsiveContainer><p className="-mt-3 text-center text-xs font-semibold text-slate-700">API Usage {settings.account.apiUsagePct}%</p></div>
            <div className="h-28"><ResponsiveContainer width="100%" height="100%"><LineChart data={loginActivity}><Tooltip /><Line dataKey="logins" stroke="#10b981" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer><p className="-mt-3 text-center text-xs font-semibold text-slate-700">Monthly Login Activity</p></div>
          </div>
          <p className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">WhatsApp Credits Remaining: {settings.account.whatsappCreditsRemaining.toLocaleString("en-IN")}</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="card space-y-3">
          <h3 className="text-lg font-bold">1. Profile Settings</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <input className="input" value={settings.profile.fullName} onChange={(e) => setSettings((s) => ({ ...s, profile: { ...s.profile, fullName: e.target.value } }))} />
            <input className="input" value={settings.profile.email} onChange={(e) => setSettings((s) => ({ ...s, profile: { ...s.profile, email: e.target.value } }))} />
            <input className="input" value={settings.profile.phone} onChange={(e) => setSettings((s) => ({ ...s, profile: { ...s.profile, phone: e.target.value } }))} />
            <input className="input" value={settings.profile.companyName} onChange={(e) => setSettings((s) => ({ ...s, profile: { ...s.profile, companyName: e.target.value } }))} />
            <input className="input" value={settings.profile.gstNumber} onChange={(e) => setSettings((s) => ({ ...s, profile: { ...s.profile, gstNumber: e.target.value } }))} />
            <input className="input" value={settings.profile.timezone} onChange={(e) => setSettings((s) => ({ ...s, profile: { ...s.profile, timezone: e.target.value } }))} />
            <input className="input md:col-span-2" value={settings.profile.officeAddress} onChange={(e) => setSettings((s) => ({ ...s, profile: { ...s.profile, officeAddress: e.target.value } }))} />
            <select className="input" value={settings.profile.language} onChange={(e) => setSettings((s) => ({ ...s, profile: { ...s.profile, language: e.target.value } }))}><option>English (India)</option><option>Hindi</option></select>
            <input className="input" placeholder="Company Logo URL (optional)" value={settings.profile.logo || ""} onChange={(e) => setSettings((s) => ({ ...s, profile: { ...s.profile, logo: e.target.value } }))} />
            <input className="input" type="file" accept="image/*" onChange={handleLogoFileChange} />
            {settings.profile.logo ? (
              <div className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Logo Preview</p>
                <img src={settings.profile.logo} alt="Company logo preview" className="h-16 rounded-lg bg-white p-1 ring-1 ring-slate-200" />
              </div>
            ) : null}
          </div>
        </div>

        <div className="card space-y-3">
          <h3 className="text-lg font-bold">4. Notification Settings</h3>
          <ToggleRow label="Email Notifications" enabled={settings.notifications.emailNotifications} onChange={(v) => setSettings((s) => ({ ...s, notifications: { ...s.notifications, emailNotifications: v } }))} />
          <ToggleRow label="WhatsApp Alerts" enabled={settings.notifications.whatsappAlerts} onChange={(v) => setSettings((s) => ({ ...s, notifications: { ...s.notifications, whatsappAlerts: v } }))} />
          <ToggleRow label="Invoice Reminders" enabled={settings.notifications.invoiceReminders} onChange={(v) => setSettings((s) => ({ ...s, notifications: { ...s.notifications, invoiceReminders: v } }))} />
          <ToggleRow label="DISCOM Updates" enabled={settings.notifications.discomUpdates} onChange={(v) => setSettings((s) => ({ ...s, notifications: { ...s.notifications, discomUpdates: v } }))} />
        </div>

        <div className="card space-y-3">
          <h3 className="text-lg font-bold">5. Automation Settings</h3>
          <ToggleRow label="Auto Invoice Generation" enabled={settings.automation.autoInvoiceGeneration} onChange={(v) => setSettings((s) => ({ ...s, automation: { ...s.automation, autoInvoiceGeneration: v } }))} />
          <ToggleRow label="Auto Project Assignment" enabled={settings.automation.autoProjectAssignment} onChange={(v) => setSettings((s) => ({ ...s, automation: { ...s.automation, autoProjectAssignment: v } }))} />
          <ToggleRow label="Installation Scheduling" enabled={settings.automation.installationScheduling} onChange={(v) => setSettings((s) => ({ ...s, automation: { ...s.automation, installationScheduling: v } }))} />
          <ToggleRow label="Auto Backup" enabled={settings.automation.autoBackup} onChange={(v) => setSettings((s) => ({ ...s, automation: { ...s.automation, autoBackup: v } }))} />
        </div>

        <div className="card space-y-3">
          <h3 className="text-lg font-bold">7. API & Integrations</h3>
          {["razorpay", "gmailSmtp", "whatsappApi", "awsS3", "googleMapsApi", "mongodbAtlas"].map((k) => (
            <div key={k} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
              <p className="font-semibold text-slate-800">{k}</p>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">{settings.integrations[k]}</span>
            </div>
          ))}
        </div>

        <div className="card space-y-3 xl:col-span-2">
          <h3 className="text-lg font-bold">8. Backup & Recovery</h3>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200"><p className="text-xs text-slate-500">Last Backup</p><p className="font-semibold">{settings.backup.lastBackup}</p></div>
            <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200"><p className="text-xs text-slate-500">Backup Frequency</p><p className="font-semibold">{settings.backup.backupFrequency}</p></div>
            <div className="rounded-xl bg-emerald-50 p-3 ring-1 ring-emerald-200"><p className="text-xs text-emerald-700">Backup Status</p><p className="font-semibold text-emerald-800">{settings.backup.backupStatus}</p></div>
            <div className="rounded-xl bg-blue-50 p-3 ring-1 ring-blue-200"><p className="text-xs text-blue-700">Disaster Recovery</p><p className="font-semibold text-blue-800">{settings.backup.disasterRecovery}</p></div>
          </div>
          <div className="flex flex-wrap gap-2"><button className="btn-primary inline-flex items-center gap-2"><RefreshCw className="h-4 w-4" />Run Backup Now</button><button className="btn-secondary inline-flex items-center gap-2"><Download className="h-4 w-4" />Download Backup</button><button className="btn-secondary" onClick={saveSettings}>Save All Settings</button></div>
        </div>

        <div className="card space-y-3 xl:col-span-2">
          <h3 className="text-lg font-bold">9. Billing & Bank Details</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <input className="input" placeholder="Account Holder Name" value={settings.bankDetails?.accountName || ""} onChange={(e) => setSettings((s) => ({ ...s, bankDetails: { ...s.bankDetails, accountName: e.target.value } }))} />
            <input className="input" placeholder="Bank Name" value={settings.bankDetails?.bankName || ""} onChange={(e) => setSettings((s) => ({ ...s, bankDetails: { ...s.bankDetails, bankName: e.target.value } }))} />
            <input className="input" placeholder="Account Number" value={settings.bankDetails?.accountNumber || ""} onChange={(e) => setSettings((s) => ({ ...s, bankDetails: { ...s.bankDetails, accountNumber: e.target.value } }))} />
            <input className="input" placeholder="IFSC Code" value={settings.bankDetails?.ifscCode || ""} onChange={(e) => setSettings((s) => ({ ...s, bankDetails: { ...s.bankDetails, ifscCode: e.target.value.toUpperCase() } }))} />
            <input className="input" placeholder="Branch" value={settings.bankDetails?.branch || ""} onChange={(e) => setSettings((s) => ({ ...s, bankDetails: { ...s.bankDetails, branch: e.target.value } }))} />
            <input className="input" placeholder="UPI ID (optional)" value={settings.bankDetails?.upiId || ""} onChange={(e) => setSettings((s) => ({ ...s, bankDetails: { ...s.bankDetails, upiId: e.target.value } }))} />
          </div>
          <p className="text-xs text-slate-500">These details are used in exported invoice PDF payment section.</p>
        </div>
      </section>

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">{error}</div> : null}
      <footer className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="inline-flex items-center gap-2 font-semibold"><CheckCircle2 className="h-4 w-4" />All systems operational</p>
          <p className="font-medium">SolarOps v2.4.0 � Last updated: 24 May 2025 10:30 AM</p>
        </div>
      </footer>
    </div>
  );
}
