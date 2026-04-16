import { Bell, SunMedium } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="floating-card mb-6 flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">SolarOps Dashboard</p>
        <h2 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name}</h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl bg-amber-50/80 px-3 py-2 text-sm font-medium text-amber-700 ring-1 ring-amber-200">
          <SunMedium size={16} />
          {user?.role?.toUpperCase()}
        </div>
        <button className="rounded-xl bg-slate-100/90 p-2 text-slate-700 ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-white">
          <Bell size={18} />
        </button>
        <button onClick={logout} className="btn-secondary hover:-translate-y-0.5">
          Logout
        </button>
      </div>
    </header>
  );
}
