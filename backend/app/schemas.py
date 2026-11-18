from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr
from datetime import datetime

# --- Authentication Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_name: str
    email: str
    assigned_grades: str
    assigned_sections: str
    linked_student_id: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    assigned_grades: str
    assigned_sections: str
    linked_student_id: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True

# --- Student Schemas ---
class StudentBase(BaseModel):
    student_id: str
    name: str
    grade: int
    section: str
    gender: Optional[str] = None
    parent_name: Optional[str] = None
    parent_phone: Optional[str] = None
    parent_email: Optional[str] = None

class StudentResponse(StudentBase):
    is_active: bool
    created_at: datetime
    latest_risk: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

# --- Attendance, Marks, Behavior, Engagement Schemas ---
class AttendanceRecord(BaseModel):
    week_number: int
    week_date: str
    days_total: int
    days_present: int
    days_absent: int
    days_late: int
    attendance_percentage: float

class MarksRecord(BaseModel):
    week_number: int
    week_date: str
    subject: str
    score: float
    max_score: float
    class_average: float

class BehaviorRecord(BaseModel):
    week_number: int
    week_date: str
    incident_count: int
    severity_score: int
    late_arrivals: int
    notes: Optional[str] = None

class EngagementRecord(BaseModel):
    week_number: int
    week_date: str
    portal_logins: int
    assignments_assigned: int
    assignments_completed: int
    late_submissions: int
    engagement_score: float

# --- Risk & SHAP Schemas ---
class ShapReason(BaseModel):
    rank: int
    feature: str
    label: str
    feature_value: float
    shap_value: float
    weight_percentage: float
    impact_direction: str
    explanation: str

class RiskScoreResponse(BaseModel):
    student_id: str
    student_name: str
    grade: int
    section: str
    risk_probability: float
    risk_tier: str
    risk_trend: str
    top_factors: List[ShapReason]
    has_low_confidence: bool
    confidence_score: float
    latest_attendance_pct: float
    latest_marks_avg: float
    calculated_at: datetime

# --- Student Detail Extended ---
class StudentDetailResponse(BaseModel):
    student: StudentBase
    risk_score: Optional[RiskScoreResponse] = None
    attendance_history: List[AttendanceRecord]
    marks_history: List[MarksRecord]
    behavior_history: List[BehaviorRecord]
    engagement_history: List[EngagementRecord]
    interventions: List[Any]

# --- Intervention Schemas ---
class InterventionCreate(BaseModel):
    student_id: str
    action_type: str
    category: str
    urgency: str = "Medium"
    description: Optional[str] = None
    assigned_to: Optional[str] = None

class InterventionUpdate(BaseModel):
    status: Optional[str] = None
    outcome: Optional[str] = None
    outcome_notes: Optional[str] = None
    risk_score_after: Optional[float] = None

class InterventionResponse(BaseModel):
    id: int
    student_id: str
    action_type: str
    category: str
    urgency: str
    description: Optional[str]
    assigned_to: Optional[str]
    status: str
    outcome: str
    outcome_notes: Optional[str]
    risk_score_before: Optional[float]
    risk_score_after: Optional[float]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- What-If Simulator Schema ---
class WhatIfRequest(BaseModel):
    attendance_delta: float = 0.0
    marks_delta: float = 0.0
    late_submission_delta: float = 0.0
    behavior_incident_delta: float = 0.0
    engagement_login_delta: float = 0.0

class WhatIfResponse(BaseModel):
    baseline_probability: float
    baseline_risk_tier: str
    simulated_probability: float
    simulated_risk_tier: str
    risk_delta: float
    risk_reduction_percentage: float
    improved_status: bool

# --- Model Metrics Schema ---
class CalibrationBin(BaseModel):
    bin: int
    predicted_probability: float
    actual_probability: float

class ModelMetricsResponse(BaseModel):
    model_version: str
    training_samples: int
    test_samples: int
    roc_auc: float
    recall: float
    precision: float
    high_risk_recall: float
    precision_at_top_20: float
    brier_score: float
    confusion_matrix: List[List[int]]
    calibration_curve: List[CalibrationBin]
    trained_at: str

# --- Audit Log Schema ---
class AuditLogResponse(BaseModel):
    id: int
    user_email: str
    action: str
    resource_type: Optional[str]
    resource_id: Optional[str]
    details: Optional[str]
    timestamp: datetime

    class Config:
        from_attributes = True
