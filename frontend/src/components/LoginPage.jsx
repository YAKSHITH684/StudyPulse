import React, { useState } from 'react';
import { 
  Activity, Shield, Lock, Mail, Eye, EyeOff, Sparkles, 
  ArrowRight, Users, GraduationCap, Heart, CheckCircle2 
} from 'lucide-react';
import { api } from '../api';

export default function LoginPage({ onLoginSuccess, t }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.login(email, password);
      onLoginSuccess(data);
    } catch (err) {
      setError(err.message || "Invalid credentials");
      setLoading(false);
    }
  };

  const handleQuickLogin = async (personaEmail, personaPassword) => {
    setEmail(personaEmail);
    setPassword(personaPassword);
    setLoading(true);
    setError(null);
    try {
      const data = await api.login(personaEmail, personaPassword);
      onLoginSuccess(data);
    } catch (err) {
      setError(err.message || "Quick login failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/30 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
          
          {/* Left Brand Showcase Column (5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Subtle overlay illustration */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/20 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 space-y-6">
              {/* Event Badge */}
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-sky-300 border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>PRASUNEX INNOVATHON 2026 – Round 3</span>
              </div>

              {/* Logo & Headline */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
                    <Activity className="h-7 w-7 stroke-[2.5]" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">StudyPulse</h1>
                    <p className="text-xs text-slate-400 font-medium">Team Lead: Anandapu Yakshith</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-sky-200 italic">
                  "Detect Early. Explain Clearly. Act in Time."
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-3 text-xs text-slate-300 pt-2">
                <div className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Explainable AI (SHAP):</strong> Exactly 3 natural language reasons per student.</span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>High-Risk Recall Priority:</strong> XGBoost tuned to prevent missing vulnerable youth.</span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>What-If Simulator:</strong> Real-time trajectory re-scoring for intervention planning.</span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>India DPDP Aligned:</strong> Section-based role security & anonymized metrics.</span>
                </div>
              </div>
            </div>

            {/* Bottom Tagline */}
            <div className="relative z-10 pt-6 border-t border-slate-800 text-[11px] text-slate-400">
              Transforming academic data into timely pastoral action.
            </div>
          </div>

          {/* Right Login Form Column (7 cols) */}
          <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white space-y-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Portal Authentication</h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your authorized credentials or click any demo persona below:
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold animate-in fade-in">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. teacher@studypulse.edu"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800 font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800 font-medium transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-sky-600/20 transition-all flex items-center justify-center space-x-2"
              >
                <span>{loading ? "Authenticating..." : "Sign In to Dashboard"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Persona Section */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                <span>1-Click Jury Demonstration Personas:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Admin Persona */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin("admin@studypulse.edu", "Admin@123")}
                  disabled={loading}
                  className="p-3 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/70 transition-all text-left flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-indigo-900">👑 Admin</span>
                    <span className="text-[10px] text-indigo-600 font-semibold group-hover:translate-x-0.5 transition-transform">→</span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1">Principal Sharma</div>
                  <div className="text-[10px] text-slate-400 font-mono">School-Wide View</div>
                </button>

                {/* Teacher Persona */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin("teacher@studypulse.edu", "Teacher@123")}
                  disabled={loading}
                  className="p-3 rounded-xl border border-sky-200 bg-sky-50/50 hover:bg-sky-100/70 transition-all text-left flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-sky-900">👩‍🏫 Teacher</span>
                    <span className="text-[10px] text-sky-600 font-semibold group-hover:translate-x-0.5 transition-transform">→</span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1">Ms. Ananya Sharma</div>
                  <div className="text-[10px] text-slate-400 font-mono">Grade 10 Sec A&B</div>
                </button>

                {/* Parent Persona */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin("parent@studypulse.edu", "Parent@123")}
                  disabled={loading}
                  className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 transition-all text-left flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-emerald-900">👨‍👩‍👧 Parent</span>
                    <span className="text-[10px] text-emerald-600 font-semibold group-hover:translate-x-0.5 transition-transform">→</span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1">Mr. Rajesh Rao</div>
                  <div className="text-[10px] text-slate-400 font-mono">Aryan (STU-1004)</div>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
