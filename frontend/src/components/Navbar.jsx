import React from 'react';
import { 
  Activity, Shield, Users, UserCheck, Languages, LogOut, 
  Sparkles, GraduationCap, LayoutDashboard, Clock, Grid, 
  BookOpen, BarChart3, Binary, Database, FileText
} from 'lucide-react';
import { INDIC_LANGUAGES } from '../i18n';

export default function Navbar({ 
  user, 
  onLogout, 
  onSwitchRole, 
  activeTab, 
  setActiveTab, 
  language, 
  setLanguage, 
  t 
}) {
  const navItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'timeline', label: t.predictiveTimeline, icon: Clock },
    { id: 'heatmap', label: t.riskHeatmap, icon: Grid },
    { id: 'tutor', label: t.studyPlannerTutor, icon: BookOpen },
    { id: 'docIntel', label: t.documentIntelligence || 'Document Intel & OCR', icon: FileText },
    { id: 'analytics', label: t.schoolAnalytics, icon: BarChart3 },
    { id: 'metrics', label: t.modelMetrics, icon: Binary },
    { id: 'dataHub', label: t.dataHub, icon: Database },
  ];

  const scheduledLangs = INDIC_LANGUAGES.filter(l => l.category === 'Scheduled');
  const regionalLangs = INDIC_LANGUAGES.filter(l => l.category === 'Regional & Tribal');

  return (
    <header className="glass-header sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3.5">
            <div className="relative group cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-2xl blur-xs opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <Activity className="h-5 w-5 stroke-[2.5]" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-sky-600 via-indigo-600 to-violet-700 bg-clip-text text-transparent">
                  StudyPulse
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200/80 shadow-2xs">
                  AI Early-Warning
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block tracking-tight">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Quick Demo Role Switcher & Controls */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Demo Quick Role Switcher */}
            <div className="hidden md:flex items-center bg-slate-100/80 backdrop-blur-xs p-1 rounded-xl border border-slate-200/80 text-xs font-medium shadow-2xs">
              <span className="text-slate-500 px-2 flex items-center font-medium">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-500 fill-amber-400" />
                Persona:
              </span>
              <button
                onClick={() => onSwitchRole('admin')}
                className={`px-3 py-1 rounded-lg transition-all text-xs ${
                  user?.role === 'admin'
                    ? 'bg-white text-indigo-700 shadow-xs font-bold border border-indigo-100'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => onSwitchRole('teacher')}
                className={`px-3 py-1 rounded-lg transition-all text-xs ${
                  user?.role === 'teacher'
                    ? 'bg-white text-sky-700 shadow-xs font-bold border border-sky-100'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Teacher
              </button>
              <button
                onClick={() => onSwitchRole('parent')}
                className={`px-3 py-1 rounded-lg transition-all text-xs ${
                  user?.role === 'parent'
                    ? 'bg-white text-emerald-700 shadow-xs font-bold border border-emerald-100'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Parent
              </button>
            </div>

            {/* Comprehensive Indian Languages Selector */}
            <div className="flex items-center space-x-1.5 bg-white/95 border border-slate-200/90 shadow-2xs rounded-xl px-2.5 py-1 text-xs">
              <Languages className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer max-w-[160px] truncate"
                title="Select Indian Language"
              >
                <option value="en">English (Indian Context)</option>
                <optgroup label="22 Scheduled Languages of India">
                  {scheduledLangs.map(l => (
                    <option key={l.code} value={l.code}>
                      {l.nativeName} ({l.name})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Regional, Tribal & Dialects">
                  {regionalLangs.map(l => (
                    <option key={l.code} value={l.code}>
                      {l.nativeName} ({l.name})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* User identity & Logout */}
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-800">{user?.user_name || user?.full_name}</div>
                <div className="text-[10px] text-slate-500 capitalize font-medium flex items-center justify-end">
                  <span className={`w-1.5 h-1.5 rounded-full mr-1 ${
                    user?.role === 'admin' ? 'bg-indigo-500 ring-2 ring-indigo-200' :
                    user?.role === 'teacher' ? 'bg-sky-500 ring-2 ring-sky-200' : 'bg-emerald-500 ring-2 ring-emerald-200'
                  }`} />
                  {user?.role}
                </div>
              </div>
              <button
                onClick={onLogout}
                title="Logout"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        {user?.role !== 'parent' && (
          <nav className="flex space-x-1.5 overflow-x-auto border-t border-slate-100/90 py-2.5 scrollbar-none text-xs sm:text-sm font-medium">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl whitespace-nowrap text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-sm shadow-sky-600/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
