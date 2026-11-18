import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Building2, AlertOctagon, TrendingDown, Users, 
  ShieldAlert, CheckCircle2, ChevronRight, Activity 
} from 'lucide-react';
import { api } from '../api';

const RISK_COLORS = {
  High: '#ef4444',
  Medium: '#f59e0b',
  Low: '#10b981'
};

export default function SchoolAnalytics({ onSelectStudent, t }) {
  const [analytics, setAnalytics] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getSchoolAnalytics(),
      api.getAnomalies()
    ]).then(([ana, anom]) => {
      setAnalytics(ana);
      setAnomalies(anom);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-sky-500 border-t-transparent mb-3" />
        <p className="text-sm font-medium">Aggregating school-wide risk distributions & anomaly patterns...</p>
      </div>
    );
  }

  const pieData = analytics ? [
    { name: 'High Risk', value: analytics.kpis.high_risk_count, color: '#ef4444' },
    { name: 'Medium Risk', value: analytics.kpis.medium_risk_count, color: '#f59e0b' },
    { name: 'Low Risk', value: analytics.kpis.low_risk_count, color: '#10b981' }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">School Enrolment</div>
          <div className="text-3xl font-black text-slate-900 mt-2">{analytics?.kpis?.total_students}</div>
          <p className="text-xs text-slate-400 mt-1">Grades 9 through 12</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-rose-600">High Risk Population</div>
          <div className="text-3xl font-black text-rose-700 mt-2">{analytics?.kpis?.high_risk_count}</div>
          <p className="text-xs text-rose-600/80 mt-1">Prioritized for early intervention</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Interventions</div>
          <div className="text-3xl font-black text-indigo-700 mt-2">{analytics?.kpis?.interventions_active}</div>
          <p className="text-xs text-slate-400 mt-1">{analytics?.kpis?.interventions_completed} Completed</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-600">Attendance Anomalies</div>
          <div className="text-3xl font-black text-amber-700 mt-2">{anomalies.length}</div>
          <p className="text-xs text-amber-600 mt-1">&gt; 20% sudden drop flagged</p>
        </div>
      </div>

      {/* Grade and Section Risk Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Risk Distribution Across Grades</h3>
              <p className="text-xs text-slate-500">Dropout risk profiles compared across class levels</p>
            </div>
            <span className="p-1.5 bg-slate-100 rounded-lg text-slate-500 text-xs font-semibold">Stacked View</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.grade_distribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="grade" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="High" fill="#ef4444" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Medium" fill="#f59e0b" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Low" fill="#10b981" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Risk Breakdown by Section</h3>
              <p className="text-xs text-slate-500">Pinpoints specific sections requiring additional teacher aides</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.section_distribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="section" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="High" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Medium" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Low" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Attendance Anomaly Feed (Spec Feature #5) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertOctagon className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900">
              Attendance Anomaly Detection Feed (Sudden Drops &gt; 20%)
            </h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full">
            {anomalies.length} Flagged
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Identifies students whose weekly attendance suffered an acute crash compared to the preceding week, triggering immediate early counselor outreach:
        </p>

        {anomalies.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl">
            No acute attendance anomalies detected in the current week.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {anomalies.map((anom) => (
              <div 
                key={anom.student_id}
                onClick={() => onSelectStudent(anom.student_id)}
                className="p-4 bg-amber-50/40 border border-amber-200 rounded-xl hover:bg-amber-50 transition-colors cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-amber-700 transition-colors">
                        {anom.student_name}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono">{anom.student_id} • Gr {anom.grade}-{anom.section}</p>
                    </div>
                    <span className="text-xs font-extrabold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full flex items-center">
                      <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                      -{anom.drop_percentage}%
                    </span>
                  </div>
                  <div className="mt-3 text-xs text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Previous Week:</span>
                      <strong className="text-slate-800">{anom.previous_week_attendance}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Current Week:</span>
                      <strong className="text-rose-600">{anom.current_week_attendance}%</strong>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-amber-200/60 flex items-center justify-between text-xs font-semibold text-amber-700">
                  <span>Investigate Profile</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
