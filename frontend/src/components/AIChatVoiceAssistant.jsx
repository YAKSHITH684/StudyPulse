import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Mic, MicOff, Volume2, VolumeX, Send, X, 
  Sparkles, RotateCcw, ChevronDown, User, MessageSquare, 
  Check, Play, Square, Radio 
} from 'lucide-react';
import { api } from '../api';

export default function AIChatVoiceAssistant({ currentStudentId, language = "en" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "👋 Namaste! I am **StudyPulse AI**, your intelligent early-warning & voice assistant.\n\nAsk me about student risk factors, attendance anomalies, remedial study plans, or tap the **Microphone** to speak with me!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [suggestedChips, setSuggestedChips] = useState([
    "Tell me about Aryan Rao",
    "Who is at high risk?",
    "Math 4-week study plan",
    "How does SHAP explain risk?"
  ]);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputValue(transcript);
          // Auto submit spoken query
          handleSend(transcript);
        }
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  // Text-To-Speech
  const speakText = (text) => {
    if (!voiceEnabled || !window.speechSynthesis) return;

    window.speechSynthesis.cancel(); // stop any ongoing speech

    // Strip markdown formatting for cleaner speech
    const cleanText = text
      .replace(/[*#_`>]/g, '')
      .replace(/•/g, '')
      .replace(/\n+/g, '. ');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-IN';

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      stopSpeaking();
      recognitionRef.current.start();
    }
  };

  const handleSend = async (textToSend = null) => {
    const text = textToSend || inputValue;
    if (!text.trim() || loading) return;

    const userMsg = {
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const res = await api.sendMessage(text, currentStudentId, language);
      const botMsg = {
        sender: 'bot',
        text: res.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);

      if (res.suggested_followups && res.suggested_followups.length > 0) {
        setSuggestedChips(res.suggested_followups);
      }

      // Auto speak response
      if (voiceEnabled) {
        speakText(res.reply);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: "Sorry, I had trouble communicating with the server. Please ensure the backend is running.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  const formatBotText = (text) => {
    // Simple parser for bolding and bullets
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Bold replacement
      let parsed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      if (parsed.startsWith('• ') || parsed.startsWith('- ')) {
        return (
          <li key={idx} className="ml-4 list-disc" dangerouslySetInnerHTML={{ __html: parsed.substring(2) }} />
        );
      }
      return <p key={idx} className="min-h-[1.2rem]" dangerouslySetInnerHTML={{ __html: parsed }} />;
    });
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom-Right) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 animate-bounce-subtle">
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center space-x-2.5 px-4 py-3 bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-600 hover:from-sky-700 hover:to-indigo-700 text-white rounded-full shadow-xl shadow-sky-600/30 transition-all transform hover:scale-105 border border-white/20"
          >
            <div className="relative">
              <Bot className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
            </div>
            <span className="text-xs font-bold tracking-wide hidden sm:inline">AI Voice Agent</span>
            <Mic className="w-4 h-4 text-sky-200 group-hover:text-white" />
          </button>
        </div>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[94vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="font-bold text-sm">StudyPulse AI</h3>
                  <span className="text-[10px] font-semibold bg-sky-500/20 text-sky-300 px-1.5 py-0.2 rounded border border-sky-400/20">
                    Voice Agent
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 flex items-center space-x-1">
                  <span>Dropout Early-Warning Assistant</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              {/* Voice Mute/Unmute Toggle */}
              <button
                onClick={() => {
                  if (isSpeaking) stopSpeaking();
                  setVoiceEnabled(!voiceEnabled);
                }}
                title={voiceEnabled ? "Mute Voice Output" : "Enable Voice Output"}
                className={`p-1.5 rounded-lg transition-colors ${
                  voiceEnabled ? 'text-sky-300 hover:bg-white/10' : 'text-slate-500 hover:bg-white/10'
                }`}
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Close Button */}
              <button
                onClick={() => {
                  stopSpeaking();
                  setIsOpen(false);
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Active Voice Speaking Status Banner */}
          {isSpeaking && (
            <div className="bg-sky-50 border-b border-sky-100 px-4 py-1.5 flex items-center justify-between text-xs text-sky-800">
              <div className="flex items-center space-x-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                </span>
                <span className="font-semibold">Voice Agent Speaking...</span>
              </div>
              <button 
                onClick={stopSpeaking}
                className="text-[11px] font-bold text-rose-600 hover:underline flex items-center space-x-1"
              >
                <Square className="w-3 h-3 fill-rose-600" />
                <span>Stop</span>
              </button>
            </div>
          )}

          {/* Active Listening Wave Banner */}
          {isListening && (
            <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 flex items-center justify-between text-xs text-rose-800 animate-pulse">
              <div className="flex items-center space-x-2">
                <Radio className="w-4 h-4 text-rose-600 animate-spin" />
                <span className="font-bold">Listening... Speak your question</span>
              </div>
              <button
                onClick={() => recognitionRef.current?.stop()}
                className="text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-white px-2 py-0.5 rounded border border-rose-200"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50 text-xs sm:text-sm">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed shadow-xs ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none space-y-1'
                  }`}
                >
                  {m.sender === 'bot' ? formatBotText(m.text) : m.text}
                </div>

                {/* Bubble Footer & Audio Replay */}
                <div className="flex items-center space-x-1.5 mt-1 px-1 text-[10px] text-slate-400">
                  <span>{m.time}</span>
                  {m.sender === 'bot' && (
                    <button
                      onClick={() => speakText(m.text)}
                      title="Play Voice"
                      className="text-slate-400 hover:text-sky-600 p-0.5"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 text-slate-400 bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 w-fit">
                <div className="w-2 h-2 rounded-full bg-sky-500 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs text-slate-500 font-medium">Analyzing student records & generating guidance...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center space-x-1.5 overflow-x-auto scrollbar-none text-[11px]">
            <span className="text-slate-400 shrink-0 font-medium flex items-center">
              <Sparkles className="w-3 h-3 mr-1 text-amber-500" />
              Try:
            </span>
            {suggestedChips.map((chip, i) => (
              <button
                key={i}
                onClick={() => handleSend(chip)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 rounded-lg whitespace-nowrap transition-colors font-medium border border-slate-200/60"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Bar with Microphone Button */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
            {/* Mic Toggle */}
            <button
              onClick={toggleListening}
              title={isListening ? "Stop Listening" : "Speak to Voice Agent"}
              className={`p-2.5 rounded-xl transition-all shadow-sm ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-slate-100 text-slate-600 hover:bg-sky-50 hover:text-sky-600'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isListening ? "Listening to your voice..." : "Ask a question or speak..."}
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium text-slate-800"
            />

            {/* Send Button */}
            <button
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || loading}
              className="p-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 text-white rounded-xl transition-all shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
