import { CheckCircle2, Lock, Shield, Zap, Users, BarChart3 } from "lucide-react";
import loginBg from "../assets/login-bg.png";

export default function AuthShell({ eyebrow = "Solar PM", title, subtitle, highlights = [], children, rightPanelClassName = "max-w-sm" }) {
  return (
    <div className="min-h-screen bg-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* LEFT SIDE - Premium Solar Background */}
        <section className="relative hidden lg:flex lg:flex-col lg:justify-between overflow-hidden bg-slate-900">
          {/* High-quality solar background image with overlay */}
          <div 
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(135deg, rgba(8, 16, 40, 0.68) 0%, rgba(8, 16, 40, 0.48) 45%, rgba(8, 16, 40, 0.72) 100%),
                radial-gradient(circle at 30% 30%, rgba(22, 163, 74, 0.16) 0%, transparent 52%),
                radial-gradient(circle at 70% 70%, rgba(16, 185, 129, 0.10) 0%, transparent 48%),
                url(${loginBg})
              `,
              backgroundSize: 'cover, cover, cover, cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              filter: 'saturate(1.08) contrast(1.03)'
            }}
          />

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/42 via-slate-900/18 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-900/78 via-slate-900/35 to-transparent" />

          {/* Content */}
          <div className="relative z-10 px-12 py-16 space-y-12">
            {/* Logo & Branding */}
            <div>
              <div className="inline-flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center h-11 w-11 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg">
                  <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="8" r="4" opacity="0.9"/>
                    <path d="M12 12v8M8 16h8M6 14l-2 2M18 14l2 2" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.9"/>
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white tracking-tight">SOLAROPS</div>
                  <div className="text-xs text-slate-400 font-semibold">Project Manager</div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-emerald-400 mb-3 tracking-wide uppercase">Welcome back!</p>
              <h1 className="text-5xl lg:text-6xl font-black leading-tight tracking-tight text-white mb-6">{title}</h1>
              <p className="text-lg leading-relaxed text-slate-300">{subtitle}</p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-3 max-w-lg">
              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40 group-hover:bg-emerald-500/30 transition">
                  <Shield className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">Secure & Reliable</p>
                  <p className="text-xs text-slate-400 mt-0.5">Bank-level security to protect your business and customer data.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/40 group-hover:bg-blue-500/30 transition">
                  <Zap className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">Real-time Project Access</p>
                  <p className="text-xs text-slate-400 mt-0.5">Access your projects and teams from anywhere, anytime.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center border border-purple-500/40 group-hover:bg-purple-500/30 transition">
                  <Users className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">Team Collaboration</p>
                  <p className="text-xs text-slate-400 mt-0.5">Work together seamlessly and get more done.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-orange-500/20 flex items-center justify-center border border-orange-500/40 group-hover:bg-orange-500/30 transition">
                  <BarChart3 className="h-4 w-4 text-orange-400" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">Reports & Insights</p>
                  <p className="text-xs text-slate-400 mt-0.5">Track performance and make smarter business decisions.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Trust Badge */}
          <div className="relative z-10 px-12 pb-12">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white text-sm">Trusted by 500+ Solar Companies</p>
                <p className="text-xs text-slate-400 mt-1">Powering efficient solar operations across India.</p>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT SIDE - Premium Login Form */}
        <section className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-12 bg-gradient-to-br from-slate-50 via-white to-slate-100">
          <div className={`w-full ${rightPanelClassName}`}>{children}</div>
        </section>
      </div>
    </div>
  );
}