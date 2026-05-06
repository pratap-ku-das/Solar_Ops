import { CheckCircle2, Circle } from "lucide-react";

const stageColors = {
  Proposal: "border-slate-400 bg-white text-slate-700",
  "Document Collection": "border-blue-400 bg-blue-50 text-blue-700",
  "Digital Approval Pending": "border-amber-400 bg-amber-50 text-amber-700",
  "Installation Pending": "border-orange-400 bg-orange-50 text-orange-700",
  "Installation Complete": "border-emerald-400 bg-emerald-50 text-emerald-700",
  "Subsidy Disbursed": "border-green-400 bg-green-50 text-green-700"
};

export default function PipelineSteps({ stages = [], currentStage }) {
  return (
    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 w-full py-4">
      <div className="flex items-center gap-6 min-w-max px-4">
        {stages.map((stage, idx) => {
          const isCompleted = stages.indexOf(currentStage) > idx;
          const isCurrent = currentStage === stage;
          return (
            <div key={stage} className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-4 mb-2 ${
                  isCompleted || isCurrent
                    ? stageColors[stage] || "border-violet-400 bg-violet-50 text-violet-700"
                    : "border-slate-200 bg-white text-slate-400"
                }`}
              >
                {isCompleted || isCurrent ? (
                  <CheckCircle2 size={28} />
                ) : (
                  <Circle size={24} />
                )}
              </div>
              <span className="text-xs font-medium text-center max-w-[80px]">{stage}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
