import React, { useState, useEffect } from 'react';
import { 
  X, AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown, 
  Sparkles, Sliders, Calendar, BookOpen, User, Phone, Mail,
  PlusCircle, Activity, Award, ShieldAlert, Check
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, ReferenceLine, BarChart, Bar, Legend 
} from 'recharts';
import WhatIfSimulator from './WhatIfSimulator';
import { api } from '../api';

export default function StudentDetailModal({ 
  studentId, 
  onClose, 
  onOpenIntervention,
  t 
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('insights'); // 'insights', 'simulator', 'interventions'
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    Promise.all([
      api.getStudentDetail(studentId),
      api.getSuggestions(studentId)
    ]).then(([detail, suggs]) => {
      setData(detail);
      setSuggestions(suggs);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [studentId]);

  if (!studentId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl my-auto overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <span className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                <User className="w-5 h-5 text-sky-400" />
              </span>
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">{data?.student?.name || 'Loading Student...'}</h2>
                <div className="flex items-center space-x-3 text-xs text-slate-300 font-medium">
                  <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-sky-300">{data?.student?.student_id}</span>
                  <span>•</span>
                  <span>Grade {data?.student?.grade} - Section {data?.student?.section}</span>
                  <span>•</span>
                  <span>Gender: {data?.student?.gender || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Parent Info */}
            {data?.student?.parent_name && (
              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-300">
                <span className="text-slate-400">Parent/Guardian:</span>
                <span className="font-semibold text-white">{data.student.parent_name}</span>
                {data.student.parent_phone && (
                  <span className="flex items-center text-sky-300">
                    <Phone className="w-3 h-3 mr-1" />
                    {data.student.parent_phone}
                  </span>
                )}
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Nav Tabs */}
        <div className="px-6 border-b border-slate-200 bg-slate-50 flex space-x-4 text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab('insights')}
            className={`py-3.5 border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'insights'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-sky-600" />
            <span>AI Risk & Performance Insights</span>
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`py-3.5 border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'simulator'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4 text-indigo-600" />
            <span>What-If Simulator</span>
          </button>
          <button
            onClick={() => setActiveTab('interventions')}
            className={`py-3.5 border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'interventions'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Interventions & Action Plan ({data?.interventions?.length || 0})</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            <div className="py-20 text-center text-slate-400">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-sky-500 border-t-transparent mb-3" />
              <p className="text-sm font-medium">Loading comprehensive student profile...</p>
            </div>
          ) : (
            <>
              {activeTab === 'insights' && (
                <div className="space-y-6">
                  {/* Top Stats Banner */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Risk Score */}
                    <div className={`p-4 rounded-2xl border ${
                      data.risk_score?.risk_tier === 'High' ? 'bg-rose-50/70 border-rose-200' :
                      data.risk_score?.risk_tier === 'Medium' ? 'bg-amber-50/70 border-amber-200' :
                      'bg-emerald-50/70 border-emerald-200'
                    }`}>
                      <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <span>Current Risk Score</span>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          data.risk_score?.risk_tier === 'High' ? 'bg-rose-100 text-rose-800' :
                          data.risk_score?.risk_tier === 'Medium' ? 'bg-amber-100 text-amber-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {data.risk_score?.risk_tier} Risk
                        </span>
                      </div>
                      <div className="mt-2 text-3xl font-black text-slate-900">
                        {Math.round(data.risk_score?.risk_probability * 100)}%
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Trend: <strong className="text-slate-700">{data.risk_score?.risk_trend}</strong>
                      </p>
                    </div>

                    {/* Attendance Metric */}
                    <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Latest Attendance
                      </div>
                      <div className="mt-2 text-3xl font-black text-slate-900">
                        {data.risk_score?.latest_attendance_pct}%
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Minimum requirement: 75%
                      </p>
                    </div>

                    {/* Academic Metric */}
                    <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Core Subjects Average
                      </div>
                      <div className="mt-2 text-3xl font-black text-slate-900">
                        {data.risk_score?.latest_marks_avg} / 100
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Across last 4 assessments
                      </p>
                    </div>
                  </div>

                  {/* EXPLAINABLE AI (SHAP) SECTION - EXACTLY 3 REASONS */}
                  <div className="bg-gradient-to-br from-indigo-50/50 via-sky-50/30 to-white rounded-2xl p-5 border border-indigo-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-base font-bold text-slate-900">
                          Explainable AI (SHAP) Attribution — Top 3 Drivers
                        </h3>
                      </div>
                      <span className="text-xs font-semibold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-full">
                        TreeExplainer Verified
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mb-4">
                      Every prediction returns exactly three understandable contributing reasons explaining why this student was classified at this risk level:
                    </p>

                    <div className="space-y-3">
                      {data.risk_score?.top_factors?.map((reason, idx) => (
                        <div 
                          key={idx}
                          className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-start space-x-3 flex-1">
                            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                              #{reason.rank}
                            </span>
                            <div className="space-y-1">
                              <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                                <span>{reason.label}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                  reason.impact_direction === 'risk_driver' 
                                    ? 'bg-rose-100 text-rose-700' 
                                    : 'bg-emerald-100 text-emerald-700'
                                }`}>
                                  {reason.impact_direction === 'risk_driver' ? 'Risk Driver' : 'Protective Factor'}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-slate-700 leading-snug">
                                {reason.explanation}
                              </p>
                            </div>
                          </div>

                          {/* Visual Weight Bar */}
                          <div className="sm:w-36 shrink-0 text-right">
                            <div className="flex justify-between sm:justify-end gap-2 text-xs font-semibold text-slate-500 mb-1">
                              <span>Impact:</span>
                              <span className="text-indigo-700 font-bold">{reason.weight_percentage}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-indigo-600 rounded-full" 
                                style={{ width: `${reason.weight_percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Historical Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Attendance Trend Chart */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                      <h4 className="text-sm font-bold text-slate-800 mb-1 flex items-center">
                        <Calendar className="w-4 h-4 mr-1.5 text-sky-600" />
                        8-Week Attendance Trend (%)
                      </h4>
                      <p className="text-xs text-slate-500 mb-4">Red dashed line shows minimum safe threshold (75%)</p>
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={data.attendance_history}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="week_number" tickFormatter={(w) => `W${w}`} tick={{ fontSize: 11 }} />
                            <YAxis domain={[30, 100]} tick={{ fontSize: 11 }} />
                            <Tooltip formatter={(val) => [`${val}%`, 'Attendance']} />
                            <ReferenceLine y={75} stroke="#ef4444" strokeDasharray="4 4" label={{ value: '75% Min', fill: '#ef4444', fontSize: 10 }} />
                            <Line type="monotone" dataKey="attendance_percentage" stroke="#0284c7" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Academic Performance vs Section Average */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                      <h4 className="text-sm font-bold text-slate-800 mb-1 flex items-center">
                        <BookOpen className="w-4 h-4 mr-1.5 text-indigo-600" />
                        Subject Marks vs Class Average
                      </h4>
                      <p className="text-xs text-slate-500 mb-4">Latest assessments across core curriculum</p>
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={data.marks_history.slice(-4)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="subject" tick={{ fontSize: 10 }} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            <Bar dataKey="score" name="Student Score" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="class_average" name="Class Average" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'simulator' && (
                <WhatIfSimulator 
                  studentId={studentId} 
                  initialRiskProbability={data.risk_score?.risk_probability || 0.5} 
                />
              )}

              {activeTab === 'interventions' && (
                <div className="space-y-6">
                  {/* Recommended Interventions from SHAP */}
                  <div className="bg-sky-50/60 border border-sky-200 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-5 h-5 text-sky-600" />
                        <h4 className="text-sm font-bold text-slate-900">Recommended Targeted Interventions</h4>
                      </div>
                      <span className="text-xs text-sky-700 font-semibold bg-sky-100 px-2.5 py-0.5 rounded-full">
                        Derived from top risk drivers
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {suggestions.map((sugg, i) => (
                        <div key={i} className="bg-white p-3.5 rounded-xl border border-sky-100 shadow-xs flex flex-col justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900">{sugg.action_type}</span>
                              <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                                {sugg.urgency} Urgency
                              </span>
                            </div>
                            <p className="text-xs text-slate-600">{sugg.description}</p>
                            <p className="text-[11px] text-sky-700 italic pt-1">{sugg.relevance_explanation}</p>
                          </div>
                          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="text-slate-400">Owner: {sugg.recommended_owner}</span>
                            <button
                              onClick={() => onOpenIntervention({
                                ...data.student,
                                defaultAction: sugg.action_type,
                                defaultCategory: sugg.category,
                                defaultUrgency: sugg.urgency,
                                defaultDescription: sugg.description
                              })}
                              className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold transition-colors flex items-center"
                            >
                              <PlusCircle className="w-3.5 h-3.5 mr-1" />
                              Apply Action
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Active / Logged Interventions */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">Intervention History & Outcome Tracking</h4>
                      <button
                        onClick={() => onOpenIntervention(data.student)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center"
                      >
                        <PlusCircle className="w-4 h-4 mr-1.5" />
                        Log New Intervention
                      </button>
                    </div>

                    {data.interventions?.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                        <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-semibold">No interventions recorded yet.</p>
                        <p className="text-xs text-slate-400 mt-1">Select one of the AI-recommended actions above to begin support.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {data.interventions.map((inv) => (
                          <div key={inv.id} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 text-sm">{inv.action_type}</span>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                inv.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                                inv.status === 'In Progress' ? 'bg-sky-100 text-sky-800' :
                                'bg-slate-100 text-slate-800'
                              }`}>
                                {inv.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600">{inv.description}</p>
                            {inv.outcome_notes && (
                              <div className="bg-slate-50 p-2.5 rounded-xl text-xs text-slate-700 border border-slate-100">
                                <strong>Outcome Notes:</strong> {inv.outcome_notes}
                              </div>
                            )}
                            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                              <span>Assigned to: {inv.assigned_to}</span>
                              <span>Outcome: <strong className="text-slate-700">{inv.outcome}</strong></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
