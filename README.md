# StudyPulse – AI Early-Warning System for Student Dropout

**Event:** PRASUNEX INNOVATHON 2026 – Round 3  
**Team Lead:** Anandapu Yakshith  
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

## 🧠 AI/ML Highlights (Spec Sheet Compliance)

1. **High-Risk Recall Optimization**: XGBoost objective configured with class weighting (`scale_pos_weight`) to ensure vulnerable students are flagged before academic failure occurs.
2. **Explainable AI (SHAP)**: Every single student prediction produces **exactly three plain-language contributing reasons** with ranked percentage impact weights.
3. **What-If Simulator**: Real-time slider simulator allowing teachers to see how improving attendance (+15%), remedial coaching (+10 marks), or homework punctuality reduces the student's risk probability.
4. **Attendance Anomaly Detection**: Automatic feed flagging sudden drops (> 20% week-over-week).
5. **Multilingual Interface**: Instant switcher between **English**, **Hindi (हिंदी)**, and **Telugu (తెలుగు)**.
6. **Data Confidence Flags**: Low-confidence indicators for students with incomplete records (< 3 weeks of data).

---

## 🧪 Testing

To run the automated ML validation test suite:
```powershell
$env:PYTHONPATH = "backend"
python -m pytest backend\tests\test_ml.py -v
```
All 5 tests pass verifying synthetic generation, feature engineering, model training, SHAP 3-reason guarantees, and the What-If simulation engine.
