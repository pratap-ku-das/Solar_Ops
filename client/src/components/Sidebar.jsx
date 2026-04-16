import { BarChart3, Boxes, FileText, LayoutDashboard, Settings, ShieldCheck, Users, Wallet } from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: BarChart3 },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/stock", label: "Stock", icon: Boxes },
  { to: "/expenses", label: "Expenses", icon: Wallet },
  { to: "/invoices", label: "Invoices", icon: FileText },
  { to: "/team", label: "Team", icon: ShieldCheck },
  { to: "/settings", label: "Settings", icon: Settings }
];

export default function Sidebar() {
  return (
    <aside className="w-full border-r border-slate-800/80 bg-slate-950/95 text-white backdrop-blur-xl lg:min-h-screen lg:w-64">
      <div className="border-b border-slate-800 p-5">
        <p className="text-xs uppercase tracking-[0.25em] text-brand-500">SolarOps</p>
        <h1 className="mt-2 text-xl font-bold text-white/95">Project Manager</h1>
      </div>

      <nav className="space-y-1 p-4">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-700/30"
                  : "text-slate-300 hover:bg-slate-800/90 hover:text-white"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
