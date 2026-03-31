const stageColors = {
  Proposal: "bg-slate-100 text-slate-700",
  "Document Collection": "bg-blue-100 text-blue-700",
  "Digital Approval Pending": "bg-amber-100 text-amber-700",
  "Installation Pending": "bg-orange-100 text-orange-700",
  "Installation Complete": "bg-emerald-100 text-emerald-700",
  "Subsidy Disbursed": "bg-green-100 text-green-700"
};

export default function PipelineBoard({ stages = [], projects = [] }) {
  const counts = projects.reduce((acc, project) => {
    acc[project.status] = (acc[project.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="card overflow-x-auto">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Project Pipeline</h3>
          <p className="text-sm text-slate-500">Track every project from proposal to subsidy disbursement.</p>
        </div>
      </div>

      <div className="flex min-w-max gap-3 pb-1">
        {stages.map((stage) => (
          <div key={stage} className="w-48 rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <span className={`badge ${stageColors[stage] || "bg-violet-100 text-violet-700"}`}>{stage}</span>
            <p className="mt-4 text-2xl font-bold text-slate-900">{counts[stage] || 0}</p>
            <p className="text-xs text-slate-500">projects in stage</p>
          </div>
        ))}
      </div>
    </div>
  );
}
