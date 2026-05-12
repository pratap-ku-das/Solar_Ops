import { CheckCircle2, Sparkles } from "lucide-react";

export default function AuthShell({ eyebrow = "Solar PM", title, subtitle, highlights = [], children }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.16),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.12),_transparent_26%),linear-gradient(180deg,_#f8fafc_0%,_#f1f5f9_100%)]">
      <div className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative hidden overflow-hidden bg-slate-950 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-amber-500/20 blur-3xl" />
          <div className="absolute bottom-12 right-12 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-amber-200 ring-1 ring-white/15">
              <Sparkles size={14} />
              {eyebrow}
            </div>
            <h1 className="mt-8 text-5xl font-black leading-tight tracking-tight text-white">{title}</h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">{subtitle}</p>

            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {highlights.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <CheckCircle2 size={16} className="text-emerald-300" />
                    {item}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 max-w-lg rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <p className="text-sm font-semibold text-amber-200">Built for teams that want clarity.</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Manage access, track progress, reset passwords securely, and keep your solar workflow moving without switching tools.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-8 sm:px-8 lg:px-12">
          <div className="w-full max-w-xl">{children}</div>
        </section>
      </div>
    </div>
  );
}