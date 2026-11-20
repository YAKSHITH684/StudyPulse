import os
import json
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Student, Attendance, Marks, Behavior, Engagement, RiskScore, AuditLog, User
from ..auth import require_roles, get_current_user
from ..ml.data_generator import generate_synthetic_school_data
from ..ml.feature_engineering import extract_student_features, FEATURE_COLUMNS
from ..ml.model_trainer import RiskModelTrainer
from ..ml.explainer import ShapExplainerService

SAMPLE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "sample_datasets"))

router = APIRouter(tags=["Data & Pipeline"])

@router.post("/data/generate-synthetic")
def generate_and_seed_synthetic_data(
    num_students: int = 250,
    num_weeks: int = 8,
    seed: int = 42,
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    """
    Generates synthetic school dataset with multi-week attendance, marks, behavior, and engagement.
    """
    students_df, att_df, marks_df, beh_df, eng_df = generate_synthetic_school_data(
        num_students=num_students, num_weeks=num_weeks, seed=seed
    )

    # Clear old data records (except users and audit logs)
    db.query(RiskScore).delete()
    db.query(Attendance).delete()
    db.query(Marks).delete()
    db.query(Behavior).delete()
    db.query(Engagement).delete()
    db.query(Student).delete()
    db.commit()

    # Bulk insert Students
    students_to_add = []
    for _, s in students_df.iterrows():
        students_to_add.append(Student(
            student_id=s["student_id"],
            name=s["name"],
            grade=int(s["grade"]),
            section=s["section"],
            gender=s["gender"],
            parent_name=s["parent_name"],
            parent_phone=s["parent_phone"],
            parent_email=s["parent_email"]
        ))
    db.bulk_save_objects(students_to_add)
    db.commit()

    # Bulk insert Attendance
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

    # Bulk insert Marks
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

    # Bulk insert Behavior
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

    # Bulk insert Engagement
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

    audit = AuditLog(
        user_email=current_user.email,
        action="GENERATE_SYNTHETIC_DATA",
        resource_type="DATABASE",
        details=f"Generated {num_students} synthetic students over {num_weeks} weeks with seed {seed}"
    )
    db.add(audit)
    db.commit()

    return {
        "status": "success",
        "message": f"Successfully generated {num_students} students with {num_weeks} weeks of historical data.",
        "students_count": len(students_to_add),
        "attendance_rows": len(att_to_add),
        "marks_rows": len(marks_to_add),
        "behavior_rows": len(beh_to_add),
        "engagement_rows": len(eng_to_add)
    }

@router.post("/pipeline/run")
def run_prediction_and_shap_pipeline(
    current_user: User = Depends(require_roles(["admin", "teacher"])),
    db: Session = Depends(get_db)
):
    """
    Executes end-to-end pipeline:
    1. Feature engineering across 4-week window
    2. XGBoost model training and validation (optimized for high-risk recall)
    3. Probability and Risk Tier prediction (Low, Medium, High)
    4. SHAP TreeExplainer generation with EXACTLY 3 plain-language reasons
    5. Persistence to database
    """
    students = db.query(Student).all()
    if not students:
        raise HTTPException(status_code=400, detail="No students in database. Please generate synthetic data or upload CSV first.")

    att_records = db.query(Attendance).all()
    marks_records = db.query(Marks).all()
    beh_records = db.query(Behavior).all()
    eng_records = db.query(Engagement).all()

    students_df = pd.DataFrame([{
        "student_id": s.student_id,
        "name": s.name,
        "grade": s.grade,
        "section": s.section
    } for s in students])

    att_df = pd.DataFrame([{
        "student_id": a.student_id,
        "week_number": a.week_number,
        "week_date": a.week_date,
        "days_total": a.days_total,
        "days_present": a.days_present,
        "days_absent": a.days_absent,
        "days_late": a.days_late,
        "attendance_percentage": a.attendance_percentage
    } for a in att_records])

    marks_df = pd.DataFrame([{
        "student_id": m.student_id,
        "week_number": m.week_number,
        "week_date": m.week_date,
        "subject": m.subject,
        "score": m.score,
        "max_score": m.max_score,
        "class_average": m.class_average
    } for m in marks_records])

    beh_df = pd.DataFrame([{
        "student_id": b.student_id,
        "week_number": b.week_number,
        "week_date": b.week_date,
        "incident_count": b.incident_count,
        "severity_score": b.severity_score,
        "late_arrivals": b.late_arrivals,
        "notes": b.notes
    } for b in beh_records])

    eng_df = pd.DataFrame([{
        "student_id": e.student_id,
        "week_number": e.week_number,
        "week_date": e.week_date,
        "portal_logins": e.portal_logins,
        "assignments_assigned": e.assignments_assigned,
        "assignments_completed": e.assignments_completed,
        "late_submissions": e.late_submissions,
        "engagement_score": e.engagement_score
    } for e in eng_records])

    # 1. Feature Engineering
    features_df = extract_student_features(students_df, att_df, marks_df, beh_df, eng_df)

    # 2. Train XGBoost Model
    trainer = RiskModelTrainer(model_version="v1.0.0")
    metrics = trainer.train(features_df)

    # 3. Predict & SHAP Explain
    explainer_service = ShapExplainerService(trainer.explainer, FEATURE_COLUMNS)

    X_all = features_df[FEATURE_COLUMNS]
    all_probs = trainer.model.predict_proba(X_all)[:, 1]

    # Delete previous risk scores
    db.query(RiskScore).delete()

    risk_scores_to_add = []
    high_count = 0
    med_count = 0
    low_count = 0

    for idx, row in features_df.iterrows():
        prob = float(all_probs[idx])
        if prob >= 0.65:
            tier = "High"
            high_count += 1
        elif prob >= 0.35:
            tier = "Medium"
            med_count += 1
        else:
            tier = "Low"
            low_count += 1

        # Determine risk trend (based on recent attendance trend & marks delta)
        combined_slope = row["attendance_trend_4w"] * 0.5 + row["marks_delta_3tests"] * 0.5
        if combined_slope <= -5.0:
            trend = "Increasing"
        elif combined_slope >= 5.0:
            trend = "Decreasing"
        else:
            trend = "Stable"

        # Generate EXACTLY 3 Plain-Language SHAP reasons
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

    # Log audit
    audit = AuditLog(
        user_email=current_user.email,
        action="RUN_PIPELINE",
        resource_type="ML_PIPELINE",
        details=f"Pipeline executed: {len(risk_scores_to_add)} scored. High={high_count}, Med={med_count}, Low={low_count}. High-risk recall={metrics['high_risk_recall']}"
    )
    db.add(audit)
    db.commit()

    return {
        "status": "success",
        "students_scored": len(risk_scores_to_add),
        "high_risk_count": high_count,
        "medium_risk_count": med_count,
        "low_risk_count": low_count,
        "metrics": metrics
    }

@router.post("/data/upload")
async def upload_csv_data(
    file: UploadFile = File(...),
    dataset_type: str = Form(..., description="students, attendance, marks, behavior, engagement"),
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    """
    Accepts CSV uploads, validates headers, and loads into database.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")

    try:
        content = await file.read()
        df = pd.read_csv(pd.io.common.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read CSV: {str(e)}")

    dataset_type = dataset_type.lower()
    rows_inserted = 0

    if dataset_type == "students":
        required_cols = {"student_id", "name", "grade", "section"}
        if not required_cols.issubset(df.columns):
            raise HTTPException(status_code=400, detail=f"Missing required columns: {required_cols - set(df.columns)}")
        for _, r in df.iterrows():
            stu = Student(
                student_id=str(r["student_id"]),
                name=str(r["name"]),
                grade=int(r["grade"]),
                section=str(r["section"]),
                gender=str(r.get("gender", "Unspecified")),
                parent_name=str(r.get("parent_name", "")),
                parent_phone=str(r.get("parent_phone", "")),
                parent_email=str(r.get("parent_email", ""))
            )
            db.merge(stu)
            rows_inserted += 1

    elif dataset_type == "attendance":
        required_cols = {"student_id", "week_number", "week_date", "days_present"}
        if not required_cols.issubset(df.columns):
            raise HTTPException(status_code=400, detail=f"Missing required columns: {required_cols - set(df.columns)}")
        for _, r in df.iterrows():
            total = int(r.get("days_total", 5))
            pres = int(r["days_present"])
            att = Attendance(
                student_id=str(r["student_id"]),
                week_number=int(r["week_number"]),
                week_date=str(r["week_date"]),
                days_total=total,
                days_present=pres,
                days_absent=int(r.get("days_absent", total - pres)),
                days_late=int(r.get("days_late", 0)),
                attendance_percentage=round((pres / max(1, total)) * 100.0, 1)
            )
            db.add(att)
            rows_inserted += 1

    elif dataset_type == "marks":
        required_cols = {"student_id", "week_number", "subject", "score"}
        if not required_cols.issubset(df.columns):
            raise HTTPException(status_code=400, detail=f"Missing required columns: {required_cols - set(df.columns)}")
        for _, r in df.iterrows():
            mk = Marks(
                student_id=str(r["student_id"]),
                week_number=int(r["week_number"]),
                week_date=str(r.get("week_date", "2026-01-01")),
                subject=str(r["subject"]),
                score=float(r["score"]),
                max_score=float(r.get("max_score", 100.0)),
                class_average=float(r.get("class_average", 70.0))
            )
            db.add(mk)
            rows_inserted += 1

    elif dataset_type == "behavior":
        required_cols = {"student_id", "week_number", "incident_count"}
        if not required_cols.issubset(df.columns):
            raise HTTPException(status_code=400, detail=f"Missing required columns: {required_cols - set(df.columns)}")
        for _, r in df.iterrows():
            beh = Behavior(
                student_id=str(r["student_id"]),
                week_number=int(r["week_number"]),
                week_date=str(r.get("week_date", "2026-01-01")),
                incident_count=int(r.get("incident_count", 0)),
                severity_score=int(r.get("severity_score", 0)),
                late_arrivals=int(r.get("late_arrivals", 0)),
                notes=str(r.get("notes", ""))
            )
            db.add(beh)
            rows_inserted += 1

    elif dataset_type == "engagement":
        required_cols = {"student_id", "week_number", "portal_logins"}
        if not required_cols.issubset(df.columns):
            raise HTTPException(status_code=400, detail=f"Missing required columns: {required_cols - set(df.columns)}")
        for _, r in df.iterrows():
            eng = Engagement(
                student_id=str(r["student_id"]),
                week_number=int(r["week_number"]),
                week_date=str(r.get("week_date", "2026-01-01")),
                portal_logins=int(r.get("portal_logins", 0)),
                assignments_assigned=int(r.get("assignments_assigned", 4)),
                assignments_completed=int(r.get("assignments_completed", 4)),
                late_submissions=int(r.get("late_submissions", 0)),
                engagement_score=float(r.get("engagement_score", 75.0))
            )
            db.add(eng)
            rows_inserted += 1

    else:
        raise HTTPException(status_code=400, detail=f"Unknown dataset_type: {dataset_type}")

    db.commit()

    audit = AuditLog(
        user_email=current_user.email,
        action="UPLOAD_DATA",
        resource_type=dataset_type.upper(),
        details=f"Uploaded {rows_inserted} rows via file {file.filename}"
    )
    db.add(audit)
    db.commit()

    return {"status": "success", "rows_inserted": rows_inserted, "dataset_type": dataset_type}

@router.get("/data/sample/{dataset_type}")
def download_sample_csv(dataset_type: str):
    """
    Downloads realistic sample CSV datasets for demonstration & testing.
    Valid dataset_type values: students, attendance, marks, behavior, engagement.
    """
    file_map = {
        "students": "1_students_master.csv",
        "attendance": "2_weekly_attendance.csv",
        "marks": "3_academic_marks.csv",
        "behavior": "4_behavior_and_incidents.csv",
        "engagement": "5_digital_engagement.csv",
    }
    filename = file_map.get(dataset_type.lower())
    if not filename:
        raise HTTPException(status_code=404, detail=f"Sample dataset '{dataset_type}' not found. Available: {list(file_map.keys())}")

    file_path = os.path.join(SAMPLE_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Sample dataset file not generated yet.")

    return FileResponse(
        path=file_path,
        media_type="text/csv",
        filename=filename
    )

@router.post("/data/quick-load-sample")
def quick_load_sample_csv(
    dataset_type: str = Form(..., description="students, attendance, marks, behavior, engagement, or all"),
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    """
    Directly ingests a pre-generated sample CSV dataset into the database for rapid testing.
    """
    file_map = {
        "students": ("1_students_master.csv", "students"),
        "attendance": ("2_weekly_attendance.csv", "attendance"),
        "marks": ("3_academic_marks.csv", "marks"),
        "behavior": ("4_behavior_and_incidents.csv", "behavior"),
        "engagement": ("5_digital_engagement.csv", "engagement"),
    }

    types_to_load = list(file_map.keys()) if dataset_type.lower() == "all" else [dataset_type.lower()]
    total_loaded = 0

    for t in types_to_load:
        if t not in file_map:
            continue
        fname, dtype = file_map[t]
        fpath = os.path.join(SAMPLE_DIR, fname)
        if not os.path.exists(fpath):
            continue

        df = pd.read_csv(fpath)
        if dtype == "students":
            for _, r in df.iterrows():
                stu = Student(
                    student_id=str(r["student_id"]),
                    name=str(r["name"]),
                    grade=int(r["grade"]),
                    section=str(r["section"]),
                    gender=str(r.get("gender", "Unspecified")),
                    parent_name=str(r.get("parent_name", "")),
                    parent_phone=str(r.get("parent_phone", "")),
                    parent_email=str(r.get("parent_email", ""))
                )
                db.merge(stu)
                total_loaded += 1

        elif dtype == "attendance":
            for _, r in df.iterrows():
                total = int(r.get("days_total", 5))
                pres = int(r["days_present"])
                att = Attendance(
                    student_id=str(r["student_id"]),
                    week_number=int(r["week_number"]),
                    week_date=str(r["week_date"]),
                    days_total=total,
                    days_present=pres,
                    days_absent=int(r.get("days_absent", total - pres)),
                    days_late=int(r.get("days_late", 0)),
                    attendance_percentage=float(r.get("attendance_percentage", (pres / max(1, total)) * 100.0))
                )
                db.add(att)
                total_loaded += 1

        elif dtype == "marks":
            for _, r in df.iterrows():
                mk = Marks(
                    student_id=str(r["student_id"]),
                    week_number=int(r["week_number"]),
                    week_date=str(r.get("week_date", "2026-01-01")),
                    subject=str(r["subject"]),
                    score=float(r["score"]),
                    max_score=float(r.get("max_score", 100.0)),
                    class_average=float(r.get("class_average", 70.0))
                )
                db.add(mk)
                total_loaded += 1

        elif dtype == "behavior":
            for _, r in df.iterrows():
                beh = Behavior(
                    student_id=str(r["student_id"]),
                    week_number=int(r["week_number"]),
                    week_date=str(r.get("week_date", "2026-01-01")),
                    incident_count=int(r.get("incident_count", 0)),
                    severity_score=int(r.get("severity_score", 0)),
                    late_arrivals=int(r.get("late_arrivals", 0)),
                    notes=str(r.get("notes", ""))
                )
                db.add(beh)
                total_loaded += 1

        elif dtype == "engagement":
            for _, r in df.iterrows():
                eng = Engagement(
                    student_id=str(r["student_id"]),
                    week_number=int(r["week_number"]),
                    week_date=str(r.get("week_date", "2026-01-01")),
                    portal_logins=int(r.get("portal_logins", 0)),
                    assignments_assigned=int(r.get("assignments_assigned", 4)),
                    assignments_completed=int(r.get("assignments_completed", 4)),
                    late_submissions=int(r.get("late_submissions", 0)),
                    engagement_score=float(r.get("engagement_score", 75.0))
                )
                db.add(eng)
                total_loaded += 1

    db.commit()
    return {"status": "success", "message": f"Quick-loaded {total_loaded} rows from sample dataset '{dataset_type}'"}
