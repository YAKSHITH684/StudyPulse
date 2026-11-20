import React, { useState, useEffect } from 'react';
import { 
  Zap, Key, ShieldCheck, CheckCircle2, AlertCircle, 
  ExternalLink, Loader2, X, Cpu, Server, Sparkles
} from 'lucide-react';
import { api } from '../api';

export default function GroqConfigModal({ isOpen, onClose, onConfigSaved }) {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('llama-3.3-70b-versatile');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadStatus();
      setSaveSuccess(false);
      setErrorMsg('');
      setTestResult(null);
    }
  }, [isOpen]);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const res = await api.getGroqStatus();
      setStatus(res);
      if (res.active_model) {
        setSelectedModel(res.active_model);
      }
    } catch (err) {
      console.error("Failed to load Groq status:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestKey = async () => {
    setErrorMsg('');
    setTestResult(null);
    setTesting(true);
    try {
      const res = await api.testGroqConnection(apiKey || null);
      setTestResult(res);
      if (res.success) {
        if (res.available_models) {
          setStatus(prev => ({ ...prev, available_models: res.available_models }));
        }
        if (res.model_tested) {
          setSelectedModel(res.model_tested);
        }
      } else {
        setErrorMsg(res.error || "Connection test failed.");
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to reach backend test endpoint.");
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!apiKey.trim() && !status?.groq_configured) {
      setErrorMsg("Please enter your Groq API key.");
      return;
    }

    setErrorMsg('');
    setLoading(true);
    setSaveSuccess(false);
    try {
      const res = await api.updateGroqConfig(apiKey.trim(), selectedModel, true);
      setSaveSuccess(true);
      loadStatus();
      setApiKey('');
      if (onConfigSaved) onConfigSaved(res);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || "Failed to save Groq configuration.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                <Zap className="w-5 h-5 fill-white" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                  <span>Groq Llama 3.3 Integration</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    Ultra-Fast LLM
                  </span>
                </h3>
                <p className="text-xs text-slate-300">
                  Sub-second generative reasoning for AI Counselor, Tutor & Study Planner
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Current Status Pill */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`h-3 w-3 rounded-full ${status?.groq_configured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
              <div>
                <div className="text-xs font-bold text-slate-800">
                  {status?.groq_configured ? "Groq Llama Engine Active" : "Fallback Engine Active (Rule & Heuristics)"}
                </div>
                <div className="text-[11px] text-slate-500">
                  {status?.groq_configured 
                    ? `Configured: ${status?.masked_key || 'Active'} • Model: ${status?.active_model}`
                    : "No Groq API key set. Add your key below to unlock generative reasoning."}
                </div>
              </div>
            </div>
            {status?.groq_configured && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Online
              </span>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {/* API Key Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                  <Key className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Groq API Key (gsk_...)</span>
                </label>
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 hover:underline"
                >
                  <span>Get Free Key at Groq</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="password"
                placeholder={status?.groq_configured ? "•••••••••••••••• (Leave blank to keep current key)" : "gsk_..."}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Stored locally in <code className="text-slate-700 font-semibold">.env</code> and encrypted memory. Never shared externally.
              </p>
            </div>

            {/* Model Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Select Active Groq Model
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(status?.available_models || [
                  { id: 'qwen/qwen3.8-27b', name: 'Qwen 3.8 27B', badge: 'Recommended • Multilingual Reasoning' },
                  { id: 'openai/gpt-oss-120b', name: 'GPT OSS 120B', badge: 'Deep Reasoning • 131k context' },
                  { id: 'openai/gpt-oss-20b', name: 'GPT OSS 20B', badge: 'Ultra-Fast • 131k context' },
                  { id: 'allam-2-7b', name: 'ALLaM 2 7B', badge: 'Fast & Capable' }
                ]).map((m) => (
                  <div 
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      selectedModel === m.id
                        ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">{m.name}</div>
                    <div className="text-[10px] text-indigo-700 font-semibold mt-0.5">{m.badge}</div>
                    <div className="text-[9px] font-mono text-slate-400 mt-1 truncate">{m.id}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Connection Button & Result */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleTestKey}
                disabled={testing || (!apiKey && !status?.groq_configured)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                {testing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Testing Groq latency...</span>
                  </>
                ) : (
                  <>
                    <Server className="w-3.5 h-3.5 text-slate-600" />
                    <span>Ping & Test Groq API Key</span>
                  </>
                )}
              </button>

              {testResult && testResult.success && (
                <div className="mt-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold">Connected successfully!</span> Latency: <strong>{testResult.latency_ms}ms</strong>. Engine reply: <em>"{testResult.response}"</em>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="mt-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <div>{errorMsg}</div>
                </div>
              )}

              {saveSuccess && (
                <div className="mt-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div><strong>Groq Llama 3.3 activated!</strong> System is now running on generative inference.</div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex items-center justify-end space-x-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Key...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>Save & Activate Groq Llama</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
