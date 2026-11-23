export const getApiBase = () => {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('studypulse_api_base');
    if (custom) return custom.replace(/\/$/, '');
  }

  let envBase = import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL;
  if (envBase) {
    envBase = envBase.trim().replace(/\/$/, '');
    if (!envBase.startsWith('http://') && !envBase.startsWith('https://')) {
      envBase = 'https://' + envBase;
    }
    return envBase;
  }

  if (typeof window !== 'undefined') {
    if (window.location.port === '5173' || window.location.port === '3000') {
      return 'http://localhost:8000';
    }
    if (window.location.hostname.includes('onrender.com') && window.location.hostname.includes('frontend')) {
      const backendHost = window.location.hostname.replace('frontend', 'backend');
      return 'https://' + backendHost;
    }
  }

  return '';
};

export const setApiBase = (url) => {
  if (typeof window !== 'undefined') {
    if (url) {
      let clean = url.trim().replace(/\/$/, '');
      if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
        clean = 'https://' + clean;
      }
      localStorage.setItem('studypulse_api_base', clean);
    } else {
      localStorage.removeItem('studypulse_api_base');
    }
  }
};

export const API_BASE = getApiBase();


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
    const res = await fetch(`${getApiBase()}/auth/login`, {
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
    const res = await fetch(`${getApiBase()}/auth/register`, {
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
    const res = await fetch(`${getApiBase()}/auth/forgot-password`, {
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
    const res = await fetch(`${getApiBase()}/auth/reset-password`, {
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
    const res = await fetch(`${getApiBase()}/auth/me`, {
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

    const res = await fetch(`${getApiBase()}/risk?${params.toString()}`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load risk list");
    return res.json();
  },

  // Student details
  getStudentDetail: async (studentId) => {
    const res = await fetch(`${getApiBase()}/students/${studentId}`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load student");
    return res.json();
  },

  getSuggestions: async (studentId) => {
    const res = await fetch(`${getApiBase()}/students/${studentId}/suggestions`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load suggestions");
    return res.json();
  },

  runWhatIf: async (studentId, adjustments) => {
    const res = await fetch(`${getApiBase()}/students/${studentId}/what-if`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(adjustments),
    });
    if (!res.ok) throw new Error("Failed to run simulation");
    return res.json();
  },

  // Interventions
  createIntervention: async (data) => {
    const res = await fetch(`${getApiBase()}/interventions`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create intervention");
    return res.json();
  },

  updateIntervention: async (id, data) => {
    const res = await fetch(`${getApiBase()}/interventions/${id}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update intervention");
    return res.json();
  },

  listInterventions: async (studentId = null) => {
    const url = studentId ? `${getApiBase()}/interventions?student_id=${studentId}` : `${getApiBase()}/interventions`;
    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error("Failed to load interventions");
    return res.json();
  },

  // School Analytics & Anomalies
  getSchoolAnalytics: async () => {
    const res = await fetch(`${getApiBase()}/analytics/school`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load analytics");
    return res.json();
  },

  getAnomalies: async () => {
    const res = await fetch(`${getApiBase()}/analytics/anomalies`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load anomalies");
    return res.json();
  },

  // Model Metrics
  getModelMetrics: async () => {
    const res = await fetch(`${getApiBase()}/metrics`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load metrics");
    return res.json();
  },

  // Data Pipeline
  generateSynthetic: async (numStudents = 250, numWeeks = 8) => {
    const res = await fetch(`${getApiBase()}/data/generate-synthetic?num_students=${numStudents}&num_weeks=${numWeeks}`, {
      method: "POST",
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to generate data");
    return res.json();
  },

  runPipeline: async () => {
    const res = await fetch(`${getApiBase()}/pipeline/run`, {
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

    const res = await fetch(`${getApiBase()}/data/upload`, {
      method: "POST",
      headers,
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to upload CSV");
    return res.json();
  },

  getExportLabelsUrl: () => `${getApiBase()}/export/labels`,
  getSampleCsvUrl: (datasetType) => `${getApiBase()}/data/sample/${datasetType}`,

  quickLoadSample: async (datasetType) => {
    const formData = new FormData();
    formData.append("dataset_type", datasetType);

    const headers = {};
    if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

    const res = await fetch(`${getApiBase()}/data/quick-load-sample`, {
      method: "POST",
      headers,
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to quick load sample data");
    return res.json();
  },

  // AI Chat & Voice Assistant
  sendMessage: async (message, studentId = null, language = "en") => {
    const res = await fetch(`${getApiBase()}/chat`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ message, student_id: studentId, language }),
    });
    if (!res.ok) throw new Error("Chat request failed");
    return res.json();
  },

  // Predictive Dropout Timeline
  getStudentTimeline: async (studentId) => {
    const res = await fetch(`${getApiBase()}/students/${studentId}/timeline`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load timeline");
    return res.json();
  },

  // AI Personalized Study Planner & Tutor
  getStudyPlan: async (studentId, hours = 1.5) => {
    const res = await fetch(`${getApiBase()}/tutor/study-plan`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ student_id: studentId, target_hours_per_day: hours }),
    });
    if (!res.ok) throw new Error("Failed to generate study plan");
    return res.json();
  },

  explainConcept: async (subject, topic, grade = 10, language = "en") => {
    const res = await fetch(`${getApiBase()}/tutor/explain`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ subject, topic, grade, language }),
    });
    if (!res.ok) throw new Error("Failed to explain concept");
    return res.json();
  },

  getPracticeQuestion: async (subject, topic, difficulty = "Medium", language = "en") => {
    const res = await fetch(`${getApiBase()}/tutor/practice-question`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ subject, topic, difficulty, language }),
    });
    if (!res.ok) throw new Error("Failed to get practice question");
    return res.json();
  },

  // Multilingual & Document Intelligence Suite
  getSupportedLanguages: async () => {
    const res = await fetch(`${getApiBase()}/multilingual/languages`);
    if (!res.ok) throw new Error("Failed to load supported languages");
    return res.json();
  },

  detectLanguage: async (text) => {
    const res = await fetch(`${getApiBase()}/multilingual/detect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error("Failed to detect language");
    return res.json();
  },

  processDocumentIntel: async (documentText, targetLanguage = "en") => {
    const res = await fetch(`${getApiBase()}/multilingual/document-intel`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ document_text: documentText, target_language: targetLanguage }),
    });
    if (!res.ok) throw new Error("Document analysis failed");
    return res.json();
  },

  getMultilingualQuiz: async (subject, topic, language = "en") => {
    const res = await fetch(`${getApiBase()}/multilingual/quiz`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ subject, topic, language }),
    });
    if (!res.ok) throw new Error("Quiz generation failed");
    return res.json();
  },

  generateParentAlert: async (studentId, targetLanguage = "hi") => {
    const res = await fetch(`${getApiBase()}/multilingual/parent-alert`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ student_id: studentId, target_language: targetLanguage }),
    });
    if (!res.ok) throw new Error("Parent alert generation failed");
    return res.json();
  },

  translateInsight: async (studentId, targetLanguage) => {
    const res = await fetch(`${getApiBase()}/multilingual/translate-insight`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ student_id: studentId, target_language: targetLanguage }),
    });
    if (!res.ok) throw new Error("Translation failed");
    return res.json();
  },

  // Groq Llama LLM Integration
  getGroqStatus: async () => {
    const res = await fetch(`${getApiBase()}/llm/status`);
    if (!res.ok) throw new Error("Failed to fetch Groq status");
    return res.json();
  },

  updateGroqConfig: async (apiKey, model = "llama-3.3-70b-versatile", persist = true) => {
    const res = await fetch(`${getApiBase()}/llm/config`, {
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
    const res = await fetch(`${getApiBase()}/llm/test`, {
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
