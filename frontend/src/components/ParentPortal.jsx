import React, { useState, useEffect } from 'react';
import { 
  Heart, Calendar, BookOpen, MessageSquare, Phone, Mail, 
  Award, CheckCircle2, AlertCircle, Sparkles, User 
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { api } from '../api';

export default function ParentPortal({ user, t }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Parent's linked child is STU-1004 (Aryan Rao)
    const childId = user?.linked_student_id || 'STU-1004';
    api.getStudentDetail(childId)
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent mb-3" />
        <p className="text-sm font-medium">Connecting to your child's learning journey portal...</p>
      </div>
    );
  }

  const student = data?.student;
  const attendance = data?.attendance_history || [];
  const latestAtt = attendance[attendance.length - 1];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold">
            <Heart className="w-3.5 h-3.5 text-rose-300 fill-rose-300" />
            <span>Parent-School Partnership Portal</span>
          </div>
          <h2 className="text-2xl font-black">
            Namaste, {student?.parent_name || 'Guardian'}!
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
            Here is the transparent learning progress for <strong>{student?.name}</strong> (Grade {student?.grade} - Section {student?.section}).
            Our teachers and counselors are working with your family to nurture your child's success.
          </p>
        </div>
      </div>

      {/* Quick Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Attendance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Recent Attendance</span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">
            {latestAtt ? `${latestAtt.attendance_percentage}%` : '80%'}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {latestAtt?.days_present} of {latestAtt?.days_total} days present this week
          </p>
        </div>

        {/* Academic Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Subject Standing</span>
            <BookOpen className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">
            {data?.risk_score?.latest_marks_avg} / 100
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Average across current coursework
          </p>
        </div>

        {/* Active Support Plan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Support Plan</span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-indigo-700 mt-2">
            Active
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {data?.interventions?.length || 1} action plans underway
          </p>
        </div>
      </div>

      {/* Plain-Language Care Summary */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900">What the School Is Focusing On</h3>
        </div>
        <p className="text-xs text-slate-600">
          Our AI assistant analyzes student patterns to provide helpful, actionable steps for both teachers and parents:
        </p>

        <div className="space-y-3">
          {data?.risk_score?.top_factors?.map((factor, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start space-x-3">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-900">{factor.label}</h4>
                <p className="text-xs text-slate-700 mt-0.5">{factor.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Home Strategies */}
      <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-6 space-y-3">
        <h3 className="text-base font-bold text-emerald-950 flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Recommended Home Routines for Aryan</span>
        </h3>
        <ul className="text-xs text-emerald-900 space-y-2 list-disc list-inside">
          <li><strong>Morning Routine:</strong> Aim for arrival by 8:15 AM to ensure participation in morning assembly and first period mathematics.</li>
          <li><strong>Study Environment:</strong> Set aside 45 minutes of quiet time at home each evening for reviewing class notes and homework assignments.</li>
          <li><strong>Positive Encouragement:</strong> Celebrate small wins—Aryan’s attendance improved noticeably in week 7!</li>
        </ul>
      </div>

      {/* Direct Educator Contact */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-sm font-bold text-slate-900">Need to talk to Aryan's Class Teacher?</h4>
          <p className="text-xs text-slate-500">Ms. Ananya Sharma (Grade 10 Lead) is available for parent consultations.</p>
        </div>
        <div className="flex space-x-2">
          <a
            href="tel:+919876543210"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call School Office</span>
          </a>
          <a
            href="mailto:teacher@studypulse.edu"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Teacher</span>
          </a>
        </div>
      </div>
    </div>
  );
}
