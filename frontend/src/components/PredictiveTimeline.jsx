import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, 
  Calendar, Clock, ShieldAlert, Sparkles, User, ArrowRight 
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, ReferenceLine, Legend, Area, AreaChart 
} from 'recharts';
import { api } from '../api';

export default function PredictiveTimeline({ riskList, onSelectStudent, t }) {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [timelineData, setTimelineData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Set default to first high risk student or first student
  useEffect(() => {
    if (riskList && riskList.length > 0 && !selectedStudentId) {
      const highStudent = riskList.find(s => s.risk_tier === 'High') || riskList[0];
      setSelectedStudentId(highStudent.student_id);
    }
  }, [riskList]);

  useEffect(() => {
    if (!selectedStudentId) return;
    setLoading(true);
    api.getStudentTimeline(selectedStudentId)
      .then(res => {
        setTimelineData(res);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedStudentId]);

  const selectedStudent = riskList.find(s => s.student_id === selectedStudentId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Predictive Dropout Timeline Forecast</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Estimates 4-week future risk trajectory: Status Quo (Unaddressed) vs. With Targeted Intervention
          </p>
        </div>

        {/* Student Selector */}
        <div className="flex items-center space-x-2 shrink-0">
          <label className="text-xs font-bold text-slate-600">Select Student:</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {riskList.map(s => (
              <option key={s.student_id} value={s.student_id}>
                {s.student_name} ({s.student_id} - Gr {s.grade}{s.section} - {s.risk_tier} Risk)
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-400">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent mb-3" />
          <p className="text-sm font-medium">Computing time-series decay and projected recovery slopes...</p>
        </div>
      ) : timelineData ? (
        <div className="space-y-6">
          {/* Summary Alert Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Risk Baseline</span>
              <div className="text-3xl font-black text-slate-900 mt-2">
                {timelineData.current_probability}%
              </div>
              <p className="text-xs text-slate-400 mt-1">Based on 4-week rolling indicators</p>
            </div>

            <div className={`p-5 rounded-2xl border shadow-xs ${
              timelineData.estimated_critical_point.includes('Week') 
                ? 'bg-rose-50/60 border-rose-200 text-rose-900' 
                : 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
            }`}>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                <span>Critical Dropout Point</span>
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-3xl font-black mt-2">
                {timelineData.estimated_critical_point}
              </div>
              <p className="text-xs opacity-80 mt-1">
                Estimated point of failure if unaddressed
              </p>
            </div>

            <div className="bg-indigo-50/60 border border-indigo-200 p-5 rounded-2xl text-indigo-950 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-indigo-700">
                <span>Targeted Intervention Impact</span>
                <Sparkles className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-3xl font-black text-indigo-900 mt-2">
                {timelineData.timeline_forecast[timelineData.timeline_forecast.length - 1]?.projected_risk_with_intervention}%
              </div>
              <p className="text-xs text-indigo-700 mt-1">
                Projected 4-week recovery with support plan
              </p>
            </div>
          </div>

          {/* Forecast Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">4-Week Forward Trajectory Simulation</h3>
                <p className="text-xs text-slate-500">
                  Comparison between natural trajectory decay vs structured intervention recovery
                </p>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                75% Critical Threshold
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData.timeline_forecast}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="week_label" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(val) => [`${val}%`, '']} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <ReferenceLine 
                    y={75} 
                    stroke="#ef4444" 
                    strokeDasharray="4 4" 
                    label={{ value: '75% High Risk Gate', fill: '#ef4444', fontSize: 11 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="projected_risk_unaddressed" 
                    name="Status Quo (No Intervention)" 
                    stroke="#ef4444" 
                    strokeWidth={3} 
                    dot={{ r: 5 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="projected_risk_with_intervention" 
                    name="With Targeted Support Plan" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    dot={{ r: 5 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Action Milestones Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {timelineData.timeline_forecast.map((step, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">{step.week_label}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    step.status_quo_tier === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {step.status_quo_tier}
                  </span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Unaddressed:</span>
                    <strong className="text-rose-600 font-bold">{step.projected_risk_unaddressed}%</strong>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>With Support:</span>
                    <strong className="text-emerald-600 font-bold">{step.projected_risk_with_intervention}%</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
