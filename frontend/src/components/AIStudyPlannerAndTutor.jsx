import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Calendar, CheckCircle2, Clock, Sparkles, 
  HelpCircle, Lightbulb, Award, ArrowRight, Check, Send, ChevronDown 
} from 'lucide-react';
import { api } from '../api';

export default function AIStudyPlannerAndTutor({ riskList, language = "en", t }) {
  const [activeTab, setActiveTab] = useState('planner'); // 'planner' or 'tutor'

  // Planner state
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studyPlan, setStudyPlan] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [dailyHours, setDailyHours] = useState(1.5);

  // Tutor state
  const [subject, setSubject] = useState('Mathematics');
  const [topic, setTopic] = useState('Linear Equations');
  const [customTopic, setCustomTopic] = useState('');
  const [explanation, setExplanation] = useState(null);
  const [practiceQuestion, setPracticeQuestion] = useState(null);
  const [loadingTutor, setLoadingTutor] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    if (riskList && riskList.length > 0 && !selectedStudentId) {
      setSelectedStudentId(riskList[0].student_id);
    }
  }, [riskList]);

  // Load study plan
  const handleGeneratePlan = async () => {
    if (!selectedStudentId) return;
    setLoadingPlan(true);
    try {
      const plan = await api.getStudyPlan(selectedStudentId, dailyHours);
      setStudyPlan(plan);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPlan(false);
    }
  };

  useEffect(() => {
    if (selectedStudentId) {
      handleGeneratePlan();
    }
  }, [selectedStudentId]);

  // Handle Tutor Explanation
  const handleExplain = async () => {
    const topicToUse = customTopic.trim() || topic;
    setLoadingTutor(true);
    setShowHint(false);
    setShowSolution(false);
    try {
      const exp = await api.explainConcept(subject, topicToUse, 10, language);
      setExplanation(exp);
      const q = await api.getPracticeQuestion(subject, topicToUse, "Medium", language);
      setPracticeQuestion(q);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTutor(false);
    }
  };

  useEffect(() => {
    handleExplain();
  }, [subject, topic, language]);

  return (
    <div className="space-y-6">
      {/* Tab Switcher Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">AI Academic Mentorship Suite</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Personalized study scheduling and interactive foundation concept coaching
          </p>
        </div>

        <div className="flex space-x-2 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('planner')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'planner'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🗓️ Personalized Study Planner
          </button>
          <button
            onClick={() => setActiveTab('tutor')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'tutor'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🎓 Interactive AI Study Tutor
          </button>
        </div>
      </div>

      {/* 1. PERSONALIZED STUDY PLANNER */}
      {activeTab === 'planner' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Target Student
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  {riskList.map(s => (
                    <option key={s.student_id} value={s.student_id}>
                      {s.student_name} ({s.student_id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Daily Revision Target: <strong className="text-indigo-600">{dailyHours} hours/day</strong>
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.5"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                  className="w-48 accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={handleGeneratePlan}
              disabled={loadingPlan}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center space-x-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loadingPlan ? 'Synthesizing...' : 'Re-Generate Study Plan'}</span>
            </button>
          </div>

          {studyPlan && (
            <div className="space-y-6">
              {/* Habits & Priority Subjects Banner */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs md:col-span-1 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Identified Weak Areas</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {studyPlan.priority_subjects.map((sub, i) => (
                      <span key={i} className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold">
                        {sub} (Remedial Focus)
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 pt-1">
                    Prioritizes foundational exercises before advanced testing.
                  </p>
                </div>

                <div className="bg-indigo-50/60 border border-indigo-200 p-5 rounded-2xl md:col-span-2 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-1 text-indigo-600" />
                    Target Habit Goals
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs text-indigo-950 font-medium">
                    {studyPlan.habit_goals.map((g, i) => (
                      <div key={i} className="bg-white/80 p-2.5 rounded-xl border border-indigo-100 flex items-start space-x-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{g}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 7-Day Interactive Timetable */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 text-sm">7-Day Structured Weekly Revision Schedule</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {studyPlan.weekly_schedule.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-sm text-slate-900">{item.day}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded">
                            {item.duration_minutes} min
                          </span>
                        </div>
                        <div className="text-xs font-bold text-indigo-600 mt-1">{item.focus_subject}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {item.time_slot}
                        </div>
                        <ul className="mt-2 text-xs text-slate-600 space-y-1 list-disc list-inside">
                          {item.tasks.map((task, tIdx) => (
                            <li key={tIdx} className="leading-snug">{task}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="pt-2 border-t border-slate-200/60 text-[10px] font-semibold text-emerald-600 flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Check-in Required
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. INTERACTIVE AI STUDY TUTOR */}
      {activeTab === 'tutor' && (
        <div className="space-y-6">
          {/* Topic Selector */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Choose Subject & Concept</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science (Physics & Chemistry)</option>
                  <option value="English">English</option>
                  <option value="Social Science">Social Science</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Popular Topics</label>
                <select
                  value={topic}
                  onChange={(e) => {
                    setTopic(e.target.value);
                    setCustomTopic('');
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  {subject === 'Mathematics' ? (
                    <>
                      <option value="Linear Equations">Linear Equations in Two Variables</option>
                      <option value="Quadratic Equations">Quadratic Equations (ax² + bx + c)</option>
                      <option value="Coordinate Geometry">Coordinate Geometry & Distance</option>
                    </>
                  ) : (
                    <>
                      <option value="Photosynthesis">Photosynthesis Light/Dark Reactions</option>
                      <option value="Newton's Laws">Newton's Laws of Motion</option>
                      <option value="Chemical Bonding">Ionic & Covalent Chemical Bonding</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Or Type Custom Question</label>
                <div className="flex space-x-1.5">
                  <input
                    type="text"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="e.g. Pythagoras theorem"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                  <button
                    onClick={handleExplain}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                  >
                    Ask
                  </button>
                </div>
              </div>
            </div>
          </div>

          {loadingTutor ? (
            <div className="p-16 text-center text-slate-400">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent mb-3" />
              <p className="text-sm font-medium">Preparing concept explanation & practice question...</p>
            </div>
          ) : explanation ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Concept Breakdown (7 cols) */}
              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                    {subject} Foundation Concept
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">{explanation.title}</h3>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Concept Summary</h4>
                  <p className="text-xs text-slate-700 leading-relaxed">{explanation.concept_summary}</p>
                </div>

                <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-1 text-amber-950">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-800">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    <span>Real-World Intuition & Analogy</span>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed">{explanation.real_world_analogy}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Step-by-Step Method</h4>
                  <div className="space-y-1.5">
                    {explanation.key_steps.map((st, i) => (
                      <div key={i} className="p-2.5 bg-slate-50 rounded-lg text-xs text-slate-700 border border-slate-100 flex items-start space-x-2">
                        <span className="font-bold text-indigo-600">{i + 1}.</span>
                        <span>{st}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-indigo-50 rounded-xl text-xs text-indigo-900 border border-indigo-100">
                  <strong>Pro Exam Tip:</strong> {explanation.pro_tip}
                </div>
              </div>

              {/* Practice Problem (5 cols) */}
              <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                {practiceQuestion && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
                        <HelpCircle className="w-4 h-4 mr-1 text-indigo-600" />
                        Guided Practice Check
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-sky-100 text-sky-800 rounded">
                        Confidence Builder
                      </span>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-sm font-bold text-slate-900">{practiceQuestion.question}</p>
                    </div>

                    {/* Hint Toggle */}
                    <div>
                      {!showHint ? (
                        <button
                          onClick={() => setShowHint(true)}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                        >
                          <Lightbulb className="w-3.5 h-3.5" />
                          <span>Show Hint</span>
                        </button>
                      ) : (
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 animate-in fade-in">
                          <strong>Hint:</strong> {practiceQuestion.hint}
                        </div>
                      )}
                    </div>

                    {/* Solution Reveal */}
                    <div>
                      {!showSolution ? (
                        <button
                          onClick={() => setShowSolution(true)}
                          className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                        >
                          Reveal Step-by-Step Solution
                        </button>
                      ) : (
                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2 text-xs text-emerald-950 animate-in fade-in">
                          <strong className="block text-emerald-800 font-bold">Solution Steps:</strong>
                          <div className="space-y-1 font-mono text-[11px]">
                            {practiceQuestion.steps.map((s, idx) => (
                              <p key={idx}>{s}</p>
                            ))}
                          </div>
                          <div className="pt-2 border-t border-emerald-200 font-bold text-emerald-800">
                            Final Answer: {practiceQuestion.answer}
                          </div>
                          <p className="text-[11px] text-emerald-700 italic pt-1">{practiceQuestion.encouragement}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="text-[11px] text-slate-400 italic text-center">
                  *Practice problems are designed to build progressive mastery without exam stress.
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
