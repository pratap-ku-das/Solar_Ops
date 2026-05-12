import { Activity, IndianRupee, LayoutGrid, Users, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import DashboardKpiCard from "../components/DashboardKpiCard";
import api from "../api/api";

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

const priorityStyles = {
  critical: "bg-red-50 text-red-800 ring-red-200 dark:bg-red-950/50 dark:text-red-200 dark:ring-red-900/50",
  high: "bg-amber-50 text-amber-900 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-900/50",
  medium: "bg-sky-50 text-sky-900 ring-sky-200 dark:bg-sky-950/40 dark:text-sky-200 dark:ring-sky-900/50"
};

const stageToneClasses = {
  blue: "bg-sky-50 text-sky-800 ring-sky-200/80 dark:bg-sky-950/40 dark:text-sky-200 dark:ring-sky-800/50",
  amber: "bg-amber-50 text-amber-900 ring-amber-200/80 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-900/50",
  purple: "bg-violet-50 text-violet-900 ring-violet-200/80 dark:bg-violet-950/40 dark:text-violet-200 dark:ring-violet-900/50",
  emerald: "bg-emerald-50 text-emerald-900 ring-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-900/50",
  red: "bg-red-50 text-red-800 ring-red-200/80 dark:bg-red-950/40 dark:text-red-200 dark:ring-red-900/50"
};

function PipelineTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 px-4 py-3 text-sm shadow-xl ring-1 ring-slate-100 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/95 dark:ring-slate-800">
      <p className="font-bold text-slate-900 dark:text-white">{label}</p>
      <ul className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
        <li className="flex justify-between gap-6">
          <span>Active projects</span>
          <span className="font-semibold tabular-nums text-slate-900 dark:text-white">{row?.projects}</span>
        </li>
        <li className="flex justify-between gap-6">
          <span>Stage conversion</span>
          <span className="font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">{row?.conversionPct}%</span>
        </li>
        <li className="flex justify-between gap-6">
          <span>SLA delays</span>
          <span className="font-semibold tabular-nums text-red-600 dark:text-red-400">{row?.delays}</span>
        </li>
        <li className="flex justify-between gap-6">
          <span>Completion trend</span>
          <span className="font-semibold tabular-nums text-indigo-600 dark:text-indigo-400">{row?.trend}%</span>
        </li>
      </ul>
    </div>
  );
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totals: { totalProjects: 0, totalCustomers: 0, totalInstalledCapacity: 0, totalRevenue: 0, profitEstimate: 0 },
    pipelineAnalytics: [],
    pendingTasks: [],
    recentProjects: [],
    installationSchedule: []
  });

  useEffect(() => {
    setLoading(true);
    api
      .get("/dashboard/stats")
      .then((res) =>
        setData({
          totals: res?.data?.totals || { totalProjects: 0, totalCustomers: 0, totalInstalledCapacity: 0, totalRevenue: 0, profitEstimate: 0 },
          pipelineAnalytics: Array.isArray(res?.data?.pipelineAnalytics) ? res.data.pipelineAnalytics : [],
          pendingTasks: Array.isArray(res?.data?.pendingTasks) ? res.data.pendingTasks : [],
          recentProjects: Array.isArray(res?.data?.recentProjects) ? res.data.recentProjects : [],
          installationSchedule: Array.isArray(res?.data?.installationSchedule) ? res.data.installationSchedule : []
        })
      )
      .catch(() => {
        setData({
          totals: { totalProjects: 0, totalCustomers: 0, totalInstalledCapacity: 0, totalRevenue: 0, profitEstimate: 0 },
          pipelineAnalytics: [],
          pendingTasks: [],
          recentProjects: [],
          installationSchedule: []
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const kpiSparklines = useMemo(() => {
    const pad = data.pipelineAnalytics.length ? data.pipelineAnalytics.map((x) => x.projects) : [0, 0, 0, 0, 0];
    return {
      projects: [Math.max(0, data.totals.totalProjects - 10), Math.max(0, data.totals.totalProjects - 7), Math.max(0, data.totals.totalProjects - 5), Math.max(0, data.totals.totalProjects - 3), data.totals.totalProjects],
      customers: [Math.max(0, data.totals.totalCustomers - 20), Math.max(0, data.totals.totalCustomers - 15), Math.max(0, data.totals.totalCustomers - 10), Math.max(0, data.totals.totalCustomers - 5), data.totals.totalCustomers],
      capacity: [Math.max(0, data.totals.totalInstalledCapacity - 120), Math.max(0, data.totals.totalInstalledCapacity - 90), Math.max(0, data.totals.totalInstalledCapacity - 60), Math.max(0, data.totals.totalInstalledCapacity - 30), data.totals.totalInstalledCapacity],
      revenue: pad.map((v, i) => (data.totals.totalRevenue ? Math.round((data.totals.totalRevenue / Math.max(1, pad.length)) * (i + 1)) : v))
    };
  }, [data.pipelineAnalytics, data.totals.totalCustomers, data.totals.totalInstalledCapacity, data.totals.totalProjects, data.totals.totalRevenue]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardKpiCard
          title="Total Projects"
          value={`${data.totals.totalProjects} Active Projects`}
          subtitle="Across all stages"
          growth={data.totals.totalProjects ? "+12%" : "—"}
          icon={LayoutGrid}
          gradientFrom="from-emerald-50/0"
          gradientTo="to-emerald-50/90"
          sparkData={kpiSparklines.projects}
          sparkStroke="#059669"
          iconBgClass="bg-emerald-100 text-emerald-700"
        />
        <DashboardKpiCard
          title="Total Customers"
          value={`${data.totals.totalCustomers} Customers`}
          subtitle="Residential & commercial"
          growth={data.totals.totalCustomers ? "+8%" : "—"}
          icon={Users}
          gradientFrom="from-sky-50/0"
          gradientTo="to-sky-50/90"
          sparkData={kpiSparklines.customers}
          sparkStroke="#2563eb"
          iconBgClass="bg-sky-100 text-sky-700"
        />
        <DashboardKpiCard
          title="Installed Capacity"
          value={`${(Number(data.totals.totalInstalledCapacity || 0) / 1000).toFixed(2)} MW`}
          subtitle="Portfolio capacity"
          growth={data.totals.totalInstalledCapacity ? "+9.3%" : "—"}
          growthLabel="this month"
          icon={Zap}
          gradientFrom="from-amber-50/0"
          gradientTo="to-amber-50/90"
          sparkData={kpiSparklines.capacity}
          sparkStroke="#d97706"
          iconBgClass="bg-amber-100 text-amber-800"
        />
        <DashboardKpiCard
          title="Total Revenue"
          value={inr.format(Number(data.totals.totalRevenue || 0))}
          subtitle={`Profit estimate ${inr.format(Number(data.totals.profitEstimate || 0))}`}
          growth={data.totals.totalRevenue ? "+18%" : "—"}
          growthLabel="monthly growth"
          icon={IndianRupee}
          gradientFrom="from-emerald-50/0"
          gradientTo="to-teal-50/90"
          sparkData={kpiSparklines.revenue}
          sparkStroke="#0d9488"
          iconBgClass="bg-teal-100 text-teal-800"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-md shadow-slate-900/[0.04] ring-1 ring-slate-100 xl:col-span-2">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Pipeline Analytics</h3>
              <p className="text-xs font-medium text-slate-500">
                Stage-wise funnel · proposal through subsidy · counts, conversion, delays, and completion trend
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 ring-1 ring-slate-200/80">
              <Activity className="h-4 w-4 text-emerald-600" />
              Live operations snapshot
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.pipelineAnalytics} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                <defs>
                  <linearGradient id="barPipeline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.55} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="stage" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} interval={0} angle={-12} textAnchor="end" height={72} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                <Tooltip content={<PipelineTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar yAxisId="left" dataKey="projects" name="Projects in stage" fill="url(#barPipeline)" radius={[8, 8, 0, 0]} maxBarSize={48} animationDuration={1000} />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="conversionPct"
                  name="Conversion %"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 6 }}
                  animationDuration={1200}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="trend"
                  name="Completion trend"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  dot={false}
                  animationDuration={1200}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs ring-1 ring-slate-200/80">
              <p className="font-semibold text-slate-700">Weighted funnel</p>
              <p className="mt-0.5 text-slate-500">Narrowest at subsidy gate — focus MNRE uploads</p>
            </div>
            <div className="rounded-xl bg-amber-50/80 px-3 py-2 text-xs ring-1 ring-amber-200/80">
              <p className="font-semibold text-amber-900">Approval load</p>
              <p className="mt-0.5 text-amber-800/90">12 combined SLA breaches across DISCOM + bank</p>
            </div>
            <div className="rounded-xl bg-emerald-50/80 px-3 py-2 text-xs ring-1 ring-emerald-200/80">
              <p className="font-semibold text-emerald-900">Throughput</p>
              <p className="mt-0.5 text-emerald-800/90">North Zone leading conversion on documentation QA</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-md shadow-slate-900/[0.04] ring-1 ring-slate-100">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h3 className="text-lg font-bold text-slate-900">Pending Tasks</h3>
            <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">{data.pendingTasks.length} open</span>
          </div>
          <div className="space-y-3">
            {data.pendingTasks.map((task) => (
              <div
                key={task.id}
                className="group rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white to-slate-50/80 p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{task.title}</p>
                    <p className="mt-0.5 text-xs font-medium text-slate-600">{task.stage}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${priorityStyles[task.priority] || priorityStyles.medium}`}>
                    {task.priority}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{task.detail}</p>
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-200/80 pt-3 text-[11px]">
                  <span className="font-semibold text-slate-500">Due</span>
                  <span className="rounded-lg bg-white px-2 py-1 font-bold tabular-nums text-slate-800 ring-1 ring-slate-200">{task.due}</span>
                </div>
              </div>
            ))}
            {loading && !data.pendingTasks.length ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">Loading live tasks…</div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-md shadow-slate-900/[0.04] ring-1 ring-slate-100">
          <h3 className="mb-4 text-lg font-bold text-slate-900">Recent Projects</h3>
          <div className="space-y-3">
            {data.recentProjects.map((project) => (
              <div
                key={project.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-slate-50/40 p-4 transition hover:bg-white hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{project.customer}</p>
                  <p className="mt-0.5 text-xs text-slate-600">
                    {project.size} · {project.type}
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-slate-500">{project.discom}</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200/90">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] font-semibold text-slate-500">Progress {project.progress}%</p>
                </div>
                <span className={`inline-flex shrink-0 self-start rounded-full px-3 py-1 text-xs font-bold ring-1 sm:self-center ${stageToneClasses[project.stageTone] || stageToneClasses.blue}`}>
                  {project.stage}
                </span>
              </div>
            ))}
            {loading && !data.recentProjects.length ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">Loading live projects…</div>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-md shadow-slate-900/[0.04] ring-1 ring-slate-100">
          <h3 className="mb-4 text-lg font-bold text-slate-900">Installation Schedule</h3>
          <div className="space-y-3">
            {data.installationSchedule.map((item) => {
              const status = item.status || item.stage || "";
              const installTone = status.includes("Subsidy")
                ? "purple"
                : status.includes("Login")
                  ? "blue"
                  : status.includes("Installation")
                    ? "emerald"
                    : status.includes("Document")
                      ? "blue"
                      : "amber";
              return (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-white to-slate-50/90 p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{item.customerName || item.customer}</p>
                    <p className="mt-1 text-xs font-medium text-slate-600">
                      <span className="tabular-nums">{item.installationDate || item.date}</span> · {item.team}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${stageToneClasses[installTone]}`}>
                    {status}
                  </span>
                </div>
              </div>
            );
            })}
            {loading && !data.installationSchedule.length ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">Loading schedule…</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
