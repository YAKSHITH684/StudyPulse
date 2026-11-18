import os
import sys
import json
import pandas as pd

# Add app to path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database import engine, Base, SessionLocal
from app.models import User, Student, Attendance, Marks, Behavior, Engagement, RiskScore, Intervention, AuditLog
from app.auth import get_password_hash
from app.ml.data_generator import generate_synthetic_school_data
from app.ml.feature_engineering import extract_student_features, FEATURE_COLUMNS
from app.ml.model_trainer import RiskModelTrainer
from app.ml.explainer import ShapExplainerService
from app.ml.interventions_rules import recommend_interventions

def run_seed():
    print("=" * 60)
    print("StudyPulse - Initializing Database & Seed Pipeline")
    print("=" * 60)

    # 1. Create tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # 2. Reset old tables
    print("[1/6] Cleaning existing student and score records...")
    db.query(Intervention).delete()
    db.query(RiskScore).delete()
    db.query(Attendance).delete()
    db.query(Marks).delete()
    db.query(Behavior).delete()
    db.query(Engagement).delete()
    db.query(Student).delete()
    db.query(AuditLog).delete()
    db.commit()

    # 3. Create Default Users
    print("[2/6] Ensuring default demonstration users...")
    users = [
        User(
            email="admin@studypulse.edu",
            hashed_password=get_password_hash("Admin@123"),
            full_name="Principal Sharma (Academic Director)",
            role="admin",
            assigned_grades="All",
            assigned_sections="All"
        ),
        User(
            email="teacher@studypulse.edu",
            hashed_password=get_password_hash("Teacher@123"),
            full_name="Ms. Ananya Sharma (Grade 10 Lead)",
            role="teacher",
            assigned_grades="10",
            assigned_sections="A,B"
        ),
        User(
            email="parent@studypulse.edu",
            hashed_password=get_password_hash("Parent@123"),
            full_name="Mr. Rajesh Rao (Parent of Aryan Rao)",
            role="parent",
            assigned_grades="",
            assigned_sections="",
            linked_student_id="STU-1004"
        )
    ]
    for u in users:
        existing = db.query(User).filter(User.email == u.email).first()
        if not existing:
            db.add(u)
        else:
            existing.linked_student_id = u.linked_student_id
            existing.role = u.role
            existing.assigned_grades = u.assigned_grades
            existing.assigned_sections = u.assigned_sections
    db.commit()

    # 4. Generate Synthetic Data
    print("[3/6] Generating 250 synthetic student profiles over 8 weeks (seed=42)...")
    students_df, att_df, marks_df, beh_df, eng_df = generate_synthetic_school_data(
        num_students=250, num_weeks=8, seed=42
    )

    # Ensure STU-1004 is Aryan Rao in Grade 10 Section A
    idx_1004 = students_df.index[students_df['student_id'] == 'STU-1004']
    if len(idx_1004) > 0:
        students_df.loc[idx_1004[0], 'name'] = 'Aryan Rao'
        students_df.loc[idx_1004[0], 'grade'] = 10
        students_df.loc[idx_1004[0], 'section'] = 'A'
        students_df.loc[idx_1004[0], 'parent_name'] = 'Mr. Rajesh Rao'

    # Bulk insert
    print("  Inserting students...")
    students_to_add = [
        Student(
            student_id=s["student_id"],
            name=s["name"],
            grade=int(s["grade"]),
            section=s["section"],
            gender=s["gender"],
            parent_name=s["parent_name"],
            parent_phone=s["parent_phone"],
            parent_email=s["parent_email"]
        ) for _, s in students_df.iterrows()
    ]
    db.bulk_save_objects(students_to_add)
    db.commit()

    print("  Inserting attendance...")
    att_to_add = [
        Attendance(
            student_id=a["student_id"],
            week_number=int(a["week_number"]),
            week_date=a["week_date"],
            days_total=int(a["days_total"]),
            days_present=int(a["days_present"]),
            days_absent=int(a["days_absent"]),
            days_late=int(a["days_late"]),
            attendance_percentage=float(a["attendance_percentage"])
        ) for _, a in att_df.iterrows()
    ]
    db.bulk_save_objects(att_to_add)
    db.commit()

    print("  Inserting marks...")
    marks_to_add = [
        Marks(
            student_id=m["student_id"],
            week_number=int(m["week_number"]),
            week_date=m["week_date"],
            subject=m["subject"],
            score=float(m["score"]),
            max_score=float(m["max_score"]),
            class_average=float(m["class_average"])
        ) for _, m in marks_df.iterrows()
    ]
    db.bulk_save_objects(marks_to_add)
    db.commit()

    print("  Inserting behavior...")
    beh_to_add = [
        Behavior(
            student_id=b["student_id"],
            week_number=int(b["week_number"]),
            week_date=b["week_date"],
            incident_count=int(b["incident_count"]),
            severity_score=int(b["severity_score"]),
            late_arrivals=int(b["late_arrivals"]),
            notes=b.get("notes", "")
        ) for _, b in beh_df.iterrows()
    ]
    db.bulk_save_objects(beh_to_add)
    db.commit()

    print("  Inserting engagement...")
    eng_to_add = [
        Engagement(
            student_id=e["student_id"],
            week_number=int(e["week_number"]),
            week_date=e["week_date"],
            portal_logins=int(e["portal_logins"]),
            assignments_assigned=int(e["assignments_assigned"]),
            assignments_completed=int(e["assignments_completed"]),
            late_submissions=int(e["late_submissions"]),
            engagement_score=float(e["engagement_score"])
        ) for _, e in eng_df.iterrows()
    ]
    db.bulk_save_objects(eng_to_add)
    db.commit()

    # 5. Extract Features & Train XGBoost Model
    print("[4/6] Extracting 4-week features and training XGBoost model...")
    features_df = extract_student_features(students_df, att_df, marks_df, beh_df, eng_df)
    trainer = RiskModelTrainer(model_version="v1.0.0")
    metrics = trainer.train(features_df)
    print(f"  Model trained! ROC-AUC: {metrics['roc_auc']}, Recall: {metrics['recall']}, High-Risk Recall: {metrics['high_risk_recall']}, Precision@Top20: {metrics['precision_at_top_20']}")

    # 6. Predict & Compute SHAP Explanations
    print("[5/6] Generating XGBoost predictions and 3 SHAP explanations per student...")
    explainer_service = ShapExplainerService(trainer.explainer, FEATURE_COLUMNS)
    X_all = features_df[FEATURE_COLUMNS]
    all_probs = trainer.model.predict_proba(X_all)[:, 1]

    risk_scores_to_add = []
    high_risk_students = []

    for idx, row in features_df.iterrows():
        prob = float(all_probs[idx])
        if prob >= 0.65:
            tier = "High"
            high_risk_students.append(row["student_id"])
        elif prob >= 0.35:
            tier = "Medium"
        else:
            tier = "Low"

        combined_slope = row["attendance_trend_4w"] * 0.5 + row["marks_delta_3tests"] * 0.5
        if combined_slope <= -5.0:
            trend = "Increasing"
        elif combined_slope >= 5.0:
            trend = "Decreasing"
        else:
            trend = "Stable"

        # Plain language SHAP explanations (EXACTLY 3)
        top_reasons = explainer_service.explain_student(row, prob, tier)

        risk_scores_to_add.append(RiskScore(
            student_id=row["student_id"],
            model_version=trainer.model_version,
            risk_probability=round(prob, 4),
            risk_tier=tier,
            risk_trend=trend,
            top_factors_json=top_reasons,
            has_low_confidence=bool(row["has_low_confidence"]),
            confidence_score=float(row["confidence_score"])
        ))

    db.bulk_save_objects(risk_scores_to_add)
    db.commit()

    # 7. Seed Sample Interventions for demonstration
    print("[6/6] Seeding sample interventions for high-risk students...")
    sample_interventions = [
        Intervention(
            student_id="STU-1004",  # Aryan Rao
            action_type="Remedial Subject Coaching & Study Buddy",
            category="Academic",
            urgency="High",
            description="Enrolled in afternoon Mathematics foundation workshop and paired with peer mentor.",
            assigned_to="Ms. Ananya Sharma",
            status="In Progress",
            outcome="Moderate Improvement",
            outcome_notes="Attendance improved in week 7; math quiz score up by 12 points.",
            risk_score_before=0.74,
            risk_score_after=0.58
        )
    ]

    # Add a couple more interventions for top at-risk students
    for sid in high_risk_students[:3]:
        if sid != "STU-1004":
            sample_interventions.append(Intervention(
                student_id=sid,
                action_type="Attendance Contract & Counselor Daily Check-in",
                category="Attendance",
                urgency="High",
                description="Daily morning check-in to identify commute obstacles and track punctuality.",
                assigned_to="Counselor Verma",
                status="Planned",
                outcome="Pending",
                risk_score_before=0.82
            ))

    db.add_all(sample_interventions)
    db.commit()

    print("=" * 60)
    print("StudyPulse Database Seed Completed Successfully!")
    print(f"Total Students: {len(students_df)}")
    print(f"High-Risk Students: {len(high_risk_students)}")
    print("Demo Logins:")
    print("  Admin:   admin@studypulse.edu   / Admin@123")
    print("  Teacher: teacher@studypulse.edu / Teacher@123 (Grade 10, Sec A&B)")
    print("  Parent:  parent@studypulse.edu  / Parent@123  (Linked: STU-1004 Aryan Rao)")
    print("=" * 60)
    db.close()

if __name__ == "__main__":
    run_seed()
