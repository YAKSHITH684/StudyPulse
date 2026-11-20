import React, { useState, useEffect } from 'react';
import { 
  Menu, Languages, Sparkles, Activity, ShieldCheck, 
  Search, SlidersHorizontal, RefreshCw, Zap 
} from 'lucide-react';
import { INDIC_LANGUAGES } from '../i18n';
import { api } from '../api';

export default function TopHeader({ 
  user, 
  activeTab, 
  language, 
  setLanguage, 
  onOpenMobileMenu, 
  onOpenGroqModal,
  t 
}) {
  const [groqActive, setGroqActive] = useState(false);
  const [groqModel, setGroqModel] = useState('');

  useEffect(() => {
    api.getGroqStatus()
      .then(res => {
        setGroqActive(res.groq_configured);
        setGroqModel(res.active_model || 'Groq');
      })
      .catch(() => setGroqActive(false));
  }, []);

  const scheduledLangs = INDIC_LANGUAGES.filter(l => l.category === 'Scheduled');
  const regionalLangs = INDIC_LANGUAGES.filter(l => l.category === 'Regional & Tribal');

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-xs">
      {/* Left: Mobile Toggle & Context */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 hidden sm:inline">
            Platform /
          </span>
          <span className="text-sm font-extrabold text-slate-900 tracking-tight capitalize">
            {activeTab === 'dashboard' ? t.dashboard :
             activeTab === 'timeline' ? t.predictiveTimeline :
             activeTab === 'heatmap' ? t.riskHeatmap :
             activeTab === 'tutor' ? t.studyPlannerTutor :
             activeTab === 'docIntel' ? (t.documentIntelligence || 'Document Intel & OCR') :
             activeTab === 'analytics' ? t.schoolAnalytics :
             activeTab === 'metrics' ? t.modelMetrics :
             activeTab === 'dataHub' ? t.dataHub :
             activeTab === 'parentPortal' ? t.parentPortal : activeTab}
          </span>
        </div>
      </div>

      {/* Right: Live Status Badge & Indian Language Picker */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Groq AI Button */}
        <button
          type="button"
          onClick={onOpenGroqModal}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs hover:scale-102 cursor-pointer border ${
            groqActive
              ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border-amber-300'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
          }`}
          title="Configure Groq AI Engine & Model"
        >
          <Zap className={`w-3.5 h-3.5 ${groqActive ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
          <span className="hidden sm:inline">
            {groqActive ? `Groq: ${groqModel.split('/')[1] || groqModel}` : 'Groq AI'}
          </span>
          <span className="sm:hidden">Groq</span>
          <span className={`w-2 h-2 rounded-full ${groqActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
        </button>

        {/* Live Model Badge */}
        <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 bg-slate-100/90 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>XGBoost + SHAP</span>
        </div>

        {/* 29+ Indian Languages Selector */}
        <div className="flex items-center space-x-1.5 bg-white border border-slate-200 shadow-2xs rounded-xl px-2.5 py-1 text-xs">
          <Languages className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer max-w-[140px] sm:max-w-[170px] truncate"
            title="Select Indian Language"
          >
            <option value="en">English (Indian Context)</option>
            <optgroup label="22 Scheduled Languages of India">
              {scheduledLangs.map(l => (
                <option key={l.code} value={l.code}>
                  {l.nativeName} ({l.name})
                </option>
              ))}
            </optgroup>
            <optgroup label="Regional, Tribal & Dialects">
              {regionalLangs.map(l => (
                <option key={l.code} value={l.code}>
                  {l.nativeName} ({l.name})
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>
    </header>
  );
}
