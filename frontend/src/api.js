const API_BASE = "http://localhost:8000";

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
};
