import React, { useState } from 'react';
import { 
  FileText, Sparkles, Languages, CheckCircle2, AlertTriangle, 
  Upload, Copy, ArrowRight, ShieldCheck, RefreshCw, Send, Check
} from 'lucide-react';
import { api } from '../api';
import { INDIC_LANGUAGES } from '../i18n';

const SAMPLE_DOCUMENTS = [
  {
    title: "Hindi Teacher Remark (हस्तलिखित टिप्पणी)",
    langCode: "hi",
    text: "छात्र आर्यन पिछले 3 सप्ताह से विद्यालय में अनियमित है। लगातार 4 दिन गैरहाजिर रहा। गणित और विज्ञान की मासिक परीक्षा में न्यूनतम उत्तीर्ण अंक भी नहीं ला पाया। कक्षा में बातचीत के दौरान उसने बताया कि पारिवारिक आर्थिक तंगी और सुबह वाहन की समस्या के कारण वह समय पर नहीं पहुँच पाता।"
  },
  {
    title: "Telugu Counseling Memo (కౌన్సిలింగ్ నోట్స్)",
    langCode: "te",
    text: "విద్యార్థి రోహన్ తరచూ తరగతులకు ఆలస్యంగా వస్తున్నాడు. గత నెలలో 8 రోజులు స్కూలుకు రాలేదు. త్రైమాసిక పరీక్షలలో గణితం మరియు ఇంగ్లీష్ సబ్జెక్టులలో మార్కులు బాగా తగ్గాయి. స్నేహితులతో చిన్న గొడవలు పడుతున్నట్లు ఉపాధ్యాయులు గమనించారు. తల్లిదండ్రులను పిలిపించి మాట్లాడటం అత్యవసరం."
  },
  {
    title: "Tamil Teacher Feedback (ஆசிரியர் குறிப்பு)",
    langCode: "ta",
    text: "மாணவி அனன்யா கடந்த இரண்டு வாரங்களாக பள்ளிக்கு சரியாக வருவதில்லை. வகுப்பறை தேர்வில் குறைந்த மதிப்பெண்கள் பெற்றுள்ளார். வீட்டுப்பாடங்களை முடிப்பதில் தாமதம் ஏற்படுகிறது. உடனடியாக சிறப்பு பயிற்சி வகுப்புகள் மற்றும் பெற்றோர் ஆலோசனை தேவை."
  },
  {
    title: "Bengali Progress Note (শিক্ষকের মূল্যায়ন)",
    langCode: "bn",
    text: "ছাত্রী প্রিয়া শ্রেণীকক্ষে অত্যন্ত অমনোযোগী এবং গত মাসে ৫ দিন অনুপস্থিত ছিল। অর্ধবার্ষিক পরীক্ষায় অঙ্কে দুর্বল ফলাফল করেছে। পরিবারের সাথে কথা বলে জানা গেছে যে যাতায়াতের দূরত্বের কারণে সে নিয়মিত স্কুলে পৌঁছাতে পারছে না।"
  },
  {
    title: "Hinglish Code-Mixed Note (मिश्रित भाषा)",
    langCode: "hi",
    text: "Aryan last 2 weeks se school nahi aa raha hai. Daily subah morning assembly miss karta hai aur math test me marks bahut kam aaye hain. Father ka phone lag nahi raha, immediate home check-in and counselor guidance ki zaroorat hai."
  }
];

export default function DocumentIntelligenceHub({ t, language }) {
  const [inputText, setInputText] = useState(SAMPLE_DOCUMENTS[0].text);
  const [targetLang, setTargetLang] = useState(language || 'en');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [parentAlert, setParentAlert] = useState(null);
  const [alertLoading, setAlertLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setParentAlert(null);
    try {
      const res = await api.processDocumentIntel(inputText, targetLang);
      setAnalysisResult(res);
    } catch (err) {
      console.error("Document analysis error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAlert = async () => {
    setAlertLoading(true);
    try {
      // Generate sample parent alert based on detected distress
      const res = await api.generateParentAlert("STU-1004", targetLang);
      setParentAlert(res);
    } catch (err) {
      console.error("Alert generation error:", err);
    } finally {
      setAlertLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-xs p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Regional Document Intelligence & Indic OCR</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Ingest handwritten notes, teacher memos, and progress cards in any of the 22 Scheduled Indian languages or regional dialects.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-500 font-semibold">Output Language:</span>
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 cursor-pointer"
          >
            {INDIC_LANGUAGES.map(l => (
              <option key={l.code} value={l.code}>
                {l.nativeName} ({l.name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Preset Samples */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-slate-400 font-bold uppercase tracking-wider shrink-0 text-[10px]">
          Sample Inputs:
        </span>
        {SAMPLE_DOCUMENTS.map((sample, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setInputText(sample.text);
              setTargetLang(sample.langCode);
            }}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold whitespace-nowrap shadow-2xs hover:shadow-xs transition-all"
          >
            {sample.title}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Box (6 cols) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
              <Languages className="w-3.5 h-3.5 mr-1 text-sky-600" />
              Regional Document / Note Transcript
            </label>
            <span className="text-[11px] text-slate-400 font-mono">
              {inputText.length} chars
            </span>
          </div>

          <textarea
            rows={8}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste student observations, teacher notes, or scanned OCR text in Hindi, Telugu, Tamil, Bengali, Marathi, etc..."
            className="w-full p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 leading-relaxed resize-none"
          />

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-400 flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-500" />
              Preserves academic nuance & detects distress markers
            </span>
            <button
              onClick={handleAnalyze}
              disabled={loading || !inputText.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing Indic NLP...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Analyze Document</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Intelligence Results (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {analysisResult ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 animate-in fade-in duration-200">
              {/* Language Detection Pill */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-500">Language Detected:</span>
                  <span className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-bold">
                    {analysisResult.source_language_detected} ({analysisResult.detected_script})
                  </span>
                  {analysisResult.is_code_mixed && (
                    <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-[10px] font-bold">
                      Code-Mixed
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  {Math.round(analysisResult.confidence_score * 100)}% Confidence
                </span>
              </div>

              {/* Identified Distress Indicators */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Extracted Dropout Risk Indicators
                </span>
                <div className="space-y-1.5">
                  {analysisResult.distress_indicators.map((ind, i) => (
                    <div key={i} className="flex items-center space-x-2 p-2 bg-rose-50/70 border border-rose-200/80 rounded-xl text-xs text-rose-900 font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>{ind}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Academic Meaning Preserved Summary */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Academic Nuance Summary ({targetLang.toUpperCase()})
                  </span>
                  <button
                    onClick={() => copyToClipboard(analysisResult.academic_summary)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded"
                    title="Copy Summary"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 font-medium leading-relaxed">
                  {analysisResult.academic_summary}
                </div>
              </div>

              {/* Action Button: Generate Parent Notification */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Ready for pastoral intervention</span>
                <button
                  onClick={handleGenerateAlert}
                  disabled={alertLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{alertLoading ? 'Drafting Alert...' : 'Draft Regional Parent Notice'}</span>
                </button>
              </div>

              {/* Render drafted parent alert */}
              {parentAlert && (
                <div className="mt-3 p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900 flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                      {parentAlert.native_language} Parent Alert (SMS / WhatsApp)
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full">
                      Empathetic Notice
                    </span>
                  </div>
                  <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                    {parentAlert.message}
                  </p>
                  <div className="text-right">
                    <button
                      onClick={() => copyToClipboard(parentAlert.message)}
                      className="text-[11px] font-bold text-emerald-700 hover:underline inline-flex items-center"
                    >
                      {copied ? 'Copied to Clipboard!' : 'Copy Notification Text'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full bg-slate-50/80 rounded-2xl border border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
              <FileText className="w-8 h-8 text-slate-300" />
              <p className="text-xs font-bold text-slate-600">No Document Analyzed Yet</p>
              <p className="text-[11px] text-slate-400 max-w-xs">
                Select a sample above or paste teacher remarks in any Indian language to extract early-warning indicators.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
