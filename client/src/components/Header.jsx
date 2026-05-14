import { Bell, Search, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";

export default function Header({ onMenuClick = () => {} }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const roleLabelMap = {
    admin: "ADMIN",
    operations: "OPERATIONS",
    bdm: "BDM"
  };

  const roleBadgeClassMap = {
    admin: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    operations: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
    bdm: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
  };

  const roleLabel = roleLabelMap[user?.role] || user?.role?.toUpperCase() || "ADMIN";
  const roleBadgeClass = roleBadgeClassMap[user?.role] || "bg-amber-50 text-amber-700 ring-1 ring-amber-200";

  const shortcuts = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Projects", to: "/projects" },
    { label: "Customers", to: "/customers" },
    { label: "Stock", to: "/stock" },
    { label: "Expenses", to: "/expenses" },
    { label: "Invoices", to: "/invoices" },
    { label: "Team", to: "/team" },
    { label: "Settings", to: "/settings" }
  ];

  const filteredShortcuts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return shortcuts.slice(0, 6);
    return shortcuts.filter((item) => item.label.toLowerCase().includes(normalized)).slice(0, 8);
  }, [query]);

  const handleSearchKeyDown = (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (!filteredShortcuts.length) return;
    navigate(filteredShortcuts[0].to);
    setQuery("");
  };

  const displayName = user?.name || "Company Admin";

  return (
    <header className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-md shadow-slate-900/[0.04] ring-1 ring-slate-100 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-4">
        {user?.logo ? (
          <div className="flex items-center justify-center rounded-xl bg-slate-50 p-2 ring-1 ring-slate-200">
            <img src={user.logo} alt="Company logo" className="h-10 max-w-xs object-contain" />
          </div>
        ) : (
          <Logo size="medium" showText={true} />
        )}

        <button
          type="button"
          onClick={onMenuClick}
          className="mt-1 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 md:hidden"
          aria-label="Open navigation drawer"
        >
          <span className="flex flex-col gap-1">
            <span className="block h-0.5 w-5 rounded-full bg-slate-700" />
            <span className="block h-0.5 w-5 rounded-full bg-slate-700" />
            <span className="block h-0.5 w-5 rounded-full bg-slate-700" />
          </span>
        </button>

        <div>
          <p className="text-sm font-medium text-slate-500">Solar Company Operations Hub</p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back, {displayName}</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">Company: {user?.company || "SunBright Energy Pvt Ltd"}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative w-full min-w-[200px] md:w-64">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search projects, customers, subsidy IDs..."
            aria-label="Search"
          />
          {query ? (
            <div className="absolute right-0 top-[calc(100%+6px)] z-20 w-full rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
              {filteredShortcuts.length ? (
                filteredShortcuts.map((item) => (
                  <button
                    key={item.to}
                    type="button"
                    onClick={() => {
                      navigate(item.to);
                      setQuery("");
                    }}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    {item.label}
                  </button>
                ))
              ) : (
                <p className="px-3 py-2 text-sm text-slate-500">No matches</p>
              )}
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${roleBadgeClass}`}>
            <UserRound size={16} />
            {roleLabel}
          </div>
          <button
            type="button"
            className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm transition hover:bg-slate-50"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
          </button>
          <button type="button" onClick={logout} className="btn-secondary whitespace-nowrap">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
