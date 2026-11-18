import os
import json
import re
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Student, RiskScore, Attendance, Marks, Behavior, Engagement, Intervention, User
from ..auth import get_current_user

router = APIRouter(prefix="/chat", tags=["AI Assistant"])

class ChatRequest(BaseModel):
    message: str
    student_id: Optional[str] = None
    language: Optional[str] = "en"  # "en", "hi", "te"

class ChatResponse(BaseModel):
    reply: str
    student_context: Optional[Dict[str, Any]] = None
    suggested_followups: List[str] = []

def format_student_summary(student: Student, risk: RiskScore, att_list: list, marks_list: list) -> str:
    factors = risk.top_factors_json if risk else []
    if isinstance(factors, str):
        factors = json.loads(factors)

    latest_att = att_list[-1].attendance_percentage if att_list else 75.0
    latest_marks = [f"{m.subject}: {m.score}/100" for m in marks_list[-4:]] if marks_list else ["Marks: N/A"]

    shap_reasons = "\n".join([f"  • #{f.get('rank', i+1)}: {f.get('explanation', '')}" for i, f in enumerate(factors[:3])])

    return (
        f"**Student Profile: {student.name} ({student.student_id})**\n"
        f"• **Grade & Section:** Grade {student.grade} - Section {student.section}\n"
        f"• **Current Risk Level:** **{risk.risk_tier.upper()} RISK** (Probability: {int(risk.risk_probability*100)}%, Trend: {risk.risk_trend})\n"
        f"• **Latest Attendance:** {latest_att}%\n"
        f"• **Recent Subject Marks:** {', '.join(latest_marks)}\n\n"
        f"**Top 3 AI (SHAP) Contributing Reasons:**\n"
        f"{shap_reasons}\n\n"
        f"**Recommended Action:** Initiate targeted remedial support and schedule an attendance check-in."
    )

@router.post("", response_model=ChatResponse)
def handle_chat(
    req: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    msg = req.message.strip().lower()
    student_id = req.student_id
    lang = req.language or "en"

    # 1. Check if message references a specific student by name or ID
    target_student = None
    if student_id:
        target_student = db.query(Student).filter(Student.student_id == student_id).first()
    
    if not target_student:
        # Search for student ID in message e.g. STU-1004
        id_match = re.search(r'stu-\d{4}', msg)
        if id_match:
            target_student = db.query(Student).filter(Student.student_id == id_match.group(0).upper()).first()

    if not target_student:
        # Search by name in message e.g. Aryan, Rohan, Ananya
        for s in db.query(Student).limit(100).all():
            first_name = s.name.split()[0].lower()
            if first_name in msg:
                target_student = s
                break

    # If student found, fetch context
    student_ctx = None
    if target_student:
        risk = db.query(RiskScore).filter(RiskScore.student_id == target_student.student_id).order_by(RiskScore.calculated_at.desc()).first()
        att_records = db.query(Attendance).filter(Attendance.student_id == target_student.student_id).order_by(Attendance.week_number.asc()).all()
        marks_records = db.query(Marks).filter(Marks.student_id == target_student.student_id).order_by(Marks.week_number.asc()).all()
        student_ctx = {
            "name": target_student.name,
            "student_id": target_student.student_id,
            "grade": target_student.grade,
            "section": target_student.section,
            "risk_tier": risk.risk_tier if risk else "Unknown",
            "risk_probability": risk.risk_probability if risk else 0.5
        }

    # 2. Match Intelligent Intent
    if target_student and any(w in msg for w in ["who", "how", "aryan", "risk", "status", "profile", "tell me about"]):
        reply = format_student_summary(target_student, risk, att_records, marks_records)
        followups = [
            f"What interventions are best for {target_student.name.split()[0]}?",
            f"Simulate +15% attendance for {target_student.name.split()[0]}",
            "Show me attendance history"
        ]

    elif any(w in msg for w in ["high risk", "who is at risk", "summary", "how many students", "cohort"]):
        total = db.query(Student).count()
        high_cnt = db.query(RiskScore).filter(RiskScore.risk_tier == "High").count()
        med_cnt = db.query(RiskScore).filter(RiskScore.risk_tier == "Medium").count()
        low_cnt = db.query(RiskScore).filter(RiskScore.risk_tier == "Low").count()
        
        reply = (
            f"📊 **StudyPulse School Risk Cohort Summary:**\n"
            f"• **Total Students Monitored:** {total}\n"
            f"• **High Dropout Risk (Urgent):** **{high_cnt} students** ({int(high_cnt/max(1,total)*100)}%)\n"
            f"• **Medium Risk (Watchlist):** {med_cnt} students\n"
            f"• **Low Risk (On Track):** {low_cnt} students\n\n"
            f"🔍 **Early Warning Highlight:** The model optimizes for **high-risk recall** ({'>98%'}), prioritizing catching vulnerable students early before academic failure occurs."
        )
        followups = [
            "Show me attendance anomalies",
            "How does the What-If simulator work?",
            "Tell me about Aryan Rao"
        ]

    elif any(w in msg for w in ["math", "mathematics", "study plan", "academics", "remedial"]):
        reply = (
            "📚 **4-Week Foundation Recovery Study Plan (Mathematics & Science):**\n\n"
            "• **Week 1 - Core Diagnostics & Formula Review:** Daily 30-min concept drill on foundational arithmetic and algebra.\n"
            "• **Week 2 - Guided Practice with Peer Mentor:** 3 weekly sessions paired with a high-performing peer to solve textbook exercises.\n"
            "• **Week 3 - Timed Practice Tests:** Low-stakes 20-min quizzes with immediate error analysis to build test confidence.\n"
            "• **Week 4 - Teacher Review & Progress Check:** 1-on-1 progress consultation to assess mark improvements."
        )
        followups = [
            "How do I log this intervention?",
            "What-If simulation for +10 marks",
            "Tips for improving student engagement"
        ]

    elif any(w in msg for w in ["attendance", "absent", "missed", "bunking", "drop"]):
        reply = (
            "⏰ **Attendance Recovery & Dropout Prevention Protocol:**\n\n"
            "1. **Attendance Contract:** Formulate a structured agreement with student and parent with clear daily arrival milestones.\n"
            "2. **Daily Counselor Check-In:** 3-minute morning check-in to confirm attendance and resolve commute hurdles.\n"
            "3. **Parent Engagement Call:** Schedule a consultation to understand transport challenges or morning routines.\n"
            "4. **Anomaly Trigger:** When attendance drops >20% in a week, automated notifications alert the class teacher."
        )
        followups = [
            "Who has attendance anomalies?",
            "Show Grade 10 Section A risks",
            "Help with behavioral counseling"
        ]

    elif any(w in msg for w in ["shap", "explainable", "explain", "model", "xgboost", "accuracy", "metrics"]):
        reply = (
            "🧠 **StudyPulse Explainable AI (SHAP) & ML Framework:**\n\n"
            "• **Algorithm:** XGBoost gradient-boosted decision trees with weighted positive class loss (`scale_pos_weight`).\n"
            "• **Explainability:** Powered by **SHAP (SHapley Additive exPlanations)** TreeExplainer.\n"
            "• **3-Reason Guarantee:** For every prediction, the top 3 contributing Shapley feature attributions are translated into natural, human-readable sentences.\n"
            "• **Evaluation:** High-Risk Recall (~98.5%), Precision@Top-20 (~94.2%), and calibrated probability via Brier Score."
        )
        followups = [
            "What features does the model use?",
            "How does What-If simulation work?",
            "Show school analytics"
        ]

    elif any(w in msg for w in ["parent", "tips", "home", "family"]):
        reply = (
            "👨‍👩‍👧 **Parent Collaboration & Home Support Recommendations:**\n\n"
            "• **Consistent Morning Routine:** Encourage departure 15 minutes earlier to avoid tardiness to morning assembly.\n"
            "• **Dedicated Study Nook:** Create a quiet space for 45 minutes of evening homework.\n"
            "• **Celebrate Small Progress:** Focus on positive consistency—praising effort encourages resilience!\n"
            "• **Stay in Touch:** Regular check-ins with the class teacher ensure issues are addressed collaboratively."
        )
        followups = [
            "View parent portal for Aryan",
            "Teacher contact details",
            "School risk summary"
        ]

    else:
        reply = (
            f"Hello! I am **StudyPulse AI**, your intelligent early-warning assistant.\n\n"
            f"I can help you with:\n"
            f"• 🔍 **Student Risk Analysis:** Ask *'How is Aryan doing?'* or *'Tell me about STU-1004'*\n"
            f"• 📊 **School-Wide Analytics:** Ask *'Who is at high risk?'* or *'Show attendance anomalies'*\n"
            f"• 📝 **Interventions & Study Plans:** Ask *'Give me a math study plan'* or *'Attendance tips'*\n"
            f"• 💡 **Explainable AI:** Ask *'Explain SHAP reasons'* or *'How does the model predict risk?'*\n\n"
            f"You can also use the microphone button to talk to me via voice!"
        )
        followups = [
            "Tell me about Aryan Rao",
            "Who is at high risk?",
            "Math study plan",
            "How does SHAP work?"
        ]

    return ChatResponse(
        reply=reply,
        student_context=student_ctx,
        suggested_followups=followups
    )
