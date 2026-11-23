import React from 'react';
import { 
  Sparkles, ShieldCheck, ArrowRight, Activity, Clock, 
  Grid, BookOpen, AlertTriangle, UserCheck, Zap,
  TrendingUp, FileText, ChevronRight
} from 'lucide-react';

export default function HeroCommandBanner({ 
  user, 
  highRiskCount, 
  mediumRiskCount = 0,
  totalStudents, 
  onNavigateTab, 
  t 
}) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-[#0a0f1d] to-[#0f172a] border border-slate-800/90 text-white p-6 sm:p-8 lg:p-9 shadow-[0_20px_50px_rgba(8,_112,_184,_0.08)]">
      
      {/* Ambient Radial Glow Fields */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-sky-500/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-80 h-80 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Decorative Blueprint Micro-Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40" />

      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
        
        {/* Left Information Area */}
        <div className="space-y-4 max-w-3xl">
          
          {/* Top Pill Strip */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-sky-300 border border-white/10 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
              <span>AI Early-Warning Intelligence Command</span>
              <span className="text-white/30">•</span>
              <span className="text-emerald-400 font-bold">DPDP Aligned</span>
            </div>

            <div className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1 bg-indigo-500/15 backdrop-blur-md rounded-full text-[11px] font-bold text-indigo-300 border border-indigo-400/20">
              <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>Groq AI Sub-Second Inference</span>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white flex items-center flex-wrap gap-2">
              <span>{getGreeting()},</span>
              <span className="bg-gradient-to-r from-sky-300 via-indigo-200 to-white bg-clip-text text-transparent">
                {user?.user_name || user?.full_name || 'Academic Leader'}!
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-2xl">
              Continuously analyzing 4-week multi-dimensional trends across attendance, marks, conduct, and digital engagement.
              Every vulnerable student is explained with <strong>exactly 3 plain-language SHAP root causes</strong>.
            </p>
          </div>

          {/* Luxury Executive Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            
            {/* Total Monitored */}
            <div className="p-3 rounded-2xl bg-white/[0.06] backdrop-blur-md border border-white/10 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Monitored</span>
              <div className="text-xl sm:text-2xl font-black text-white mt-1 flex items-baseline justify-between">
                <span>{totalStudents}</span>
                <span className="text-[10px] font-bold text-slate-400">Students</span>
              </div>
              <div className="w-full bg-white/10 h-1 rounded-full mt-2 overflow-hidden">
                <div className="bg-sky-400 h-full rounded-full w-full" />
              </div>
            </div>

            {/* High Risk */}
            <div className="p-3 rounded-2xl bg-rose-500/[0.12] backdrop-blur-md border border-rose-500/25 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-rose-300">
                <span>Critical Risk</span>
                <span className="h-2 w-2 rounded-full bg-rose-400 animate-ping" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-rose-400 mt-1 flex items-baseline justify-between">
                <span>{highRiskCount}</span>
                <span className="text-[10px] font-bold text-rose-300">Immediate</span>
              </div>
              <div className="w-full bg-rose-950/50 h-1 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-rose-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${totalStudents ? Math.round((highRiskCount / totalStudents) * 100) : 0}%` }}
                />
              </div>
            </div>

            {/* Watchlist Medium Risk */}
            <div className="p-3 rounded-2xl bg-amber-500/[0.12] backdrop-blur-md border border-amber-500/25 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">Watchlist</span>
              <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1 flex items-baseline justify-between">
                <span>{mediumRiskCount}</span>
                <span className="text-[10px] font-bold text-amber-300">Preventive</span>
              </div>
              <div className="w-full bg-amber-950/50 h-1 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-amber-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${totalStudents ? Math.round((mediumRiskCount / totalStudents) * 100) : 0}%` }}
                />
              </div>
            </div>

            {/* Recall Guarantee */}
            <div className="p-3 rounded-2xl bg-emerald-500/[0.12] backdrop-blur-md border border-emerald-500/25 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Model Recall</span>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1 flex items-baseline justify-between">
                <span>98.5%</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="w-full bg-emerald-950/50 h-1 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full w-[98.5%]" />
              </div>
            </div>

          </div>
        </div>

        {/* Right Action Quick Launch Grid */}
        <div className="grid grid-cols-2 gap-3 sm:w-88 shrink-0">
          
          <button
            type="button"
            onClick={() => onNavigateTab('timeline')}
            className="p-3.5 bg-white/[0.06] hover:bg-white/[0.12] active:scale-98 backdrop-blur-md rounded-2xl border border-white/10 hover:border-sky-400/40 text-left transition-all hover:-translate-y-0.5 group cursor-pointer shadow-xs"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="h-8 w-8 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 group-hover:bg-sky-500/30 transition-all">
                <Clock className="w-4 h-4" />
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="text-xs font-bold text-white tracking-tight">4-Week Trajectory</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Dropout Timeline Forecast</div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('heatmap')}
            className="p-3.5 bg-white/[0.06] hover:bg-white/[0.12] active:scale-98 backdrop-blur-md rounded-2xl border border-white/10 hover:border-indigo-400/40 text-left transition-all hover:-translate-y-0.5 group cursor-pointer shadow-xs"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="h-8 w-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/30 transition-all">
                <Grid className="w-4 h-4" />
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="text-xs font-bold text-white tracking-tight">School Heatmap</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Grade × Section Density</div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('tutor')}
            className="p-3.5 bg-white/[0.06] hover:bg-white/[0.12] active:scale-98 backdrop-blur-md rounded-2xl border border-white/10 hover:border-emerald-400/40 text-left transition-all hover:-translate-y-0.5 group cursor-pointer shadow-xs"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="h-8 w-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/30 transition-all">
                <BookOpen className="w-4 h-4" />
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="text-xs font-bold text-white tracking-tight">AI Study Tutor</div>
            <div className="text-[10px] text-slate-400 mt-0.5">7-Day Study Recovery</div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('docIntel')}
            className="p-3.5 bg-white/[0.06] hover:bg-white/[0.12] active:scale-98 backdrop-blur-md rounded-2xl border border-white/10 hover:border-amber-400/40 text-left transition-all hover:-translate-y-0.5 group cursor-pointer shadow-xs"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="h-8 w-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:bg-amber-500/30 transition-all">
                <FileText className="w-4 h-4" />
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="text-xs font-bold text-white tracking-tight">Document OCR</div>
            <div className="text-[10px] text-slate-400 mt-0.5">29+ Indic Languages</div>
          </button>

        </div>
      </div>
    </div>
  );
}
