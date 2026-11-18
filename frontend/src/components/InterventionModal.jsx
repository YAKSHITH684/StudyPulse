import React, { useState } from 'react';
import { X, Award, CheckCircle, PlusCircle } from 'lucide-react';
import { api } from '../api';

export default function InterventionModal({ student, onClose, onSuccess, user }) {
  const [formData, setFormData] = useState({
    student_id: student.student_id,
    action_type: student.defaultAction || 'Remedial Subject Coaching',
    category: student.defaultCategory || 'Academic',
    urgency: student.defaultUrgency || 'High',
    description: student.defaultDescription || 'Weekly targeted support session to improve foundation concepts.',
    assigned_to: user?.user_name || 'Ms. Ananya Sharma',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.createIntervention(formData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to record intervention');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex justify-between items-center">
          <div className="flex items-center space-x-2.5">
            <span className="p-2 bg-white/10 rounded-xl">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-lg">Log Personalized Intervention</h3>
              <p className="text-xs text-emerald-200 font-medium">
                Targeting: {student.name || student.student_name} ({student.student_id})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-white/80 hover:text-white rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Action Type */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Intervention Action</label>
            <input
              type="text"
              required
              value={formData.action_type}
              onChange={(e) => setFormData({ ...formData, action_type: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              placeholder="e.g. Attendance Contract & Counselor Check-in"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Category */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="Academic">Academic</option>
                <option value="Attendance">Attendance</option>
                <option value="Behavioral">Behavioral</option>
                <option value="Engagement">Engagement</option>
              </select>
            </div>

            {/* Urgency */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Urgency</label>
              <select
                value={formData.urgency}
                onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="High">High Urgency</option>
                <option value="Medium">Medium Urgency</option>
                <option value="Low">Low Urgency</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Plan Description & Objectives</label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              placeholder="Outline specific milestones, check-in schedule, and expected outcomes..."
            />
          </div>

          {/* Assigned To */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Assigned Educator / Lead</label>
            <input
              type="text"
              required
              value={formData.assigned_to}
              onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="pt-3 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-sm flex items-center justify-center space-x-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{submitting ? 'Recording...' : 'Save Intervention'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
