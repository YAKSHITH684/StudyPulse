import React from 'react';
import { 
  Sparkles, ShieldCheck, ArrowRight, Activity, Clock, 
  Grid, BookOpen, AlertTriangle, UserCheck 
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
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white p-6 sm:p-8 shadow-xl shadow-indigo-950/20">
      {/* Background Ambient Glows */}
      <div className="absolute -top-12 -right-12 w-80 h-80 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Information */}
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-sky-300 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>AI Early-Warning Intelligence Command</span>
            <span className="text-white/40">•</span>
            <span className="text-emerald-400 font-bold">DPDP Aligned</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {getGreeting()}, {user?.user_name || user?.full_name || 'Educator'}!
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            Continuously analyzing 4-week multi-dimensional trends across attendance, marks, conduct, and digital engagement.
            Every vulnerable student is explained with <strong>exactly 3 plain-language SHAP root causes</strong>.
          </p>

          {/* Quick Metrics Strip */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-bold">
            <div className="flex items-center space-x-1.5 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10">
              <span className="text-slate-400">Total Monitored:</span>
              <span className="text-white">{totalStudents} Students</span>
            </div>

            <div className="flex items-center space-x-1.5 bg-rose-500/20 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-300">
              <span className="h-2 w-2 rounded-full bg-rose-400 animate-ping"></span>
              <span>{highRiskCount} High Risk Attention</span>
            </div>

            <div className="flex items-center space-x-1.5 bg-amber-500/20 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-amber-500/30 text-amber-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{mediumRiskCount} Watchlist (Medium Risk)</span>
            </div>

            <div className="flex items-center space-x-1.5 bg-emerald-500/20 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-emerald-500/30 text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>98.5% Recall Priority</span>
            </div>
          </div>
        </div>

        {/* Right Action Quick Launch Grid */}
        <div className="grid grid-cols-2 gap-2.5 sm:w-80 shrink-0">
          <button
            onClick={() => onNavigateTab('timeline')}
            className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl border border-white/10 text-left transition-all hover:scale-[1.02] group"
          >
            <Clock className="w-4 h-4 text-sky-400 mb-1 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white">4-Week Trajectory</div>
            <div className="text-[10px] text-slate-400">Dropout Timeline</div>
          </button>

          <button
            onClick={() => onNavigateTab('heatmap')}
            className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl border border-white/10 text-left transition-all hover:scale-[1.02] group"
          >
            <Grid className="w-4 h-4 text-indigo-400 mb-1 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white">School Heatmap</div>
            <div className="text-[10px] text-slate-400">Grade × Section Matrix</div>
          </button>

          <button
            onClick={() => onNavigateTab('tutor')}
            className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl border border-white/10 text-left transition-all hover:scale-[1.02] group"
          >
            <BookOpen className="w-4 h-4 text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white">AI Study Tutor</div>
            <div className="text-[10px] text-slate-400">7-Day Study Plans</div>
          </button>

          <button
            onClick={() => onNavigateTab('docIntel')}
            className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl border border-white/10 text-left transition-all hover:scale-[1.02] group"
          >
            <Activity className="w-4 h-4 text-amber-400 mb-1 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white">Document OCR</div>
            <div className="text-[10px] text-slate-400">29+ Indic Languages</div>
          </button>
        </div>
      </div>
    </div>
  );
}
