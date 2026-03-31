import { useEffect, useState } from "react";
import api from "../api/api";

export default function SettingsPage() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    api
      .get("/system/status")
      .then((response) => setStatus(response.data))
      .catch(() => {
        setStatus({
          mode: "unknown",
          databaseConnected: false,
          publicRegistrationEnabled: false,
          remindersEnabled: false,
          storage: "local-uploads",
          userCount: 0,
          environment: "unknown"
        });
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="card">
          <p className="text-sm text-slate-500">Data Mode</p>
          <h3 className={`mt-2 text-2xl font-bold ${status?.databaseConnected ? "text-emerald-600" : "text-amber-600"}`}>
            {status?.databaseConnected ? "MongoDB Live" : "Starter / Demo"}
          </h3>
          <p className="mt-2 text-xs text-slate-500">Environment: {status?.environment || "loading..."}</p>
        </div>

        <div className="card">
          <p className="text-sm text-slate-500">Email Service</p>
          <h3 className={`mt-2 text-2xl font-bold ${status?.remindersEnabled ? "text-emerald-600" : "text-amber-600"}`}>
            {status?.remindersEnabled ? "Configured" : "Needs SMTP"}
          </h3>
          <p className="mt-2 text-xs text-slate-500">Installation and approval reminders</p>
        </div>

        <div className="card">
          <p className="text-sm text-slate-500">Storage</p>
          <h3 className="mt-2 text-2xl font-bold text-blue-600">{status?.storage || "local-uploads"}</h3>
          <p className="mt-2 text-xs text-slate-500">Upgrade to S3 whenever required</p>
        </div>

        <div className="card">
          <p className="text-sm text-slate-500">Team Accounts</p>
          <h3 className="mt-2 text-2xl font-bold text-violet-600">{status?.userCount ?? 0}</h3>
          <p className="mt-2 text-xs text-slate-500">Managed from the `Team` section</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="text-lg font-semibold">Production Readiness</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p>• Role-based access is active for Admin, Operations, and BDM users.</p>
            <p>• Public self-registration is {status?.publicRegistrationEnabled ? "enabled" : "disabled"} for safer company use.</p>
            <p>• Documents are stored under `server/uploads` and linked to each project record.</p>
            <p>• The backend now creates the first admin automatically when MongoDB is connected and the user table is empty.</p>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold">Go-Live Checklist</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p>1. Confirm MongoDB Atlas is reachable from your deployment server.</p>
            <p>2. Set a Gmail App Password instead of a normal mailbox password.</p>
            <p>3. Change all starter passwords after first login.</p>
            <p>4. Add your real team members from the `Team` page and disable unused accounts.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
