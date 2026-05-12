import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F5F7FB] md:flex">
      <Sidebar mobileOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      <main className="min-w-0 flex-1 p-4 md:ml-64 md:p-6">
        <Header onMenuClick={() => setMobileSidebarOpen(true)} />
        <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-sm ring-1 ring-slate-100 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
