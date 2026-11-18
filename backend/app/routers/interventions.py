from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Intervention, Student, RiskScore, User, AuditLog
from ..schemas import InterventionCreate, InterventionUpdate, InterventionResponse
from ..auth import get_current_user, require_roles

router = APIRouter(prefix="/interventions", tags=["Interventions"])

@router.get("", response_model=List[InterventionResponse])
def list_interventions(
    student_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Intervention)

    if current_user.role == "parent":
        if current_user.linked_student_id:
            query = query.filter(Intervention.student_id == current_user.linked_student_id)
        else:
            return []
    elif current_user.role == "teacher" and current_user.assigned_sections != "All":
        allowed = [s.strip() for s in current_user.assigned_sections.split(",")]
        query = query.join(Student, Intervention.student_id == Student.student_id).filter(Student.section.isin(allowed))

    if student_id:
        query = query.filter(Intervention.student_id == student_id)
    if status:
        query = query.filter(Intervention.status == status)
    if category:
        query = query.filter(Intervention.category == category)

    return query.order_by(Intervention.created_at.desc()).all()

@router.post("", response_model=InterventionResponse, status_code=status.HTTP_201_CREATED)
def create_intervention(
    item: InterventionCreate,
    current_user: User = Depends(require_roles(["admin", "teacher"])),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.student_id == item.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Fetch latest risk score for baseline
    latest_risk = db.query(RiskScore).filter(RiskScore.student_id == item.student_id).order_by(RiskScore.calculated_at.desc()).first()
    risk_before = latest_risk.risk_probability if latest_risk else None

    intervention = Intervention(
        student_id=item.student_id,
        action_type=item.action_type,
        category=item.category,
        urgency=item.urgency,
        description=item.description,
        assigned_to=item.assigned_to or current_user.full_name,
        status="Planned",
        outcome="Pending",
        risk_score_before=risk_before
    )
    db.add(intervention)
    db.commit()
    db.refresh(intervention)

    # Audit log
    audit = AuditLog(
        user_email=current_user.email,
        action="CREATE_INTERVENTION",
        resource_type="INTERVENTION",
        resource_id=str(intervention.id),
        details=f"Created {intervention.action_type} for student {item.student_id}"
    )
    db.add(audit)
    db.commit()

    return intervention

@router.patch("/{intervention_id}", response_model=InterventionResponse)
def update_intervention_outcome(
    intervention_id: int,
    update: InterventionUpdate,
    current_user: User = Depends(require_roles(["admin", "teacher"])),
    db: Session = Depends(get_db)
):
    intervention = db.query(Intervention).filter(Intervention.id == intervention_id).first()
    if not intervention:
        raise HTTPException(status_code=404, detail="Intervention not found")

    if update.status is not None:
        intervention.status = update.status
    if update.outcome is not None:
        intervention.outcome = update.outcome
    if update.outcome_notes is not None:
        intervention.outcome_notes = update.outcome_notes
    if update.risk_score_after is not None:
        intervention.risk_score_after = update.risk_score_after

    db.commit()
    db.refresh(intervention)

    # Audit log
    audit = AuditLog(
        user_email=current_user.email,
        action="UPDATE_INTERVENTION",
        resource_type="INTERVENTION",
        resource_id=str(intervention.id),
        details=f"Updated intervention {intervention.id}: Status={intervention.status}, Outcome={intervention.outcome}"
    )
    db.add(audit)
    db.commit()

    return intervention
