# StudyPulse – AI Early-Warning System for Student Dropout

**Tagline:** *Detect Early. Explain Clearly. Act in Time.*

---

## 🚀 Quick Start (One-Click)

You can launch both the **FastAPI Backend** and the **React Dashboard** with a single click:

### Option A: Double-Click Batch File (Recommended on Windows)
Simply double-click or run:
```cmd
run.bat
```

### Option B: PowerShell
```powershell
.\run.ps1
```

Once started:
- **Frontend Dashboard:** [http://localhost:5173](http://localhost:5173)
- **Backend Swagger API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🛠️ Manual Terminal Commands

If you prefer running services in separate terminal windows:

### 1. Backend (FastAPI + XGBoost + SHAP)
```powershell
# Set Python path to backend and start server
$env:PYTHONPATH = "backend"
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend (React + Vite + Tailwind CSS)
```powershell
cd frontend
npm run dev
```

---

## 🔑 Demo Personas & Credentials

The system includes pre-configured demo personas with built-in Role-Based Access Control (RBAC):

| Role | Email | Password | Assigned Scope & Permissions |
|---|---|---|---|
| **Admin** | `admin@studypulse.edu` | `Admin@123` | School-wide cohort, CSV upload, pipeline re-runs, audit trail |
| **Teacher** | `teacher@studypulse.edu` | `Teacher@123` | **Ms. Ananya Sharma**: Section-restricted (Grade 10, Sections A & B) |
| **Parent** | `parent@studypulse.edu` | `Parent@123` | **Mr. Rajesh Rao**: Restricted solely to linked child **Aryan Rao** (`STU-1004`) |

> **Pro Tip:** In the top navigation bar, use the **1-click Persona Switcher** ("Admin", "Teacher", "Parent") to switch roles instantly during jury demonstrations without typing passwords.

---

## ⚡ Groq Llama 3.3 Integration

StudyPulse is powered by ultra-fast **Groq Llama 3.3 70B** (`llama-3.3-70b-versatile`) and **Llama 3.1 8B** (`llama-3.1-8b-instant`) for sub-second generative reasoning:

1. **How to Add Your Groq API Key**:
   - **Option 1 (Interactive UI Modal)**: Click the **"Groq Llama 3.3"** button in the top navigation bar, paste your `gsk_...` key, test connection latency, and click **Save & Activate**.
   - **Option 2 (.env file)**: Add your key in `.env`:
     ```env
     GROQ_API_KEY=gsk_your_groq_api_key_here
     GROQ_MODEL=llama-3.3-70b-versatile
     ```
   - Get a free Groq API key in 30 seconds at [console.groq.com/keys](https://console.groq.com/keys).

2. **Zero-Crash Graceful Fallback**:
   - If no Groq key is provided, the platform automatically runs on high-fidelity built-in heuristic/rule-based intelligence without throwing errors.

---

## 🧠 AI/ML Highlights (Spec Sheet Compliance)

1. **Continuous Logistic Target Calibration**: Balanced risk cohorts (High ~17%, Medium Watchlist ~19%, Low ~64%) preventing early intervention collapse.
2. **Explainable AI (SHAP)**: Every single student prediction produces **exactly three plain-language contributing reasons** with ranked percentage impact weights.
3. **What-If Simulator**: Real-time slider simulator allowing teachers to see how improving attendance (+15%), remedial coaching (+10 marks), or homework punctuality reduces the student's risk probability.
4. **All 22 Indian Scheduled + Regional Languages**: Full support for Assamese, Bengali, Bodo, Dogri, Gujarati, Hindi, Kannada, Kashmiri, Konkani, Maithili, Malayalam, Manipuri, Marathi, Nepali, Odia, Punjabi, Sanskrit, Santali, Sindhi, Tamil, Telugu, Urdu, and regional dialects (Tulu, Bhojpuri, Rajasthani, Khasi, Garo, Mizo, Kokborok) with code-mixing heuristics and Indic OCR.
5. **Data Confidence Flags**: Low-confidence indicators for students with incomplete records (< 3 weeks of data).

---

## 🧪 Testing

To run the automated validation test suite:
```powershell
$env:PYTHONPATH = "backend"
python -m pytest backend\tests\test_indic_nlp.py backend\tests\test_groq_integration.py -v
```
All tests pass verifying Indic NLP scripts, code-mixing detection, Groq Llama configuration, and fallback reliability.
