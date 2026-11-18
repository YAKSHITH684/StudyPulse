import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="teacher")  # admin, teacher, parent
    assigned_grades = Column(String(100), default="All")          # e.g. "9,10" or "All"
    assigned_sections = Column(String(100), default="All")        # e.g. "A,B" or "All"
    linked_student_id = Column(String(50), nullable=True)         # for parents
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class Student(Base):
    __tablename__ = "students"

    student_id = Column(String(50), primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    grade = Column(Integer, nullable=False, index=True)
    section = Column(String(10), nullable=False, index=True)
    gender = Column(String(20), nullable=True)
    parent_name = Column(String(255), nullable=True)
    parent_phone = Column(String(50), nullable=True)
    parent_email = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    attendance = relationship("Attendance", back_populates="student", cascade="all, delete-orphan")
    marks = relationship("Marks", back_populates="student", cascade="all, delete-orphan")
    behavior = relationship("Behavior", back_populates="student", cascade="all, delete-orphan")
    engagement = relationship("Engagement", back_populates="student", cascade="all, delete-orphan")
    risk_scores = relationship("RiskScore", back_populates="student", cascade="all, delete-orphan")
    interventions = relationship("Intervention", back_populates="student", cascade="all, delete-orphan")


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(50), ForeignKey("students.student_id"), nullable=False, index=True)
    week_number = Column(Integer, nullable=False, index=True)
    week_date = Column(String(50), nullable=False)
    days_total = Column(Integer, default=5)
    days_present = Column(Integer, default=5)
    days_absent = Column(Integer, default=0)
    days_late = Column(Integer, default=0)
    attendance_percentage = Column(Float, nullable=False)

    student = relationship("Student", back_populates="attendance")


class Marks(Base):
    __tablename__ = "marks"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(50), ForeignKey("students.student_id"), nullable=False, index=True)
    week_number = Column(Integer, nullable=False, index=True)
    week_date = Column(String(50), nullable=False)
    subject = Column(String(100), nullable=False)
    score = Column(Float, nullable=False)
    max_score = Column(Float, default=100.0)
    class_average = Column(Float, default=70.0)

    student = relationship("Student", back_populates="marks")


class Behavior(Base):
    __tablename__ = "behavior"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(50), ForeignKey("students.student_id"), nullable=False, index=True)
    week_number = Column(Integer, nullable=False, index=True)
    week_date = Column(String(50), nullable=False)
    incident_count = Column(Integer, default=0)
    severity_score = Column(Integer, default=0)
    late_arrivals = Column(Integer, default=0)
    notes = Column(Text, nullable=True)

    student = relationship("Student", back_populates="behavior")


class Engagement(Base):
    __tablename__ = "engagement"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(50), ForeignKey("students.student_id"), nullable=False, index=True)
    week_number = Column(Integer, nullable=False, index=True)
    week_date = Column(String(50), nullable=False)
    portal_logins = Column(Integer, default=0)
    assignments_assigned = Column(Integer, default=4)
    assignments_completed = Column(Integer, default=4)
    late_submissions = Column(Integer, default=0)
    engagement_score = Column(Float, default=75.0)

    student = relationship("Student", back_populates="engagement")


class RiskScore(Base):
    __tablename__ = "risk_scores"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(50), ForeignKey("students.student_id"), nullable=False, index=True)
    model_version = Column(String(50), nullable=False, default="v1.0.0")
    risk_probability = Column(Float, nullable=False)
    risk_tier = Column(String(20), nullable=False, index=True)  # Low, Medium, High
    risk_trend = Column(String(20), default="Stable")           # Increasing, Stable, Decreasing
    top_factors_json = Column(JSON, nullable=False)             # Top 3 plain language SHAP reasons
    has_low_confidence = Column(Boolean, default=False)
    confidence_score = Column(Float, default=1.0)
    calculated_at = Column(DateTime, default=datetime.datetime.utcnow)

    student = relationship("Student", back_populates="risk_scores")


class Intervention(Base):
    __tablename__ = "interventions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(50), ForeignKey("students.student_id"), nullable=False, index=True)
    action_type = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)             # Academic, Attendance, Behavioral, Engagement
    urgency = Column(String(50), default="Medium")             # Low, Medium, High
    description = Column(Text, nullable=True)
    assigned_to = Column(String(255), nullable=True)
    status = Column(String(50), default="Planned")             # Planned, In Progress, Completed, Cancelled
    outcome = Column(String(50), default="Pending")            # Pending, Successful, Moderate Improvement, No Change
    outcome_notes = Column(Text, nullable=True)
    risk_score_before = Column(Float, nullable=True)
    risk_score_after = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    student = relationship("Student", back_populates="interventions")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="info")                  # alert, warning, info, success
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notifications")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String(255), nullable=False)
    action = Column(String(100), nullable=False)               # LOGIN, RUN_PIPELINE, UPLOAD_DATA, CREATE_INTERVENTION, UPDATE_INTERVENTION
    resource_type = Column(String(100), nullable=True)
    resource_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
