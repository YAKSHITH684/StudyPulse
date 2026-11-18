import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import RiskDashboard from './components/RiskDashboard';
import StudentDetailModal from './components/StudentDetailModal';
import InterventionModal from './components/InterventionModal';
import SchoolAnalytics from './components/SchoolAnalytics';
import ModelEvaluation from './components/ModelEvaluation';
import ParentPortal from './components/ParentPortal';
import DataPipelineHub from './components/DataPipelineHub';
import LoginPage from './components/LoginPage';
import AIChatVoiceAssistant from './components/AIChatVoiceAssistant';
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      <Navbar
        user={user}
        onLogout={handleLogout}
        onSwitchRole={switchUserPersona}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        language={language}
        setLanguage={setLanguage}
        t={t}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {user?.role === 'parent' || activeTab === 'parentPortal' ? (
          <ParentPortal user={user} t={t} />
        ) : (
          <>
            {activeTab === 'dashboard' && (
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
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-700">StudyPulse • AI Early-Warning System for Student Dropout</p>
        <p className="mt-0.5 text-slate-400">PRASUNEX INNOVATHON 2026 – Round 3 • Team Lead: Anandapu Yakshith</p>
      </footer>

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
    </div>
  );
}
