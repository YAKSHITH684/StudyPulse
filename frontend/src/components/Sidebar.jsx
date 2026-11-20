import React from 'react';
import { 
  LayoutDashboard, Clock, Grid, BookOpen, FileText, 
  BarChart3, Binary, Database, Activity, Sparkles, 
  LogOut, Shield, ChevronRight, X, Heart
} from 'lucide-react';

export default function Sidebar({ 
  user, 
  activeTab, 
  setActiveTab, 
  onLogout, 
  onSwitchRole, 
  mobileOpen, 
  setMobileOpen, 
  highRiskCount, 
  totalStudents, 
  t 
}) {
  const navSections = [
    {
      title: "CORE INTELLIGENCE",
      items: [
        { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard, badge: highRiskCount > 0 ? `${highRiskCount} High` : null, badgeColor: 'bg-rose-500 text-white' },
        { id: 'timeline', label: t.predictiveTimeline, icon: Clock },
        { id: 'heatmap', label: t.riskHeatmap, icon: Grid },
      ]
    },
    {
      title: "ACADEMIC CARE & AI",
      items: [
        { id: 'tutor', label: t.studyPlannerTutor, icon: BookOpen, tag: 'AI' },
        { id: 'docIntel', label: t.documentIntelligence || 'Document Intel & OCR', icon: FileText, tag: 'OCR' },
      ]
    },
    {
      title: "ANALYTICS & PIPELINE",
      items: [
        { id: 'analytics', label: t.schoolAnalytics, icon: BarChart3 },
        { id: 'metrics', label: t.modelMetrics, icon: Binary },
        { id: 'dataHub', label: t.dataHub, icon: Database },
      ]
    }
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (mobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-slate-300 flex flex-col border-r border-slate-800/80 shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Brand Header */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-slate-800/80 relative">
          <div className="flex items-center space-x-3.5 cursor-pointer" onClick={() => handleNavClick('dashboard')}>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-rose-500 rounded-2xl blur-xs opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative h-11 w-11 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-violet-700 flex items-center justify-center text-white shadow-lg shadow-sky-500/25">
                <Activity className="h-6 w-6 stroke-[2.5]" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-xl tracking-tight text-white">
                  StudyPulse
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  AI v1.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-tight">
                Early-Warning System
              </p>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button 
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live System Status Pill */}
        <div className="px-5 py-3 border-b border-slate-800/50 bg-slate-900/40">
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-bold text-slate-300">AI Inference Engine</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
              98.5% Recall
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-none">
          {user?.role === 'parent' ? (
            <div className="space-y-1">
              <span className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                PARENT VIEW
              </span>
              <button
                onClick={() => handleNavClick('parentPortal')}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'parentPortal'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Heart className="w-4 h-4 text-emerald-400" />
                <span>Parent Care Portal</span>
              </button>
            </div>
          ) : (
            navSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                <span className="px-3 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                  {section.title}
                </span>
                <div className="space-y-1 mt-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 group relative ${
                          isActive
                            ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-lg shadow-sky-600/25'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-sky-400'
                          }`} />
                          <span className="tracking-tight">{item.label}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1.5">
                          {item.badge && (
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-2xs ${item.badgeColor}`}>
                              {item.badge}
                            </span>
                          )}
                          {item.tag && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                              {item.tag}
                            </span>
                          )}
                          {isActive && (
                            <ChevronRight className="w-3.5 h-3.5 text-white/70" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Persona Switcher & User Profile Card */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 space-y-3">
          {/* Quick Role Buttons */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
              <Sparkles className="w-3 h-3 mr-1 text-amber-400 fill-amber-400" />
              Demo Persona:
            </span>
            <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => onSwitchRole('admin')}
                className={`py-1 text-[11px] font-bold rounded-lg transition-all ${
                  user?.role === 'admin'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => onSwitchRole('teacher')}
                className={`py-1 text-[11px] font-bold rounded-lg transition-all ${
                  user?.role === 'teacher'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Teacher
              </button>
              <button
                onClick={() => onSwitchRole('parent')}
                className={`py-1 text-[11px] font-bold rounded-lg transition-all ${
                  user?.role === 'parent'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Parent
              </button>
            </div>
          </div>

          {/* User Card */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className={`h-8 w-8 rounded-xl flex items-center justify-center text-xs font-black text-white shrink-0 shadow-md ${
                user?.role === 'admin' ? 'bg-gradient-to-tr from-indigo-500 to-purple-600' :
                user?.role === 'teacher' ? 'bg-gradient-to-tr from-sky-500 to-blue-600' :
                'bg-gradient-to-tr from-emerald-500 to-teal-600'
              }`}>
                {user?.user_name ? user.user_name[0] : (user?.full_name ? user.full_name[0] : 'U')}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate">
                  {user?.user_name || user?.full_name}
                </div>
                <div className="text-[10px] text-slate-400 capitalize flex items-center font-medium">
                  <span className={`w-1.5 h-1.5 rounded-full mr-1 ${
                    user?.role === 'admin' ? 'bg-indigo-400' :
                    user?.role === 'teacher' ? 'bg-sky-400' : 'bg-emerald-400'
                  }`} />
                  {user?.role}
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-xl transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
