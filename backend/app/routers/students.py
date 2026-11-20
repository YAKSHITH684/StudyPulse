import json
from typing import List, Optional
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import (
    Student, Attendance, Marks, Behavior, Engagement, RiskScore, Intervention, User
)
from ..schemas import (
    StudentDetailResponse, StudentBase, AttendanceRecord, MarksRecord,
    BehaviorRecord, EngagementRecord, RiskScoreResponse, WhatIfRequest, WhatIfResponse
)
from ..auth import get_current_user
from ..ml.interventions_rules import recommend_interventions
from ..ml.simulator import simulate_what_if
from ..ml.model_trainer import RiskModelTrainer
from ..ml.feature_engineering import extract_student_features, FEATURE_COLUMNS
from ..ml.timeline import calculate_predictive_timeline

router = APIRouter(prefix="/students", tags=["Students"])

@router.get("/{student_id}", response_model=StudentDetailResponse)
def get_student_detail(
    student_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail=f"Student {student_id} not found")

    # Authorization checks
    if current_user.role == "parent":
        if current_user.linked_student_id != student_id:
            raise HTTPException(status_code=403, detail="Parents may only view their linked child's profile.")
    elif current_user.role == "teacher":
        if current_user.assigned_sections != "All":
            allowed = [s.strip() for s in current_user.assigned_sections.split(",")]
            if student.section not in allowed:
                raise HTTPException(status_code=403, detail="Access denied: Student is outside your assigned sections.")

    # Fetch histories
    att_records = db.query(Attendance).filter(Attendance.student_id == student_id).order_by(Attendance.week_number.asc()).all()
    marks_records = db.query(Marks).filter(Marks.student_id == student_id).order_by(Marks.week_number.asc()).all()
    beh_records = db.query(Behavior).filter(Behavior.student_id == student_id).order_by(Behavior.week_number.asc()).all()
    eng_records = db.query(Engagement).filter(Engagement.student_id == student_id).order_by(Engagement.week_number.asc()).all()
    interventions = db.query(Intervention).filter(Intervention.student_id == student_id).order_by(Intervention.created_at.desc()).all()
    latest_risk = db.query(RiskScore).filter(RiskScore.student_id == student_id).order_by(RiskScore.calculated_at.desc()).first()

    risk_response = None
    if latest_risk:
        factors = latest_risk.top_factors_json
        if isinstance(factors, str):
            factors = json.loads(factors)
        latest_att_pct = att_records[-1].attendance_percentage if att_records else 75.0
        latest_marks_avg = round(sum([m.score for m in marks_records[-4:]]) / max(1, len(marks_records[-4:])), 1) if marks_records else 70.0

        risk_response = RiskScoreResponse(
            student_id=student.student_id,
            student_name=student.name,
            grade=student.grade,
            section=student.section,
            risk_probability=round(latest_risk.risk_probability, 3),
            risk_tier=latest_risk.risk_tier,
            risk_trend=latest_risk.risk_trend,
            top_factors=factors,
            has_low_confidence=latest_risk.has_low_confidence,
            confidence_score=latest_risk.confidence_score,
            latest_attendance_pct=latest_att_pct,
            latest_marks_avg=latest_marks_avg,
            calculated_at=latest_risk.calculated_at
        )

    return StudentDetailResponse(
        student=StudentBase(
            student_id=student.student_id,
            name=student.name,
            grade=student.grade,
            section=student.section,
            gender=student.gender,
            parent_name=student.parent_name,
            parent_phone=student.parent_phone,
            parent_email=student.parent_email
        ),
        risk_score=risk_response,
        attendance_history=[
            AttendanceRecord(
                week_number=a.week_number,
                week_date=a.week_date,
                days_total=a.days_total,
                days_present=a.days_present,
                days_absent=a.days_absent,
                days_late=a.days_late,
                attendance_percentage=a.attendance_percentage
            ) for a in att_records
        ],
        marks_history=[
            MarksRecord(
                week_number=m.week_number,
                week_date=m.week_date,
                subject=m.subject,
                score=m.score,
                max_score=m.max_score,
                class_average=m.class_average
            ) for m in marks_records
        ],
        behavior_history=[
            BehaviorRecord(
                week_number=b.week_number,
                week_date=b.week_date,
                incident_count=b.incident_count,
                severity_score=b.severity_score,
                late_arrivals=b.late_arrivals,
                notes=b.notes
            ) for b in beh_records
        ],
        engagement_history=[
            EngagementRecord(
                week_number=e.week_number,
                week_date=e.week_date,
                portal_logins=e.portal_logins,
                assignments_assigned=e.assignments_assigned,
                assignments_completed=e.assignments_completed,
                late_submissions=e.late_submissions,
                engagement_score=e.engagement_score
            ) for e in eng_records
        ],
        interventions=[
            {
                "id": i.id,
                "action_type": i.action_type,
                "category": i.category,
                "urgency": i.urgency,
                "description": i.description,
                "assigned_to": i.assigned_to,
                "status": i.status,
                "outcome": i.outcome,
                "outcome_notes": i.outcome_notes,
                "created_at": i.created_at.isoformat()
            } for i in interventions
        ]
    )

@router.get("/{student_id}/suggestions")
def get_intervention_suggestions(
    student_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    risk_score = db.query(RiskScore).filter(RiskScore.student_id == student_id).order_by(RiskScore.calculated_at.desc()).first()
    if not risk_score:
        return []

    factors = risk_score.top_factors_json
    if isinstance(factors, str):
        factors = json.loads(factors)

    suggestions = recommend_interventions(
        top_reasons=factors,
        risk_tier=risk_score.risk_tier
    )
    return suggestions

@router.post("/{student_id}/what-if", response_model=WhatIfResponse)
def run_student_what_if_simulation(
    student_id: str,
    adjustments: WhatIfRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Simulates how improvements in attendance, marks, behavior, or homework
    would alter the student's predicted risk score.
    """
    trainer = RiskModelTrainer.load_latest()
    if not trainer or trainer.model is None:
        raise HTTPException(status_code=500, detail="ML Model not loaded.")

    # Re-extract features for this student
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    att_records = db.query(Attendance).filter(Attendance.student_id == student_id).all()
    marks_records = db.query(Marks).filter(Marks.student_id == student_id).all()
    beh_records = db.query(Behavior).filter(Behavior.student_id == student_id).all()
    eng_records = db.query(Engagement).filter(Engagement.student_id == student_id).all()

    att_df = pd.DataFrame([a.__dict__ for a in att_records])
    marks_df = pd.DataFrame([m.__dict__ for m in marks_records])
    beh_df = pd.DataFrame([b.__dict__ for b in beh_records])
    eng_df = pd.DataFrame([e.__dict__ for e in eng_records])
    stu_df = pd.DataFrame([{
        "student_id": student.student_id,
        "name": student.name,
        "grade": student.grade,
        "section": student.section
    }])

    feat_df = extract_student_features(stu_df, att_df, marks_df, beh_df, eng_df)
    if feat_df.empty:
        raise HTTPException(status_code=400, detail="Could not extract features for student.")

    feature_row = feat_df.iloc[0]

    adj_dict = adjustments.dict()
    simulation_result = simulate_what_if(
        trainer.model,
        feature_row,
        FEATURE_COLUMNS,
        adj_dict
    )
    return simulation_result

@router.get("/{student_id}/timeline")
def get_student_predictive_timeline(
    student_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    risk = db.query(RiskScore).filter(RiskScore.student_id == student_id).order_by(RiskScore.calculated_at.desc()).first()
    prob = risk.risk_probability if risk else 0.5

    att_records = db.query(Attendance).filter(Attendance.student_id == student_id).order_by(Attendance.week_number.asc()).all()
    marks_records = db.query(Marks).filter(Marks.student_id == student_id).order_by(Marks.week_number.asc()).all()

    att_trend = 0.0
    if len(att_records) >= 2:
        att_trend = att_records[-1].attendance_percentage - att_records[0].attendance_percentage

    marks_delta = 0.0
    if len(marks_records) >= 2:
        marks_delta = marks_records[-1].score - marks_records[0].score

    timeline_data = calculate_predictive_timeline(
        current_probability=prob,
        attendance_trend=att_trend,
        marks_delta=marks_delta,
        weeks_ahead=4
    )

    return {
        "student_id": student.student_id,
        "student_name": student.name,
        "grade": student.grade,
        "section": student.section,
        **timeline_data
    }
