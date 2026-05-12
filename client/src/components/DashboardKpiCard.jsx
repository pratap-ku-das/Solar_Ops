import { Line, LineChart, ResponsiveContainer } from "recharts";

export default function DashboardKpiCard({
  title,
  value,
  subtitle,
  growth,
  growthLabel = "vs last month",
  icon: Icon,
  gradientFrom,
  gradientTo,
  sparkData,
  sparkStroke,
  iconBgClass
}) {
  const chartData = sparkData.map((y, i) => ({ i, y }));

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-md shadow-slate-900/[0.04] ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/[0.07]`}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-90 ${gradientFrom} ${gradientTo} transition-opacity group-hover:opacity-100`}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">{value}</p>
          <p className="mt-1 text-xs font-medium text-slate-600">{subtitle}</p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200/80">
            <span className="tabular-nums">{growth}</span>
            <span className="font-medium text-emerald-700/90">{growthLabel}</span>
          </div>
        </div>
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-inner ring-1 ring-white/60 ${iconBgClass}`}
        >
          <Icon className="h-6 w-6" strokeWidth={2} />
        </div>
      </div>
      <div className="relative mt-4 h-11 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
            <Line type="monotone" dataKey="y" stroke={sparkStroke} strokeWidth={2} dot={false} isAnimationActive animationDuration={900} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
