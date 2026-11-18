# STUDYPULSE – TECHNICAL SPECIFICATION SHEET

**AI Early-Warning System for Student Dropout**  
**Event:** PRASUNEX INNOVATHON 2026 – Round 3  
**Team Lead:** Anandapu Yakshith

**Tagline:** Detect Early. Explain Clearly. Act in Time.

## 1. Project Overview

StudyPulse is an AI-powered student dropout early-warning platform that analyzes attendance, academic performance, behavior and engagement to identify students at risk of dropping out.

The system predicts risk, explains the reasons, recommends interventions and tracks outcomes to improve future predictions.

## 2. Core Objectives

- Identify students at risk before academic failure.
- Predict Low, Medium and High dropout-risk levels.
- Explain predictions using Explainable AI (SHAP).
- Recommend personalized interventions.
- Enable teachers to track student progress.
- Improve future predictions using intervention feedback.

## 3. Core Functional Modules

| Module | Requirements |
|---|---|
| Data Management | CSV upload and synthetic data generation |
| Data Processing | Validation, cleaning and missing-value handling |
| Feature Engineering | Weekly student performance indicators |
| AI Prediction | XGBoost-based risk scoring |
| Explainable AI | Top 3 SHAP-based reasons |
| Risk Dashboard | Ranked and filterable student list |
| Student Profile | Risk history and performance trends |
| Intervention Engine | Suggested support actions |
| Feedback System | Intervention outcome tracking |
| Authentication | JWT and role-based access |

## 4. Advanced Features

1. **Predictive Timeline:** Estimate upcoming risk changes.
2. **Risk Trend Monitoring:** Track weekly changes in student risk.
3. **What-If Simulator:** Simulate how improved attendance or marks affect risk.
4. **Personalized Intervention Engine:** Recommend actions based on individual risk factors.
5. **Attendance Anomaly Detection:** Identify sudden attendance drops.
6. **AI Student Assistant:** Provide academic guidance and study support.
7. **Parent Engagement Portal:** Display student progress and recommended support.
8. **Multilingual Support:** Support Indian languages.
9. **School Analytics:** Identify high-risk grades and sections.
10. **Intervention Effectiveness:** Measure whether support actions improve outcomes.

*Advanced features are proposed upgrades; prioritize the original core prototype first.*

## 5. User Roles

- **Admin:** School-wide analytics, student management, uploads and audit logs.
- **Teacher:** Ranked risk list, student explanations and intervention logging.
- **Parent:** Child's progress, supportive recommendations and teacher contact.

Access must be restricted according to each user's assigned permissions.

## 6. Data Inputs

- Attendance: Present, Absent, Late.
- Marks: Tests, assignments and subject performance.
- Behavior: Late arrivals and incidents.
- Engagement: Weekly activity and login counts.

### Feature Engineering

- Four-week attendance trend.
- Marks trend compared with class average.
- Late-submission rate.
- Change across the last three tests.
- Behavior incident count and severity.
- Weekly engagement statistics.

## 7. AI/ML Specification

| Component | Implementation |
|---|---|
| Algorithm | XGBoost |
| Preprocessing | Scikit-learn |
| Explainability | SHAP |
| Input | Weekly student feature vectors |
| Output | Risk probability (0–1) |
| Classification | Low / Medium / High |
| Validation | Time-based train/test split |
| Optimization | High-risk recall |
| Evaluation | Recall, Precision@Top-K, Calibration |
| Model Management | Versioned model and SHAP explainer |

Every prediction must return exactly three understandable contributing reasons.

## 8. System Architecture

**Data Sources → Processing Pipeline → AI Risk Engine → Explainability → Intervention Engine → Dashboard → Feedback Loop**

### Backend Services
- Data ingestion and validation.
- Weekly feature generation.
- ML prediction service.
- SHAP explanation service.
- Intervention management.
- Authentication and authorization.
- Notification service.

### Frontend
- Login dashboard.
- Teacher risk dashboard.
- Student detail page.
- Intervention management.
- Parent portal.
- Admin analytics.

## 9. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, Tailwind CSS, Recharts |
| Backend | Python, FastAPI |
| Machine Learning | XGBoost, Scikit-learn |
| Explainable AI | SHAP |
| Data Processing | Pandas, NumPy |
| Database | PostgreSQL |
| Authentication | JWT, RBAC |
| Notifications | SMTP, SMS Gateway |
| CI/CD | GitHub Actions |
| Delpoyment | render |

## 10. Database Design

Core tables:

- Students
- Attendance
- Marks
- Behavior
- Engagement
- RiskScore
- Intervention
- Users
- Notifications
- AuditLogs

Use anonymized student IDs, model versions and school identifiers.

## 11. API Specification

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /auth/login | User authentication |
| POST | /data/upload | CSV upload |
| POST | /pipeline/run | Run prediction pipeline |
| GET | /risk | Ranked risk list |
| GET | /students/{id} | Student details |
| GET | /students/{id}/suggestions | Intervention suggestions |
| POST | /interventions | Create intervention |
| PATCH | /interventions/{id} | Update outcome |
| GET | /metrics | Model evaluation |
| GET | /export/labels | Export training labels |

## 12. Security and Privacy

- JWT authentication.
- Role and section-based access restrictions.
- Anonymized student identifiers.
- Password hashing.
- Audit logging.
- Secure environment variables.
- HTTPS for hosted deployment.
- Consent and retention controls aligned with India's DPDP Act.
- No sensitive attributes as model inputs.
- Human review before intervention decisions.

## 13. Non-Functional Requirements

- Dashboard list loads within 2 seconds.
- Weekly scoring of a school with a few thousand students completes within minutes.
- Missing data generates low-confidence flags.
- Reproducible synthetic datasets using fixed random seeds.
- Automated unit and API testing.
- Laptop and tablet-compatible interface.

## 14. Testing Requirements

- CSV validation and data-quality tests.
- Feature engineering correctness.
- Model leakage prevention.
- SHAP explanation validation.
- Authentication and authorization tests.
- Intervention logging and export tests.
- End-to-end workflow testing.
- Dashboard usability testing.

## 15. Acceptance Criteria

- Synthetic school data loads successfully.
- Risk predictions produce Low, Medium and High categories.
- Every flagged student has exactly three plain-language reasons.
- Teachers only access assigned sections.
- Parents only access their linked child.
- Interventions and outcomes can be recorded.
- Evaluation displays recall, precision@top-k and calibration.
- Complete demonstration runs without manual fixes.

## 16. Development Timeline

| Phase | Dates | Deliverables |
|---|---|---|
| Model Development | 18–20 Nov | Data generator, features, XGBoost, SHAP |
| API & UI | 21–23 Nov | Backend, dashboard, authentication |
| Integration | 24–25 Nov | Testing, evaluation and final submission |
| Finale | 1 Dec | Live demonstration and jury Q&A |

## 17. Expected Impact

- Early identification of dropout risk.
- Better teacher decision-making.
- Personalized student support.
- Improved parent-teacher communication.
- Measurable intervention effectiveness.
- Better student retention over time.

## 18. Project Scope Priority

**P0 – Essential:** Data processing, prediction, SHAP explanations, ranked dashboard, authentication and intervention logging.

**P1 – Important:** Parent/Admin views, intervention recommendations, evaluation page and low-confidence indicators.

**P2 – Future Enhancements:** AI student assistant, multilingual support, what-if simulator and predictive timeline.

---

**Final Product Vision:** A unified AI-powered early-warning platform that helps schools identify struggling students, understand their challenges and provide support before it is too late.

*Note: The prototype uses synthetic data. Its evaluation demonstrates the methodology, not proven real-world dropout prediction accuracy.*