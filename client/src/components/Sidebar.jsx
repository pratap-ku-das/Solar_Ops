import { BarChart3, Boxes, FileText, LayoutDashboard, Settings, ShieldCheck, Users, Wallet, Target } from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/leads", label: "Leads", icon: Target },
  { to: "/projects", label: "Projects", icon: BarChart3 },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/stock", label: "Stock", icon: Boxes },
  { to: "/expenses", label: "Expenses", icon: Wallet },
  { to: "/invoices", label: "Invoices", icon: FileText },
  { to: "/team", label: "Team", icon: ShieldCheck },
  { to: "/settings", label: "Settings", icon: Settings }
];

export default function Sidebar({ mobileOpen = false, onClose = () => {} }) {
  const drawerClasses = mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0";

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close navigation drawer"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        />
      ) : null}

      <aside
        className={`fixed left-0 top-0 z-50 h-full w-72 max-w-[85vw] overflow-y-auto border-r border-white/5 bg-[#081028] text-white shadow-2xl transition-transform duration-300 md:fixed md:z-50 md:block md:h-screen md:w-64 md:max-w-none md:translate-x-0 ${drawerClasses}`}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-5 md:block">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-400">SolarOps</p>
            <h1 className="mt-2 text-xl font-bold tracking-tight">Project Manager</h1>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">Solar Company Operations Hub</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/15 px-3 py-1 text-xs font-semibold text-slate-200 md:hidden"
          >
            Close
          </button>
        </div>

        <nav className="space-y-1 p-4">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/30 ring-1 ring-white/10"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon size={18} className="opacity-90 transition group-hover:scale-105" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
