import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "../api/api";
import StatCard from "../components/StatCard";

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default function DashboardPage() {
  const [data, setData] = useState({
    totals: {},
    recentProjects: [],
    pendingTasks: [],
    installationSchedule: [],
    projectsByStatus: []
  });

  useEffect(() => {
    api.get("/dashboard/stats").then((response) => setData(response.data));
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Projects" value={data.totals.totalProjects || 0} subtitle="Across all stages" />
        <StatCard title="Total Customers" value={data.totals.totalCustomers || 0} subtitle="Residential and commercial" accent="text-blue-600" />
        <StatCard title="Installed Capacity" value={`${data.totals.totalInstalledCapacity || 0} kW`} subtitle="Portfolio capacity" accent="text-amber-600" />
        <StatCard title="Total Revenue" value={currency.format(data.totals.totalRevenue || 0)} subtitle={`Profit estimate: ${currency.format(data.totals.profitEstimate || 0)}`} accent="text-emerald-600" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="card xl:col-span-2">
          <h3 className="mb-4 text-lg font-semibold">Pipeline Analytics</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.projectsByStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={80} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#16a34a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold">Pending Tasks</h3>
          <div className="mt-4 space-y-3">
            {data.pendingTasks.map((task) => (
              <div key={task.id} className="rounded-xl border border-slate-200 p-3">
                <p className="font-medium text-slate-800">{task.title}</p>
                <p className="text-xs text-slate-500">{task.dueHint}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="mb-4 text-lg font-semibold">Recent Projects</h3>
          <div className="space-y-3">
            {data.recentProjects.map((project) => (
              <div key={project._id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <div>
                  <p className="font-medium">{project.customerName}</p>
                  <p className="text-xs text-slate-500">{project.projectSize} • {project.discom}</p>
                </div>
                <span className="badge bg-slate-100 text-slate-700">{project.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="mb-4 text-lg font-semibold">Installation Schedule</h3>
          <div className="space-y-3">
            {data.installationSchedule.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-200 p-3">
                <p className="font-medium">{item.customerName}</p>
                <p className="text-xs text-slate-500">{item.installationDate} • {item.team}</p>
                <span className="mt-2 inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
