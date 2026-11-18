import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import RiskDashboard from './components/RiskDashboard';
import StudentDetailModal from './components/StudentDetailModal';
import InterventionModal from './components/InterventionModal';
import SchoolAnalytics from './components/SchoolAnalytics';
import ModelEvaluation from './components/ModelEvaluation';
import ParentPortal from './components/ParentPortal';
import DataPipelineHub from './components/DataPipelineHub';
import { translations } from './i18n';
import { api, setAuthToken } from './api';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [language, setLanguage] = useState('en');
  const [riskList, setRiskList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [interventionStudent, setInterventionStudent] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    risk_level: '',
    grade: '',
    section: ''
  });

  const t = translations[language] || translations.en;

  // Initial Auto-Login as Teacher (Ms. Ananya Sharma) for instant live demo experience
  useEffect(() => {
    switchUserPersona('teacher');
  }, []);

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

      // Reload risk list for new persona
      await loadRiskData(filters);
    } catch (err) {
      console.error("Auto login error:", err);
      // Fallback local demo state if backend isn't yet started
      setUser({
        role,
        user_name: role === 'admin' ? 'Principal Sharma (Admin)' : role === 'teacher' ? 'Ms. Ananya Sharma' : 'Mr. Rajesh Rao',
        assigned_grades: role === 'teacher' ? '10' : 'All',
        assigned_sections: role === 'teacher' ? 'A,B' : 'All',
        linked_student_id: 'STU-1004'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRiskData = async (activeFilters = filters) => {
    try {
      const data = await api.getRiskList(activeFilters);
      setRiskList(data);
    } catch (err) {
      console.error("Error loading risk list:", err);
    }
  };

  // Re-fetch when filters change
  useEffect(() => {
    if (user && user.role !== 'parent') {
      loadRiskData(filters);
    }
  }, [filters, user]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      <Navbar
        user={user}
        onLogout={() => switchUserPersona('teacher')}
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
              // Trigger reload in student modal
              setSelectedStudentId(selectedStudentId);
            }
          }}
          user={user}
        />
      )}
    </div>
  );
}
