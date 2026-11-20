const API_BASE = import.meta.env.VITE_API_BASE || 
  (typeof window !== 'undefined' && (window.location.port === '5173' || window.location.port === '3000') ? 'http://localhost:8000' : '');

let authToken = localStorage.getItem("studypulse_token") || "";

export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    localStorage.setItem("studypulse_token", token);
  } else {
    localStorage.removeItem("studypulse_token");
  }
};

export const getAuthToken = () => authToken;

const authHeaders = () => {
  const headers = { "Content-Type": "application/json" };
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }
  return headers;
};

export const api = {
  // Auth
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Login failed");
    }
    const data = await res.json();
    setAuthToken(data.access_token);
    return data;
  },

  register: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Registration failed");
    }
    const data = await res.json();
    setAuthToken(data.access_token);
    return data;
  },

  forgotPassword: async (email) => {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Password reset request failed");
    }
    return res.json();
  },

  resetPassword: async (email, resetToken, newPassword) => {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, reset_token: resetToken, new_password: newPassword }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Password reset failed");
    }
    return res.json();
  },

  getCurrentUser: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to get profile");
    return res.json();
  },

  // Risk List
  getRiskList: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.risk_level) params.append("risk_level", filters.risk_level);
    if (filters.grade) params.append("grade", filters.grade);
    if (filters.section) params.append("section", filters.section);
    if (filters.search) params.append("search", filters.search);

    const res = await fetch(`${API_BASE}/risk?${params.toString()}`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load risk list");
    return res.json();
  },

  // Student details
  getStudentDetail: async (studentId) => {
    const res = await fetch(`${API_BASE}/students/${studentId}`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load student");
    return res.json();
  },

  getSuggestions: async (studentId) => {
    const res = await fetch(`${API_BASE}/students/${studentId}/suggestions`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load suggestions");
    return res.json();
  },

  runWhatIf: async (studentId, adjustments) => {
    const res = await fetch(`${API_BASE}/students/${studentId}/what-if`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(adjustments),
    });
    if (!res.ok) throw new Error("Failed to run simulation");
    return res.json();
  },

  // Interventions
  createIntervention: async (data) => {
    const res = await fetch(`${API_BASE}/interventions`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create intervention");
    return res.json();
  },

  updateIntervention: async (id, data) => {
    const res = await fetch(`${API_BASE}/interventions/${id}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update intervention");
    return res.json();
  },

  listInterventions: async (studentId = null) => {
    const url = studentId ? `${API_BASE}/interventions?student_id=${studentId}` : `${API_BASE}/interventions`;
    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error("Failed to load interventions");
    return res.json();
  },

  // School Analytics & Anomalies
  getSchoolAnalytics: async () => {
    const res = await fetch(`${API_BASE}/analytics/school`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load analytics");
    return res.json();
  },

  getAnomalies: async () => {
    const res = await fetch(`${API_BASE}/analytics/anomalies`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load anomalies");
    return res.json();
  },

  // Model Metrics
  getModelMetrics: async () => {
    const res = await fetch(`${API_BASE}/metrics`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load metrics");
    return res.json();
  },

  // Data Pipeline
  generateSynthetic: async (numStudents = 250, numWeeks = 8) => {
    const res = await fetch(`${API_BASE}/data/generate-synthetic?num_students=${numStudents}&num_weeks=${numWeeks}`, {
      method: "POST",
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to generate data");
    return res.json();
  },

  runPipeline: async () => {
    const res = await fetch(`${API_BASE}/pipeline/run`, {
      method: "POST",
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to run pipeline");
    return res.json();
  },

  uploadCsv: async (file, datasetType) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("dataset_type", datasetType);

    const headers = {};
    if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

    const res = await fetch(`${API_BASE}/data/upload`, {
      method: "POST",
      headers,
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to upload CSV");
    return res.json();
  },

  getExportLabelsUrl: () => `${API_BASE}/export/labels`,
  getSampleCsvUrl: (datasetType) => `${API_BASE}/data/sample/${datasetType}`,

  quickLoadSample: async (datasetType) => {
    const formData = new FormData();
    formData.append("dataset_type", datasetType);

    const headers = {};
    if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

    const res = await fetch(`${API_BASE}/data/quick-load-sample`, {
      method: "POST",
      headers,
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to quick load sample data");
    return res.json();
  },

  // AI Chat & Voice Assistant
  sendMessage: async (message, studentId = null, language = "en") => {
    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ message, student_id: studentId, language }),
    });
    if (!res.ok) throw new Error("Chat request failed");
    return res.json();
  },

  // Predictive Dropout Timeline
  getStudentTimeline: async (studentId) => {
    const res = await fetch(`${API_BASE}/students/${studentId}/timeline`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load timeline");
    return res.json();
  },

  // AI Personalized Study Planner & Tutor
  getStudyPlan: async (studentId, hours = 1.5) => {
    const res = await fetch(`${API_BASE}/tutor/study-plan`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ student_id: studentId, target_hours_per_day: hours }),
    });
    if (!res.ok) throw new Error("Failed to generate study plan");
    return res.json();
  },

  explainConcept: async (subject, topic, grade = 10, language = "en") => {
    const res = await fetch(`${API_BASE}/tutor/explain`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ subject, topic, grade, language }),
    });
    if (!res.ok) throw new Error("Failed to explain concept");
    return res.json();
  },

  getPracticeQuestion: async (subject, topic, difficulty = "Medium", language = "en") => {
    const res = await fetch(`${API_BASE}/tutor/practice-question`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ subject, topic, difficulty, language }),
    });
    if (!res.ok) throw new Error("Failed to get practice question");
    return res.json();
  },

  // Multilingual & Document Intelligence Suite
  getSupportedLanguages: async () => {
    const res = await fetch(`${API_BASE}/multilingual/languages`);
    if (!res.ok) throw new Error("Failed to load supported languages");
    return res.json();
  },

  detectLanguage: async (text) => {
    const res = await fetch(`${API_BASE}/multilingual/detect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error("Failed to detect language");
    return res.json();
  },

  processDocumentIntel: async (documentText, targetLanguage = "en") => {
    const res = await fetch(`${API_BASE}/multilingual/document-intel`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ document_text: documentText, target_language: targetLanguage }),
    });
    if (!res.ok) throw new Error("Document analysis failed");
    return res.json();
  },

  getMultilingualQuiz: async (subject, topic, language = "en") => {
    const res = await fetch(`${API_BASE}/multilingual/quiz`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ subject, topic, language }),
    });
    if (!res.ok) throw new Error("Quiz generation failed");
    return res.json();
  },

  generateParentAlert: async (studentId, targetLanguage = "hi") => {
    const res = await fetch(`${API_BASE}/multilingual/parent-alert`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ student_id: studentId, target_language: targetLanguage }),
    });
    if (!res.ok) throw new Error("Parent alert generation failed");
    return res.json();
  },

  translateInsight: async (studentId, targetLanguage) => {
    const res = await fetch(`${API_BASE}/multilingual/translate-insight`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ student_id: studentId, target_language: targetLanguage }),
    });
    if (!res.ok) throw new Error("Translation failed");
    return res.json();
  },

  // Groq Llama LLM Integration
  getGroqStatus: async () => {
    const res = await fetch(`${API_BASE}/llm/status`);
    if (!res.ok) throw new Error("Failed to fetch Groq status");
    return res.json();
  },

  updateGroqConfig: async (apiKey, model = "llama-3.3-70b-versatile", persist = true) => {
    const res = await fetch(`${API_BASE}/llm/config`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ api_key: apiKey, model, persist }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Failed to configure Groq API key");
    }
    return res.json();
  },

  testGroqConnection: async (apiKey = null) => {
    const res = await fetch(`${API_BASE}/llm/test`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: apiKey }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Connection test failed");
    }
    return res.json();
  },
};
