import io
import json
import os
import pandas as pd
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException, Response
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Student, RiskScore, Attendance, Marks, User, AuditLog
from ..schemas import RiskScoreResponse, ModelMetricsResponse
from ..auth import get_current_user, require_roles
from ..ml.model_trainer import MODEL_DIR

router = APIRouter(tags=["Risk & Evaluation"])

@router.get("/risk", response_model=List[RiskScoreResponse])
def get_ranked_risk_list(
    risk_level: Optional[str] = Query(None, description="Filter by Low, Medium, High"),
    grade: Optional[int] = Query(None, description="Filter by Grade 9, 10, 11, 12"),
    section: Optional[str] = Query(None, description="Filter by Section A, B, C"),
    search: Optional[str] = Query(None, description="Search by student name or ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(RiskScore, Student).join(Student, RiskScore.student_id == Student.student_id)

    # Role-based restriction: Teachers only see their assigned sections unless "All"
    if current_user.role == "teacher":
        if current_user.assigned_sections != "All":
            allowed_secs = [s.strip() for s in current_user.assigned_sections.split(",")]
            query = query.filter(Student.section.isin(allowed_secs))
        if current_user.assigned_grades != "All":
            allowed_grs = [int(g.strip()) for g in current_user.assigned_grades.split(",")]
            query = query.filter(Student.grade.isin(allowed_grs))
    elif current_user.role == "parent":
        # Parent can only see their linked child
        if current_user.linked_student_id:
            query = query.filter(Student.student_id == current_user.linked_student_id)
        else:
            return []

    if risk_level:
        query = query.filter(RiskScore.risk_tier == risk_level.capitalize())
    if grade:
        query = query.filter(Student.grade == grade)
    if section:
        query = query.filter(Student.section == section.upper())
    if search:
        search_pattern = f"%{search}%"
        query = query.filter((Student.name.ilike(search_pattern)) | (Student.student_id.ilike(search_pattern)))

    # Order ranked: highest risk probability first
    results = query.order_by(RiskScore.risk_probability.desc()).all()

    response_items = []
    for r_score, stu in results:
        # Get latest attendance & marks average
        latest_att = db.query(Attendance.attendance_percentage).filter(Attendance.student_id == stu.student_id).order_by(Attendance.week_number.desc()).first()
        latest_att_val = latest_att[0] if latest_att else 75.0

        latest_marks = db.query(Marks.score).filter(Marks.student_id == stu.student_id).order_by(Marks.week_number.desc()).limit(4).all()
        latest_marks_avg = round(sum([m[0] for m in latest_marks]) / len(latest_marks), 1) if latest_marks else 70.0

        # top_factors_json is already JSON parsed or needs json.loads
        factors = r_score.top_factors_json
        if isinstance(factors, str):
            factors = json.loads(factors)

        response_items.append(RiskScoreResponse(
            student_id=stu.student_id,
            student_name=stu.name,
            grade=stu.grade,
            section=stu.section,
            risk_probability=round(r_score.risk_probability, 3),
            risk_tier=r_score.risk_tier,
            risk_trend=r_score.risk_trend,
            top_factors=factors,
            has_low_confidence=r_score.has_low_confidence,
            confidence_score=r_score.confidence_score,
            latest_attendance_pct=latest_att_val,
            latest_marks_avg=latest_marks_avg,
            calculated_at=r_score.calculated_at
        ))

    return response_items

@router.get("/metrics", response_model=ModelMetricsResponse)
def get_model_evaluation_metrics(
    current_user: User = Depends(require_roles(["admin", "teacher"])),
    db: Session = Depends(get_db)
):
    """
    Returns model evaluation metrics: Recall, Precision@Top-K, Calibration, ROC-AUC, Confusion Matrix.
    """
    latest_meta_path = os.path.join(MODEL_DIR, "latest_model.json")
    if not os.path.exists(latest_meta_path):
        raise HTTPException(status_code=404, detail="Model metrics not found. Run the prediction pipeline first.")

    with open(latest_meta_path, "r") as f:
        meta = json.load(f)

    metrics = meta.get("metrics", {})
    return metrics

@router.get("/export/labels")
def export_training_labels(
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    """
    Exports student features and risk labels for external audit or retraining.
    """
    records = db.query(RiskScore, Student).join(Student, RiskScore.student_id == Student.student_id).all()
    rows = []
    for r_score, stu in records:
        rows.append({
            "student_id": stu.student_id,
            "student_name": stu.name,
            "grade": stu.grade,
            "section": stu.section,
            "risk_probability": r_score.risk_probability,
            "risk_tier": r_score.risk_tier,
            "risk_trend": r_score.risk_trend,
            "has_low_confidence": r_score.has_low_confidence,
            "confidence_score": r_score.confidence_score,
            "calculated_at": r_score.calculated_at.isoformat()
        })

    df = pd.DataFrame(rows)
    stream = io.StringIO()
    df.to_csv(stream, index=False)

    return Response(
        content=stream.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=studypulse_risk_labels.csv"}
    )
