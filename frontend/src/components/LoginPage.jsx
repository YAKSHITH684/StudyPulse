import React, { useState } from 'react';
import { 
  Activity, Shield, Lock, Mail, Eye, EyeOff, Sparkles, 
  ArrowRight, Users, GraduationCap, Heart, CheckCircle2, 
  UserPlus, KeyRound, ArrowLeft, RefreshCw, AlertCircle,
  Zap, BrainCircuit, ShieldCheck, Globe2, BarChart3, Clock
} from 'lucide-react';
import { api } from '../api';

export default function LoginPage({ onLoginSuccess, t }) {
  // Modes: 'signin', 'register', 'forgot'
  const [authMode, setAuthMode] = useState('signin');

  // Sign In state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState('teacher');
  const [regGrade, setRegGrade] = useState('10');
  const [regSections, setRegSections] = useState('A,B');
  const [regLinkedStudent, setRegLinkedStudent] = useState('STU-1004');

  // Forgot Password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState(1);

  // Feedback & Loading
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const switchMode = (mode) => {
    setAuthMode(mode);
    setError(null);
    setSuccessMsg(null);
  };

  // 1. Handle Login
  const handleLoginSubmit = async (e) => {
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
      setError(err.message || "Invalid email or password");
      setLoading(false);
    }
  };

  // 1-Click Persona Login
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

  // 2. Handle Register
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (regPassword !== regConfirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (regPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const data = await api.register({
        full_name: regFullName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        assigned_grades: regRole === 'teacher' ? regGrade : 'All',
        assigned_sections: regRole === 'teacher' ? regSections : 'All',
        linked_student_id: regRole === 'parent' ? regLinkedStudent : null
      });

      setSuccessMsg("Account successfully created! Signing you in...");
      setTimeout(() => {
        onLoginSuccess(data);
      }, 700);
    } catch (err) {
      setError(err.message || "Registration failed");
      setLoading(false);
    }
  };

  // 3. Handle Forgot Password (Step 1)
  const handleRequestResetCode = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setError("Please enter your registered email address.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.forgotPassword(forgotEmail);
      setSuccessMsg(res.message);
      if (res.reset_token) {
        setResetToken(res.reset_token);
      }
      setForgotStep(2);
    } catch (err) {
      setError(err.message || "Failed to generate verification code");
    } finally {
      setLoading(false);
    }
  };

  // 3b. Handle Password Reset (Step 2)
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!resetToken || !newPassword) {
      setError("Please fill in both the verification code and new password.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.resetPassword(forgotEmail, resetToken, newPassword);
      setSuccessMsg(res.message);
      setEmail(forgotEmail);
      setPassword(newPassword);
      setTimeout(() => {
        switchMode('signin');
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-950 font-sans selection:bg-sky-500 selection:text-white">
      
      {/* ========================================================================= */}
      {/* LEFT COLUMN: FULL-HEIGHT EXECUTIVE INTELLIGENCE COMMAND SHOWCASE (50% W)   */}
      {/* ========================================================================= */}
      <div className="lg:w-1/2 min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800/80">
        
        {/* Ambient Decorative Light Fields */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-500/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-80 h-80 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Top Header Pill */}
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-sky-300 border border-white/10 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
            <span>AI Early-Warning Intelligence Command</span>
            <span className="text-white/30">•</span>
            <span className="text-emerald-400 font-bold">DPDP Aligned</span>
          </div>
        </div>

        {/* Central Brand Story & Core Pillars */}
        <div className="relative z-10 space-y-8 my-auto py-8">
          
          {/* Logo & Headline */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-rose-500 rounded-2xl blur-xs opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-violet-700 flex items-center justify-center text-white shadow-2xl shadow-sky-500/40">
                  <Activity className="h-8 w-8 stroke-[2.5]" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center space-x-2">
                  <span>StudyPulse</span>
                </h1>
                <p className="text-xs sm:text-sm text-sky-300 font-bold tracking-wide">
                  Next-Gen Dropout Prevention & Academic Care
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <p className="text-base sm:text-lg font-bold text-sky-100 italic">
                "Detect Early. Explain Clearly. Act in Time."
              </p>
              <p className="text-xs text-slate-300 mt-1 font-medium leading-relaxed">
                Empowering secondary schools with calibrated multi-dimensional risk scoring, 3-reason explainable AI (SHAP), and real-time Groq generative counseling across 29+ Indian languages.
              </p>
            </div>
          </div>

          {/* Key Intelligence Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/10 space-y-1">
              <div className="flex items-center space-x-2 text-sky-400">
                <BrainCircuit className="w-4 h-4" />
                <span className="text-xs font-bold text-white">Explainable AI (SHAP)</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Exactly 3 plain-language contributing reasons per student with feature impact weighting.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/10 space-y-1">
              <div className="flex items-center space-x-2 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-bold text-white">High-Risk Recall Priority</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                XGBoost calibrated objective prioritizing vulnerable students before academic failure occurs.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/10 space-y-1">
              <div className="flex items-center space-x-2 text-amber-400">
                <Zap className="w-4 h-4 fill-amber-400/20" />
                <span className="text-xs font-bold text-white">Groq AI Sub-Second LLM</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Generative pastoral counseling, study planning & multilingual parent communications.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/10 space-y-1">
              <div className="flex items-center space-x-2 text-indigo-400">
                <Globe2 className="w-4 h-4" />
                <span className="text-xs font-bold text-white">29+ Indian Languages</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                All 22 Scheduled + Regional dialects, code-mixing heuristics and Indic document OCR.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Live Metrics Strip */}
        <div className="relative z-10 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-semibold">
              Live Cohort: <strong className="text-white font-bold">250 Monitored</strong>
            </span>
          </div>

          <div className="flex items-center space-x-3 text-slate-400 text-[11px] font-medium">
            <span>High Risk: <strong className="text-rose-400">44</strong></span>
            <span>•</span>
            <span>Watchlist: <strong className="text-amber-400">48</strong></span>
            <span>•</span>
            <span>Low Risk: <strong className="text-emerald-400">158</strong></span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT COLUMN: FULL-HEIGHT SPACIOUS AUTHENTICATION INTERFACE (50% W)       */}
      {/* ========================================================================= */}
      <div className="lg:w-1/2 min-h-screen bg-slate-50 flex flex-col justify-between p-6 sm:p-12 lg:p-16 overflow-y-auto">
        
        {/* Top Header Row in Form Column */}
        <div className="w-full max-w-lg mx-auto flex items-center justify-between pb-6">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-500">
            <Shield className="w-4 h-4 text-indigo-600" />
            <span>Secure Role-Based Portal Access</span>
          </div>

          {/* Quick Segmented Mode Buttons */}
          <div className="flex space-x-1 bg-slate-200/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Form Container (Centered Vertically) */}
        <div className="w-full max-w-lg mx-auto space-y-6 my-auto">
          
          {/* Header Title */}
          <div>
            {authMode === 'forgot' && (
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center mb-3 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Back to Sign In
              </button>
            )}

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {authMode === 'signin' && 'Sign in to Command Center'}
              {authMode === 'register' && 'Register Educator or Parent'}
              {authMode === 'forgot' && 'Reset Account Password'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              {authMode === 'signin' && 'Enter your credentials or launch an instant 1-click persona demo:'}
              {authMode === 'register' && 'Create your role-restricted portal account:'}
              {authMode === 'forgot' && 'Follow the steps to recover access to your account:'}
            </p>
          </div>

          {/* Error & Success Feedback Alerts */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-semibold flex items-center space-x-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center space-x-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* =================================================================== */}
          {/* MODE 1: SIGN IN                                                     */}
          {/* =================================================================== */}
          {authMode === 'signin' && (
            <div className="space-y-5">
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
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
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800 shadow-2xs transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(email);
                        switchMode('forgot');
                      }}
                      className="text-xs text-sky-600 hover:text-sky-800 font-semibold cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800 shadow-2xs transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-sky-600/25 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{loading ? "Authenticating Credentials..." : "Sign In to Command Center"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* 1-Click Live Demonstration Personas */}
              <div className="pt-4 border-t border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <span>1-Click Live Demonstration Personas:</span>
                  <span className="text-sky-600 lowercase font-medium">auto-fill & login</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin("admin@studypulse.edu", "Admin@123")}
                    disabled={loading}
                    className="p-3 bg-white hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-300 rounded-2xl shadow-2xs hover:shadow-xs transition-all text-left flex flex-col justify-between group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-indigo-950 flex items-center space-x-1">
                        <span>👑 Admin</span>
                      </span>
                      <span className="text-xs text-indigo-600 font-bold group-hover:translate-x-0.5 transition-transform">→</span>
                    </div>
                    <div className="text-xs text-slate-700 font-semibold mt-1 truncate">Principal Director</div>
                    <div className="text-[10px] text-indigo-600/80 font-mono">School-Wide Scope</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin("teacher@studypulse.edu", "Teacher@123")}
                    disabled={loading}
                    className="p-3 bg-white hover:bg-sky-50/70 border border-slate-200 hover:border-sky-300 rounded-2xl shadow-2xs hover:shadow-xs transition-all text-left flex flex-col justify-between group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-sky-950 flex items-center space-x-1">
                        <span>👩‍🏫 Teacher</span>
                      </span>
                      <span className="text-xs text-sky-600 font-bold group-hover:translate-x-0.5 transition-transform">→</span>
                    </div>
                    <div className="text-xs text-slate-700 font-semibold mt-1 truncate">Ms. Ananya Sharma</div>
                    <div className="text-[10px] text-sky-600/80 font-mono">Grade 10 Sec A&B</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin("parent@studypulse.edu", "Parent@123")}
                    disabled={loading}
                    className="p-3 bg-white hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 rounded-2xl shadow-2xs hover:shadow-xs transition-all text-left flex flex-col justify-between group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-emerald-950 flex items-center space-x-1">
                        <span>👨‍👩‍👧 Parent</span>
                      </span>
                      <span className="text-xs text-emerald-600 font-bold group-hover:translate-x-0.5 transition-transform">→</span>
                    </div>
                    <div className="text-xs text-slate-700 font-semibold mt-1 truncate">Mr. Rajesh Rao</div>
                    <div className="text-[10px] text-emerald-600/80 font-mono">Aryan (STU-1004)</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* MODE 2: REGISTER ACCOUNT                                            */}
          {/* =================================================================== */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="e.g. Dr. Kavita Nair"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="e.g. knair@studypulse.edu"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer"
                  >
                    <option value="teacher">Teacher (Class Lead)</option>
                    <option value="parent">Parent</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                {regRole === 'teacher' ? (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Assigned Grade</label>
                    <select
                      value={regGrade}
                      onChange={(e) => setRegGrade(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer"
                    >
                      <option value="9">Grade 9</option>
                      <option value="10">Grade 10</option>
                      <option value="11">Grade 11</option>
                      <option value="12">Grade 12</option>
                    </select>
                  </div>
                ) : regRole === 'parent' ? (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Linked Student ID</label>
                    <input
                      type="text"
                      required
                      value={regLinkedStudent}
                      onChange={(e) => setRegLinkedStudent(e.target.value)}
                      placeholder="e.g. STU-1004"
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono font-bold"
                    />
                  </div>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-bold shadow-md shadow-sky-600/25 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? "Creating Account..." : "Register Account"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* =================================================================== */}
          {/* MODE 3: FORGOT PASSWORD                                             */}
          {/* =================================================================== */}
          {authMode === 'forgot' && (
            <div className="space-y-4 text-xs">
              {forgotStep === 1 ? (
                <form onSubmit={handleRequestResetCode} className="space-y-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
                      Enter Registered Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="e.g. teacher@studypulse.edu"
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold transition-all shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{loading ? "Generating Code..." : "Send Verification Code"}</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetSubmit} className="space-y-4">
                  {resetToken && (
                    <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl text-xs flex items-center justify-between">
                      <span>Demo Verification Code: <strong>{resetToken}</strong></span>
                      <span className="text-[10px] text-indigo-600 font-semibold">(Auto-filled)</span>
                    </div>
                  )}

                  <div>
                    <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[11px]">
                      6-Digit Verification Code
                    </label>
                    <input
                      type="text"
                      required
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      placeholder="e.g. 123456"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono tracking-wider text-slate-800 text-center font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[11px]">
                      Set New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 font-medium"
                    />
                  </div>

                  <div className="flex space-x-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{loading ? "Updating..." : "Confirm & Reset Password"}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Bottom Form Footer */}
        <div className="w-full max-w-lg mx-auto pt-6 border-t border-slate-200/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span>StudyPulse Early Warning System v1.0</span>
          <span className="text-slate-500 font-medium">⚡ Groq LLM Inference Active</span>
        </div>
      </div>

    </div>
  );
}
