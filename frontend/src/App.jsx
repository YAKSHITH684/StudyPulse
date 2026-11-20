import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import HeroCommandBanner from './components/HeroCommandBanner';
import RiskDashboard from './components/RiskDashboard';
import StudentDetailModal from './components/StudentDetailModal';
import InterventionModal from './components/InterventionModal';
import SchoolAnalytics from './components/SchoolAnalytics';
import ModelEvaluation from './components/ModelEvaluation';
import ParentPortal from './components/ParentPortal';
import DataPipelineHub from './components/DataPipelineHub';
import PredictiveTimeline from './components/PredictiveTimeline';
import SchoolRiskHeatmap from './components/SchoolRiskHeatmap';
import AIStudyPlannerAndTutor from './components/AIStudyPlannerAndTutor';
import DocumentIntelligenceHub from './components/DocumentIntelligenceHub';
import LoginPage from './components/LoginPage';
import AIChatVoiceAssistant from './components/AIChatVoiceAssistant';
import GroqConfigModal from './components/GroqConfigModal';
import { translations } from './i18n';
import { api, setAuthToken } from './api';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [language, setLanguage] = useState('en');
  const [riskList, setRiskList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [interventionStudent, setInterventionStudent] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [groqModalOpen, setGroqModalOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    risk_level: '',
    grade: '',
    section: ''
  });

  const t = translations[language] || translations.en;

  // Persona switch handler
  const switchUserPersona = async (role) => {
    setLoading(true);
    try {
      let email = 'teacher@studypulse.edu';
      let pass = 'Teacher@123';
      if (role === 'admin') {
        email = 'admin@studypulse.edu';
        pass = 'Admin@123';
      } else if (role === 'parent') {
        email = 'parent@studypulse.edu';
        pass = 'Parent@123';
      }

      const res = await api.login(email, pass);
      setUser(res);

      if (role === 'parent') {
        setActiveTab('parentPortal');
      } else {
        if (activeTab === 'parentPortal') setActiveTab('dashboard');
      }

      await loadRiskData(filters);
    } catch (err) {
      console.error("Persona switch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setAuthToken("");
    setRiskList([]);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    if (userData.role === 'parent') {
      setActiveTab('parentPortal');
    } else {
      setActiveTab('dashboard');
    }
    loadRiskData();
  };

  const loadRiskData = async (activeFilters = filters) => {
    try {
      setLoading(true);
      const data = await api.getRiskList(activeFilters);
      setRiskList(data);
    } catch (err) {
      console.error("Error loading risk list:", err);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when filters change
  useEffect(() => {
    if (user && user.role !== 'parent') {
      loadRiskData(filters);
    }
  }, [filters, user]);

  // If user is not logged in, render LoginPage!
  if (!user) {
    return (
      <div className="relative">
        <LoginPage onLoginSuccess={handleLoginSuccess} t={t} />
        {/* Floating AI Voice Agent available even on login */}
        <AIChatVoiceAssistant currentStudentId={null} language={language} />
      </div>
    );
  }

  const highRiskCount = riskList.filter(s => s.risk_tier === 'High').length;
  const mediumRiskCount = riskList.filter(s => s.risk_tier === 'Medium').length;

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800">
      {/* Executive Command Left Sidebar */}
      <Sidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onSwitchRole={switchUserPersona}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
        highRiskCount={highRiskCount}
        totalStudents={riskList.length}
        t={t}
      />

      {/* Main Command Workspace */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen min-w-0">
        <TopHeader
          user={user}
          activeTab={activeTab}
          language={language}
          setLanguage={setLanguage}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenGroqModal={() => setGroqModalOpen(true)}
          t={t}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {user?.role === 'parent' || activeTab === 'parentPortal' ? (
            <ParentPortal user={user} t={t} />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <>
                  <HeroCommandBanner
                    user={user}
                    highRiskCount={highRiskCount}
                    mediumRiskCount={mediumRiskCount}
                    totalStudents={riskList.length}
                    onNavigateTab={(tab) => setActiveTab(tab)}
                    t={t}
                  />
                  <RiskDashboard
                    riskList={riskList}
                    loading={loading}
                    onSelectStudent={(id) => setSelectedStudentId(id)}
                    onOpenIntervention={(stu) => setInterventionStudent(stu)}
                    filters={filters}
                    setFilters={setFilters}
                    user={user}
                    t={t}
                  />
                </>
              )}

              {activeTab === 'timeline' && (
                <PredictiveTimeline
                  riskList={riskList}
                  onSelectStudent={(id) => setSelectedStudentId(id)}
                  t={t}
                />
              )}

              {activeTab === 'heatmap' && (
                <SchoolRiskHeatmap
                  riskList={riskList}
                  onSelectStudent={(id) => setSelectedStudentId(id)}
                  t={t}
                />
              )}

              {activeTab === 'tutor' && (
                <AIStudyPlannerAndTutor
                  riskList={riskList}
                  language={language}
                  t={t}
                />
              )}

              {activeTab === 'docIntel' && (
                <DocumentIntelligenceHub
                  t={t}
                  language={language}
                />
              )}

              {activeTab === 'analytics' && (
                <SchoolAnalytics 
                  onSelectStudent={(id) => setSelectedStudentId(id)} 
                  t={t} 
                />
              )}

              {activeTab === 'metrics' && (
                <ModelEvaluation t={t} />
              )}

              {activeTab === 'dataHub' && (
                <DataPipelineHub 
                  onPipelineSuccess={() => loadRiskData(filters)} 
                  t={t} 
                />
              )}
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white/80 backdrop-blur-md border-t border-slate-200/80 py-5 text-center text-xs text-slate-500 mt-auto">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold text-slate-700">StudyPulse Early-Warning Platform</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">XGBoost & SHAP Inference Engine v1.0</span>
            </div>
            <p className="text-slate-400">
              Detect Early • Explain Clearly • Act in Time
            </p>
          </div>
        </footer>
      </div>

      {/* Student Detail Modal */}
      {selectedStudentId && (
        <StudentDetailModal
          studentId={selectedStudentId}
          onClose={() => setSelectedStudentId(null)}
          onOpenIntervention={(stu) => setInterventionStudent(stu)}
          t={t}
        />
      )}

      {/* Intervention Logging Modal */}
      {interventionStudent && (
        <InterventionModal
          student={interventionStudent}
          onClose={() => setInterventionStudent(null)}
          onSuccess={() => {
            loadRiskData(filters);
            if (selectedStudentId) {
              setSelectedStudentId(selectedStudentId);
            }
          }}
          user={user}
        />
      )}

      {/* Floating AI Voice Agent */}
      <AIChatVoiceAssistant 
        currentStudentId={selectedStudentId} 
        language={language} 
      />

      {/* Groq Llama 3.3 AI Configuration Modal */}
      <GroqConfigModal
        isOpen={groqModalOpen}
        onClose={() => setGroqModalOpen(false)}
      />
    </div>
  );
}
