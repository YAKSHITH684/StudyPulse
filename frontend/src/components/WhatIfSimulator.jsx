import React, { useState } from 'react';
import { Sliders, Sparkles, TrendingDown, ArrowRight, RotateCcw, CheckCircle } from 'lucide-react';
import { api } from '../api';

export default function WhatIfSimulator({ studentId, initialRiskProbability = 0.75 }) {
  const [adjustments, setAdjustments] = useState({
    attendance_delta: 15,
    marks_delta: 10,
    late_submission_delta: -25,
    behavior_incident_delta: -2,
    engagement_login_delta: 2,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const res = await api.runWhatIf(studentId, adjustments);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAdjustments({
      attendance_delta: 0,
      marks_delta: 0,
      late_submission_delta: 0,
      behavior_incident_delta: 0,
      engagement_login_delta: 0,
    });
    setResult(null);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50/40 via-white to-slate-50 rounded-2xl border border-indigo-100 p-6 space-y-6">
      <div>
        <div className="flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900">Interactive What-If Impact Simulator</h3>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Adjust proposed support outcomes to simulate how targeted improvements immediately lower this student's XGBoost dropout probability:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sliders Column */}
        <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          {/* Attendance Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>Improve Attendance</span>
              <span className="text-indigo-600 font-bold">+{adjustments.attendance_delta}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="35"
              step="5"
              value={adjustments.attendance_delta}
              onChange={(e) => setAdjustments({ ...adjustments, attendance_delta: parseFloat(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>+0%</span>
              <span>+15% (Typical target)</span>
              <span>+35%</span>
            </div>
          </div>

          {/* Marks Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>Remedial Tutoring Marks Boost</span>
              <span className="text-indigo-600 font-bold">+{adjustments.marks_delta} marks</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="5"
              value={adjustments.marks_delta}
              onChange={(e) => setAdjustments({ ...adjustments, marks_delta: parseFloat(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>+0</span>
              <span>+15 (One grade level)</span>
              <span>+30</span>
            </div>
          </div>

          {/* Late Homework Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>Reduce Late Submissions</span>
              <span className="text-indigo-600 font-bold">{adjustments.late_submission_delta}%</span>
            </div>
            <input
              type="range"
              min="-50"
              max="0"
              step="5"
              value={adjustments.late_submission_delta}
              onChange={(e) => setAdjustments({ ...adjustments, late_submission_delta: parseFloat(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>-50%</span>
              <span>-25%</span>
              <span>0%</span>
            </div>
          </div>

          {/* Behavioral Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>Reduce Disciplinary Incidents</span>
              <span className="text-indigo-600 font-bold">{adjustments.behavior_incident_delta} incidents</span>
            </div>
            <input
              type="range"
              min="-5"
              max="0"
              step="1"
              value={adjustments.behavior_incident_delta}
              onChange={(e) => setAdjustments({ ...adjustments, behavior_incident_delta: parseFloat(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>-5</span>
              <span>-2</span>
              <span>0</span>
            </div>
          </div>

          <div className="pt-2 flex space-x-2">
            <button
              onClick={handleSimulate}
              disabled={loading}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Simulating...' : 'Compute Simulated Risk'}</span>
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
              Simulation Projection
            </h4>

            {result ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-center">
                  {/* Baseline */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-500 block">Baseline Risk</span>
                    <div className="text-2xl font-black text-slate-800 mt-1">
                      {Math.round(result.baseline_probability * 100)}%
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                      result.baseline_risk_tier === 'High' ? 'bg-rose-100 text-rose-800' :
                      result.baseline_risk_tier === 'Medium' ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {result.baseline_risk_tier} Risk
                    </span>
                  </div>

                  {/* Simulated */}
                  <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-200">
                    <span className="text-[11px] font-semibold text-indigo-700 block">Simulated Risk</span>
                    <div className="text-2xl font-black text-indigo-900 mt-1">
                      {Math.round(result.simulated_probability * 100)}%
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                      result.simulated_risk_tier === 'High' ? 'bg-rose-100 text-rose-800' :
                      result.simulated_risk_tier === 'Medium' ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {result.simulated_risk_tier} Risk
                    </span>
                  </div>
                </div>

                {/* Delta Reduction Badge */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center space-x-1.5 text-emerald-700 font-extrabold text-lg">
                    <TrendingDown className="w-5 h-5 text-emerald-600" />
                    <span>{result.risk_reduction_percentage}% Dropout Risk Reduction</span>
                  </div>
                  <p className="text-xs text-emerald-800 mt-1 font-medium">
                    {result.simulated_risk_tier !== result.baseline_risk_tier 
                      ? `Successfully lowered from ${result.baseline_risk_tier} Risk to ${result.simulated_risk_tier} Risk!`
                      : `Risk score probability reduced by ${Math.abs(Math.round(result.risk_delta * 100))} percentage points.`
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <Sliders className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">No simulation active</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Click "Compute Simulated Risk" to test the scenario.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 italic">
            *Simulations use the live calibrated XGBoost model artifacts to recompute probability.
          </div>
        </div>
      </div>
    </div>
  );
}
