import React, { useState } from 'react';
import { 
  AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown, 
  Minus, Search, Filter, ShieldAlert, Sparkles, ChevronRight,
  Info, Eye, PlusCircle
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

  return (
    <div className="space-y-6">
      {/* Role Banner if Teacher */}
      {user?.role === 'teacher' && (
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 flex items-center justify-between text-xs sm:text-sm text-sky-800">
          <div className="flex items-center space-x-2">
            <span className="p-1 bg-sky-200 text-sky-800 rounded-md font-bold">Class Lead</span>
            <span>Filtering exclusively to your assigned sections: <strong>Grade {user.assigned_grades} • Sections {user.assigned_sections}</strong></span>
          </div>
          <span className="text-sky-600 font-medium hidden sm:inline">Role-Based Access Active</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>{t.totalStudents}</span>
            <span className="p-2 bg-slate-100 rounded-xl text-slate-600">👥</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-slate-900">{riskList.length}</div>
            <span className="text-xs font-medium text-slate-500">Live Scored</span>
          </div>
        </div>

        {/* High Risk (Urgent Action) */}
        <div className="bg-gradient-to-br from-rose-50 to-white border border-rose-200 rounded-2xl p-5 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between text-rose-700 text-xs font-semibold uppercase tracking-wider">
            <span>{t.highRisk}</span>
            <span className="p-2 bg-rose-100 rounded-xl text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-rose-700">{highRiskCount}</div>
            <span className="text-xs font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">
              {riskList.length ? Math.round((highRiskCount / riskList.length) * 100) : 0}% of cohort
            </span>
          </div>
        </div>

        {/* Watchlist (Medium Risk) */}
        <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-200 rounded-2xl p-5 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between text-amber-700 text-xs font-semibold uppercase tracking-wider">
            <span>{t.mediumRisk}</span>
            <span className="p-2 bg-amber-100 rounded-xl text-amber-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-amber-700">{mediumRiskCount}</div>
            <span className="text-xs font-medium text-amber-600">Early Watch</span>
          </div>
        </div>

        {/* On Track (Low Risk) */}
        <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 rounded-2xl p-5 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold uppercase tracking-wider">
            <span>{t.lowRisk}</span>
            <span className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
              <CheckCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-emerald-700">{lowRiskCount}</div>
            <span className="text-xs font-medium text-emerald-600">Stable Progress</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Risk Level */}
          <select
            value={filters.risk_level}
            onChange={(e) => setFilters({ ...filters, risk_level: e.target.value })}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          >
            <option value="">{t.filterRisk}</option>
            <option value="High">High Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="Low">Low Risk</option>
          </select>

          {/* Grade */}
          <select
            value={filters.grade}
            onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
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
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          >
            <option value="">{t.filterSection}</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>
      </div>

      {/* Ranked Students Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Ranked Student Risk Cohort</h2>
            <p className="text-xs text-slate-500">Ordered by XGBoost dropout risk probability (highest priority first)</p>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing {riskList.length} students
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-sky-500 border-t-transparent mb-3" />
            <p className="text-sm font-medium">Computing XGBoost predictions & SHAP explanations...</p>
          </div>
        ) : riskList.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="text-base font-semibold">No students match current filters.</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting the search or filter options.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
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

                  return (
                    <tr 
                      key={stu.student_id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => onSelectStudent(stu.student_id)}
                    >
                      {/* Rank */}
                      <td className="py-3.5 px-4 text-center font-bold text-slate-400 text-xs">
                        {idx + 1}
                      </td>

                      {/* Student info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                            {stu.student_name}
                          </div>
                          {stu.has_low_confidence && (
                            <span 
                              title="Low data confidence: Student has fewer than 3 weeks of recorded data"
                              className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200"
                            >
                              Low Conf
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">
                          {stu.student_id}
                        </div>
                      </td>

                      {/* Grade & Section */}
                      <td className="py-3.5 px-4 font-medium text-slate-600">
                        Gr {stu.grade} - {stu.section}
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
                            <span className="text-[10px] text-slate-400">p = {stu.risk_probability}</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                stu.risk_tier === 'High' ? 'bg-rose-500' :
                                stu.risk_tier === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${probPct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Risk Tier Badge */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          stu.risk_tier === 'High' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                          stu.risk_tier === 'Medium' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            stu.risk_tier === 'High' ? 'bg-rose-600' :
                            stu.risk_tier === 'Medium' ? 'bg-amber-600' : 'bg-emerald-600'
                          }`} />
                          {stu.risk_tier} Risk
                        </span>
                      </td>

                      {/* Risk Trend */}
                      <td className="py-3.5 px-4 text-xs font-medium">
                        {stu.risk_trend === 'Increasing' && (
                          <span className="flex items-center text-rose-600">
                            <TrendingUp className="w-4 h-4 mr-1 text-rose-500" />
                            Rising
                          </span>
                        )}
                        {stu.risk_trend === 'Decreasing' && (
                          <span className="flex items-center text-emerald-600">
                            <TrendingDown className="w-4 h-4 mr-1 text-emerald-500" />
                            Improving
                          </span>
                        )}
                        {stu.risk_trend === 'Stable' && (
                          <span className="flex items-center text-slate-500">
                            <Minus className="w-4 h-4 mr-1 text-slate-400" />
                            Stable
                          </span>
                        )}
                      </td>

                      {/* Top SHAP Reason */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {topReason ? (
                          <div 
                            title={topReason.explanation}
                            className="text-xs text-slate-700 truncate bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 font-medium"
                          >
                            <span className="text-slate-400 font-semibold mr-1">#1</span>
                            {topReason.explanation}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Regular progress</span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => onSelectStudent(stu.student_id)}
                            className="px-2.5 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-50 rounded-lg border border-sky-200 transition-colors flex items-center"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            {t.viewProfile}
                          </button>
                          <button
                            onClick={() => onOpenIntervention(stu)}
                            className="px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-lg border border-emerald-200 transition-colors flex items-center"
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
