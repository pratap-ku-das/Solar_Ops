export default function StatCard({ title, value, subtitle, accent = "text-brand-600" }) {
  return (
    <div className="card transition hover:-translate-y-1 hover:shadow-xl">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h3 className={`mt-2 text-3xl font-bold ${accent}`}>{value}</h3>
      {subtitle ? <p className="mt-2 text-xs text-slate-500">{subtitle}</p> : null}
    </div>
  );
}
