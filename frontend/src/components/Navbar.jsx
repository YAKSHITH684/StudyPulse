import React from 'react';
import { 
  Activity, Shield, Users, UserCheck, Languages, LogOut, 
  Sparkles, GraduationCap 
} from 'lucide-react';

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
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-100">
              <Activity className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-sky-700 to-indigo-800 bg-clip-text text-transparent">
                  StudyPulse
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-100 text-sky-800 border border-sky-200">
                  Round 3 • Innovathon 2026
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Quick Demo Role Switcher & Controls */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Demo Quick Role Switcher */}
            <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium">
              <span className="text-slate-500 px-2 flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-500" />
                Demo Persona:
              </span>
              <button
                onClick={() => onSwitchRole('admin')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  user?.role === 'admin'
                    ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => onSwitchRole('teacher')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  user?.role === 'teacher'
                    ? 'bg-white text-sky-700 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Teacher
              </button>
              <button
                onClick={() => onSwitchRole('parent')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  user?.role === 'parent'
                    ? 'bg-white text-emerald-700 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Parent
              </button>
            </div>

            {/* Language Selector */}
            <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs">
              <Languages className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="te">తెలుగు (Telugu)</option>
              </select>
            </div>

            {/* User identity & Logout */}
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-slate-800">{user?.user_name || user?.full_name}</div>
                <div className="text-[11px] text-slate-500 capitalize flex items-center justify-end">
                  <span className={`w-1.5 h-1.5 rounded-full mr-1 ${
                    user?.role === 'admin' ? 'bg-indigo-500' :
                    user?.role === 'teacher' ? 'bg-sky-500' : 'bg-emerald-500'
                  }`} />
                  {user?.role}
                </div>
              </div>
              <button
                onClick={onLogout}
                title="Logout"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        {user?.role !== 'parent' && (
          <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto border-t border-slate-100 py-2 scrollbar-none text-xs sm:text-sm font-medium">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-sky-50 text-sky-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {t.dashboard}
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'analytics'
                  ? 'bg-sky-50 text-sky-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {t.schoolAnalytics}
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'metrics'
                  ? 'bg-sky-50 text-sky-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {t.modelMetrics}
            </button>
            <button
              onClick={() => setActiveTab('dataHub')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'dataHub'
                  ? 'bg-sky-50 text-sky-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {t.dataHub}
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
