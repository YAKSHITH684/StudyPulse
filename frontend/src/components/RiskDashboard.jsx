import React from 'react';
import { 
  AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown, 
  Minus, Search, Filter, ShieldAlert, Sparkles, ChevronRight,
  Info, Eye, PlusCircle, X, User
} from 'lucide-react';

export default function RiskDashboard({ 
  riskList, 
  loading, 
  onSelectStudent, 
  onOpenIntervention, 
  filters, 
  setFilters, 
  user, 
  t 
}) {
  const highRiskCount = riskList.filter(s => s.risk_tier === 'High').length;
  const mediumRiskCount = riskList.filter(s => s.risk_tier === 'Medium').length;
  const lowRiskCount = riskList.filter(s => s.risk_tier === 'Low').length;

  const hasActiveFilters = filters.search || filters.risk_level || filters.grade || filters.section;

  const clearFilters = () => {
    setFilters({ search: '', risk_level: '', grade: '', section: '' });
  };

  return (
    <div className="space-y-6">
      {/* Role Banner if Teacher */}
      {user?.role === 'teacher' && (
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between text-xs sm:text-sm text-sky-900 border border-sky-200/80 shadow-xs">
          <div className="flex items-center space-x-2.5">
            <span className="px-2 py-0.5 bg-sky-600 text-white rounded-lg text-xs font-bold tracking-wide uppercase shadow-2xs">
              Class Lead
            </span>
            <span className="font-medium text-slate-700">
              Assigned Sections: <strong className="text-sky-900 font-bold">Grade {user.assigned_grades} • Sections {user.assigned_sections}</strong>
            </span>
          </div>
          <span className="text-[11px] font-semibold text-sky-700 bg-sky-100/80 px-2.5 py-1 rounded-full hidden sm:inline-block">
            Section-Restricted RBAC Active
          </span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <button
          type="button"
          onClick={() => setFilters({ ...filters, risk_level: '' })}
          className={`group relative text-left bg-white/90 backdrop-blur-xs border rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer ${
            filters.risk_level === '' ? 'border-sky-500 ring-2 ring-sky-500/20' : 'border-slate-200/90'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>{t.totalStudents}</span>
            <span className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:scale-110 transition-transform">
              <User className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-black text-slate-900 tracking-tight">{riskList.length}</div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
              Live Cohort
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-medium">Scored across 8-week indicators</div>
        </button>

        {/* High Risk (Urgent Action) */}
        <button
          type="button"
          onClick={() => setFilters({ ...filters, risk_level: filters.risk_level === 'High' ? '' : 'High' })}
          className={`group relative text-left bg-gradient-to-br from-rose-50/70 via-white to-white border rounded-2xl p-5 shadow-xs hover:shadow-md hover:shadow-rose-100 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer ${
            filters.risk_level === 'High' ? 'border-rose-500 ring-2 ring-rose-500/30' : 'border-rose-200/90'
          }`}
        >
          <div className="flex items-center justify-between text-rose-700 text-xs font-bold uppercase tracking-wider">
            <span>{t.highRisk}</span>
            <span className="h-8 w-8 rounded-xl bg-rose-100/80 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-black text-rose-600 tracking-tight">{highRiskCount}</div>
            <span className="text-xs font-bold text-rose-700 bg-rose-100/90 px-2.5 py-0.5 rounded-full border border-rose-200/60">
              {riskList.length ? Math.round((highRiskCount / riskList.length) * 100) : 0}% critical
            </span>
          </div>
          <div className="mt-2 text-[11px] text-rose-500 font-medium flex items-center">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mr-1.5 animate-ping"></span>
            Requires immediate pastoral outreach
          </div>
        </button>

        {/* Watchlist (Medium Risk) */}
        <button
          type="button"
          onClick={() => setFilters({ ...filters, risk_level: filters.risk_level === 'Medium' ? '' : 'Medium' })}
          className={`group relative text-left bg-gradient-to-br from-amber-50/70 via-white to-white border rounded-2xl p-5 shadow-xs hover:shadow-md hover:shadow-amber-100 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer ${
            filters.risk_level === 'Medium' ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-amber-200/90'
          }`}
        >
          <div className="flex items-center justify-between text-amber-700 text-xs font-bold uppercase tracking-wider">
            <span>{t.mediumRisk}</span>
            <span className="h-8 w-8 rounded-xl bg-amber-100/80 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-black text-amber-600 tracking-tight">{mediumRiskCount}</div>
            <span className="text-xs font-bold text-amber-700 bg-amber-100/90 px-2 py-0.5 rounded-full border border-amber-200/60">
              Watchlist
            </span>
          </div>
          <div className="mt-2 text-[11px] text-amber-600 font-medium">Preventive academic checks</div>
        </button>

        {/* On Track (Low Risk) */}
        <button
          type="button"
          onClick={() => setFilters({ ...filters, risk_level: filters.risk_level === 'Low' ? '' : 'Low' })}
          className={`group relative text-left bg-gradient-to-br from-emerald-50/70 via-white to-white border rounded-2xl p-5 shadow-xs hover:shadow-md hover:shadow-emerald-100 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer ${
            filters.risk_level === 'Low' ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-emerald-200/90'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <span>{t.lowRisk}</span>
            <span className="h-8 w-8 rounded-xl bg-emerald-100/80 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <CheckCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-black text-emerald-600 tracking-tight">{lowRiskCount}</div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-200/60">
              On Track
            </span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-medium">Progressing steadily</div>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/90 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
          />
          {filters.search && (
            <button
              onClick={() => setFilters({ ...filters, search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Risk Level */}
          <select
            value={filters.risk_level}
            onChange={(e) => setFilters({ ...filters, risk_level: e.target.value })}
            className="px-3.5 py-2.5 bg-slate-50/90 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer"
          >
            <option value="">{t.filterRisk}</option>
            <option value="High">🔴 High Risk</option>
            <option value="Medium">🟡 Medium Risk</option>
            <option value="Low">🟢 Low Risk</option>
          </select>

          {/* Grade */}
          <select
            value={filters.grade}
            onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
            className="px-3.5 py-2.5 bg-slate-50/90 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer"
          >
            <option value="">{t.filterGrade}</option>
            <option value="9">Grade 9</option>
            <option value="10">Grade 10</option>
            <option value="11">Grade 11</option>
            <option value="12">Grade 12</option>
          </select>

          {/* Section */}
          <select
            value={filters.section}
            onChange={(e) => setFilters({ ...filters, section: e.target.value })}
            className="px-3.5 py-2.5 bg-slate-50/90 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer"
          >
            <option value="">{t.filterSection}</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all flex items-center space-x-1"
              title="Reset all filters"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Ranked Students Table */}
      <div className="bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/60">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Ranked Student Risk Cohort</h2>
            <p className="text-xs text-slate-500 font-medium">Ranked by calibrated XGBoost risk probability (highest priority first)</p>
          </div>
          <span className="text-xs text-slate-500 font-bold bg-white px-3 py-1 rounded-lg border border-slate-200/80 shadow-2xs">
            {riskList.length} Students
          </span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-sky-500 border-t-transparent mb-3" />
            <p className="text-sm font-semibold">Running calibrated inference & SHAP attribution...</p>
          </div>
        ) : riskList.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <p className="text-base font-bold text-slate-700">No students match current filter criteria.</p>
            <p className="text-xs text-slate-400 mt-1">Try clearing filters or search query.</p>
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-700 transition-all shadow-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">{t.student}</th>
                  <th className="py-3 px-4">{t.gradeSection}</th>
                  <th className="py-3 px-4 w-44">{t.riskScore}</th>
                  <th className="py-3 px-4">{t.riskLevel}</th>
                  <th className="py-3 px-4">{t.trend}</th>
                  <th className="py-3 px-4">{t.primaryFactors}</th>
                  <th className="py-3 px-4 text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {riskList.map((stu, idx) => {
                  const probPct = Math.round(stu.risk_probability * 100);
                  const topReason = stu.top_factors && stu.top_factors[0];

                  const getInitials = (name) => {
                    if (!name) return 'S';
                    const parts = name.split(' ');
                    return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : name[0];
                  };

                  return (
                    <tr 
                      key={stu.student_id}
                      className="hover:bg-sky-50/40 transition-colors group cursor-pointer"
                      onClick={() => onSelectStudent(stu.student_id)}
                    >
                      {/* Rank */}
                      <td className="py-3.5 px-4 text-center font-bold text-slate-400 text-xs">
                        {idx + 1}
                      </td>

                      {/* Student info with avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className={`h-8 w-8 rounded-xl flex items-center justify-center text-xs font-extrabold text-white shrink-0 shadow-2xs ${
                            stu.risk_tier === 'High' ? 'bg-gradient-to-tr from-rose-500 to-rose-600' :
                            stu.risk_tier === 'Medium' ? 'bg-gradient-to-tr from-amber-500 to-amber-600' :
                            'bg-gradient-to-tr from-sky-500 to-indigo-600'
                          }`}>
                            {getInitials(stu.student_name)}
                          </div>
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-bold text-slate-900 group-hover:text-sky-600 transition-colors text-xs sm:text-sm">
                                {stu.student_name}
                              </span>
                              {stu.has_low_confidence && (
                                <span 
                                  title="Low data confidence: Student has fewer than 3 weeks of recorded data"
                                  className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200"
                                >
                                  Low Conf
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {stu.student_id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Grade & Section */}
                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">
                        <span className="px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200/60">
                          Gr {stu.grade}-{stu.section}
                        </span>
                      </td>

                      {/* Risk Score Progress Bar */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span className={
                              stu.risk_tier === 'High' ? 'text-rose-600' :
                              stu.risk_tier === 'Medium' ? 'text-amber-600' : 'text-emerald-600'
                            }>
                              {probPct}%
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">p={stu.risk_probability}</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                stu.risk_tier === 'High' ? 'bg-gradient-to-r from-rose-500 to-red-600' :
                                stu.risk_tier === 'Medium' ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-emerald-400 to-teal-500'
                              }`}
                              style={{ width: `${probPct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Risk Tier Badge */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold shadow-2xs ${
                          stu.risk_tier === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          stu.risk_tier === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          <span className={`relative flex h-2 w-2 mr-1.5`}>
                            {stu.risk_tier === 'High' && (
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            )}
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${
                              stu.risk_tier === 'High' ? 'bg-rose-600' :
                              stu.risk_tier === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}></span>
                          </span>
                          {stu.risk_tier} Risk
                        </span>
                      </td>

                      {/* Risk Trend */}
                      <td className="py-3.5 px-4 text-xs font-semibold">
                        {stu.risk_trend === 'Increasing' && (
                          <span className="inline-flex items-center text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100">
                            <TrendingUp className="w-3.5 h-3.5 mr-1 text-rose-500 stroke-[2.5]" />
                            Rising
                          </span>
                        )}
                        {stu.risk_trend === 'Decreasing' && (
                          <span className="inline-flex items-center text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                            <TrendingDown className="w-3.5 h-3.5 mr-1 text-emerald-500 stroke-[2.5]" />
                            Improving
                          </span>
                        )}
                        {stu.risk_trend === 'Stable' && (
                          <span className="inline-flex items-center text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                            <Minus className="w-3.5 h-3.5 mr-1 text-slate-400 stroke-[2.5]" />
                            Stable
                          </span>
                        )}
                      </td>

                      {/* Top SHAP Reason */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {topReason ? (
                          <div 
                            title={topReason.explanation}
                            className="text-xs text-slate-700 truncate bg-slate-50 hover:bg-white px-2.5 py-1.5 rounded-xl border border-slate-200/80 font-medium shadow-2xs transition-colors"
                          >
                            <span className="text-sky-600 font-bold mr-1">#1</span>
                            {topReason.explanation}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Regular progression</span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => onSelectStudent(stu.student_id)}
                            className="px-3 py-1.5 text-xs font-bold text-sky-700 bg-sky-50/80 hover:bg-sky-100/80 rounded-xl border border-sky-200/80 transition-all flex items-center shadow-2xs hover:shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            {t.viewProfile}
                          </button>
                          <button
                            onClick={() => onOpenIntervention(stu)}
                            className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100/80 rounded-xl border border-emerald-200/80 transition-all flex items-center shadow-2xs hover:shadow-xs"
                          >
                            <PlusCircle className="w-3.5 h-3.5 mr-1" />
                            {t.addIntervention}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
