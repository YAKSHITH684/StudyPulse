from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import Student, RiskScore, Attendance, Intervention, User
from ..auth import get_current_user, require_roles

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/school")
def get_school_analytics(
    current_user: User = Depends(require_roles(["admin", "teacher"])),
    db: Session = Depends(get_db)
):
    """
    Returns school-wide risk distributions across Grades and Sections,
    intervention progress, and key KPIs.
    """
    total_students = db.query(Student).count()
    risk_counts = db.query(RiskScore.risk_tier, func.count(RiskScore.id)).group_by(RiskScore.risk_tier).all()
    risk_dict = {"High": 0, "Medium": 0, "Low": 0}
    for tier, cnt in risk_counts:
        risk_dict[tier] = cnt

    # Breakdown by Grade
    grade_data = []
    grades = db.query(Student.grade).distinct().order_by(Student.grade).all()
    for (g,) in grades:
        g_students = db.query(Student.student_id).filter(Student.grade == g).subquery()
        tier_counts = db.query(RiskScore.risk_tier, func.count(RiskScore.id))\
            .filter(RiskScore.student_id.in_(g_students))\
            .group_by(RiskScore.risk_tier).all()
        g_tier_map = {t: c for t, c in tier_counts}
        grade_data.append({
            "grade": f"Grade {g}",
            "High": g_tier_map.get("High", 0),
            "Medium": g_tier_map.get("Medium", 0),
            "Low": g_tier_map.get("Low", 0),
            "total": sum(g_tier_map.values())
        })

    # Breakdown by Section
    section_data = []
    sections = db.query(Student.section).distinct().order_by(Student.section).all()
    for (sec,) in sections:
        sec_students = db.query(Student.student_id).filter(Student.section == sec).subquery()
        tier_counts = db.query(RiskScore.risk_tier, func.count(RiskScore.id))\
            .filter(RiskScore.student_id.in_(sec_students))\
            .group_by(RiskScore.risk_tier).all()
        s_tier_map = {t: c for t, c in tier_counts}
        section_data.append({
            "section": f"Section {sec}",
            "High": s_tier_map.get("High", 0),
            "Medium": s_tier_map.get("Medium", 0),
            "Low": s_tier_map.get("Low", 0),
            "total": sum(s_tier_map.values())
        })

    # Intervention stats
    interventions_total = db.query(Intervention).count()
    interventions_completed = db.query(Intervention).filter(Intervention.status == "Completed").count()
    interventions_in_progress = db.query(Intervention).filter(Intervention.status == "In Progress").count()
    interventions_planned = db.query(Intervention).filter(Intervention.status == "Planned").count()

    # Low-confidence count
    low_confidence_count = db.query(RiskScore).filter(RiskScore.has_low_confidence == True).count()

    return {
        "kpis": {
            "total_students": total_students,
            "high_risk_count": risk_dict.get("High", 0),
            "medium_risk_count": risk_dict.get("Medium", 0),
            "low_risk_count": risk_dict.get("Low", 0),
            "low_confidence_count": low_confidence_count,
            "interventions_active": interventions_in_progress + interventions_planned,
            "interventions_completed": interventions_completed
        },
        "grade_distribution": grade_data,
        "section_distribution": section_data,
        "interventions_summary": {
            "total": interventions_total,
            "planned": interventions_planned,
            "in_progress": interventions_in_progress,
            "completed": interventions_completed
        }
    }

@router.get("/anomalies")
def get_attendance_anomalies(
    current_user: User = Depends(require_roles(["admin", "teacher"])),
    db: Session = Depends(get_db)
):
    """
    Identifies sudden drops (> 20%) in attendance week-over-week.
    """
    students = db.query(Student).all()
    anomalies = []

    for s in students:
        records = db.query(Attendance).filter(Attendance.student_id == s.student_id).order_by(Attendance.week_number.desc()).limit(2).all()
        if len(records) >= 2:
            latest = records[0]
            previous = records[1]
            drop = previous.attendance_percentage - latest.attendance_percentage
            if drop >= 20.0:
                anomalies.append({
                    "student_id": s.student_id,
                    "student_name": s.name,
                    "grade": s.grade,
                    "section": s.section,
                    "previous_week_attendance": previous.attendance_percentage,
                    "current_week_attendance": latest.attendance_percentage,
                    "drop_percentage": round(drop, 1),
                    "week_number": latest.week_number
                })

    # Sort largest drop first
    anomalies.sort(key=lambda x: x["drop_percentage"], reverse=True)
    return anomalies
