import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout() {
  return (
    <div className="relative min-h-screen overflow-hidden lg:flex">
      <div className="pointer-events-none absolute left-[-130px] top-[-110px] h-72 w-72 rounded-full bg-sky-300/35 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-140px] right-[-120px] h-80 w-80 rounded-full bg-emerald-300/30 blur-3xl" />
      <Sidebar />
      <main className="relative z-10 flex-1 p-4 md:p-6">
        <Header />
        <Outlet />
      </main>
    </div>
  );
}
