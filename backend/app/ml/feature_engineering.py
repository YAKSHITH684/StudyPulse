import numpy as np
import pandas as pd

FEATURE_COLUMNS = [
    "attendance_avg_4w",
    "attendance_trend_4w",
    "attendance_recent",
    "attendance_drop_anomaly",
    "marks_avg_4w",
    "marks_vs_class_avg",
    "marks_delta_3tests",
    "late_submission_rate_4w",
    "behavior_incidents_4w",
    "behavior_severity_score_4w",
    "late_arrivals_4w",
    "engagement_logins_avg_4w",
    "engagement_score_avg_4w"
]

FEATURE_LABELS_HUMAN = {
    "attendance_avg_4w": "4-Week Average Attendance (%)",
    "attendance_trend_4w": "4-Week Attendance Change (%)",
    "attendance_recent": "Recent Attendance (%)",
    "attendance_drop_anomaly": "Sudden Attendance Drop Anomaly",
    "marks_avg_4w": "4-Week Average Marks",
    "marks_vs_class_avg": "Marks vs Class Average",
    "marks_delta_3tests": "Change Across Last 3 Tests",
    "late_submission_rate_4w": "Late/Missed Submission Rate (%)",
    "behavior_incidents_4w": "4-Week Behavior Incidents Count",
    "behavior_severity_score_4w": "4-Week Incident Severity Score",
    "late_arrivals_4w": "4-Week Late Arrivals Count",
    "engagement_logins_avg_4w": "Weekly LMS Logins",
    "engagement_score_avg_4w": "Weekly Engagement Score"
}

def extract_student_features(
    students_df: pd.DataFrame,
    attendance_df: pd.DataFrame,
    marks_df: pd.DataFrame,
    behavior_df: pd.DataFrame,
    engagement_df: pd.DataFrame,
    reference_week: int = None
) -> pd.DataFrame:
    """
    Computes weekly student feature vectors according to Section 6 of Spec.
    Supports low-confidence flags for incomplete records.
    """
    if reference_week is None:
        if not attendance_df.empty:
            reference_week = int(attendance_df["week_number"].max())
        else:
            reference_week = 8

    window_weeks = list(range(max(1, reference_week - 3), reference_week + 1))
    
    features = []

    for _, stu in students_df.iterrows():
        sid = stu["student_id"]

        # 1. Filter data within the 4-week window
        stu_att = attendance_df[(attendance_df["student_id"] == sid) & (attendance_df["week_number"].isin(window_weeks))].sort_values("week_number")
        stu_marks = marks_df[(marks_df["student_id"] == sid) & (marks_df["week_number"].isin(window_weeks))].sort_values("week_number")
        stu_beh = behavior_df[(behavior_df["student_id"] == sid) & (behavior_df["week_number"].isin(window_weeks))].sort_values("week_number")
        stu_eng = engagement_df[(engagement_df["student_id"] == sid) & (engagement_df["week_number"].isin(window_weeks))].sort_values("week_number")

        weeks_recorded = len(stu_att)
        has_low_confidence = weeks_recorded < 3
        confidence_score = round(min(1.0, max(0.35, weeks_recorded / 4.0)), 2)

        # --- Attendance Features ---
        if not stu_att.empty:
            att_avg_4w = stu_att["attendance_percentage"].mean()
            recent_att = stu_att["attendance_percentage"].iloc[-1]
            if len(stu_att) >= 2:
                # 4-week trend: difference between last recorded week and first in window
                att_trend_4w = stu_att["attendance_percentage"].iloc[-1] - stu_att["attendance_percentage"].iloc[0]
                # Anomaly check: sudden drop > 20% week-over-week
                diffs = stu_att["attendance_percentage"].diff()
                has_anomaly = (diffs < -20.0).any()
                att_drop_anomaly = 1.0 if has_anomaly else 0.0
            else:
                att_trend_4w = 0.0
                att_drop_anomaly = 0.0
        else:
            att_avg_4w = 75.0
            recent_att = 75.0
            att_trend_4w = 0.0
            att_drop_anomaly = 0.0

        # --- Marks Features ---
        if not stu_marks.empty:
            marks_avg_4w = stu_marks["score"].mean()
            class_avg_4w = stu_marks["class_average"].mean()
            marks_vs_class_avg = marks_avg_4w - class_avg_4w

            # Change across last 3 tests
            # Group by week to get student's weekly average score
            weekly_marks = stu_marks.groupby("week_number")["score"].mean().sort_index()
            if len(weekly_marks) >= 3:
                marks_delta_3tests = weekly_marks.iloc[-1] - weekly_marks.iloc[-3]
            elif len(weekly_marks) >= 2:
                marks_delta_3tests = weekly_marks.iloc[-1] - weekly_marks.iloc[0]
            else:
                marks_delta_3tests = 0.0
        else:
            marks_avg_4w = 65.0
            marks_vs_class_avg = 0.0
            marks_delta_3tests = 0.0

        # --- Behavior Features ---
        if not stu_beh.empty:
            beh_incidents_4w = stu_beh["incident_count"].sum()
            beh_severity_4w = stu_beh["severity_score"].sum()
            late_arrivals_4w = stu_beh["late_arrivals"].sum()
        else:
            beh_incidents_4w = 0
            beh_severity_4w = 0
            late_arrivals_4w = 0

        # --- Engagement Features ---
        if not stu_eng.empty:
            eng_logins_avg_4w = stu_eng["portal_logins"].mean()
            eng_score_avg_4w = stu_eng["engagement_score"].mean()
            total_assigned = stu_eng["assignments_assigned"].sum()
            total_late = stu_eng["late_submissions"].sum()
            late_sub_rate_4w = (total_late / max(1, total_assigned)) * 100.0
        else:
            eng_logins_avg_4w = 4.0
            eng_score_avg_4w = 60.0
            late_sub_rate_4w = 10.0

        # Ground truth risk label calculation for synthetic training (0: Low, 1: Medium, 2: High)
        # Based on actual student performance indicators
        risk_tier = stu.get("risk_tier", None)
        if risk_tier == "high":
            ground_truth_risk = 2
        elif risk_tier == "medium":
            ground_truth_risk = 1
        elif risk_tier == "low":
            ground_truth_risk = 0
        else:
            # Calculate heuristic label if missing
            score_penalty = (100 - att_avg_4w) * 0.4 + (100 - marks_avg_4w) * 0.35 + (beh_severity_4w * 5) + (late_sub_rate_4w * 0.25)
            if score_penalty > 45 or att_avg_4w < 65 or marks_avg_4w < 45:
                ground_truth_risk = 2
            elif score_penalty > 25 or att_avg_4w < 80:
                ground_truth_risk = 1
            else:
                ground_truth_risk = 0

        features.append({
            "student_id": sid,
            "name": stu.get("name", "Student"),
            "grade": stu.get("grade", 10),
            "section": stu.get("section", "A"),
            "attendance_avg_4w": round(float(att_avg_4w), 2),
            "attendance_trend_4w": round(float(att_trend_4w), 2),
            "attendance_recent": round(float(recent_att), 2),
            "attendance_drop_anomaly": float(att_drop_anomaly),
            "marks_avg_4w": round(float(marks_avg_4w), 2),
            "marks_vs_class_avg": round(float(marks_vs_class_avg), 2),
            "marks_delta_3tests": round(float(marks_delta_3tests), 2),
            "late_submission_rate_4w": round(float(late_sub_rate_4w), 2),
            "behavior_incidents_4w": int(beh_incidents_4w),
            "behavior_severity_score_4w": int(beh_severity_4w),
            "late_arrivals_4w": int(late_arrivals_4w),
            "engagement_logins_avg_4w": round(float(eng_logins_avg_4w), 2),
            "engagement_score_avg_4w": round(float(eng_score_avg_4w), 2),
            "has_low_confidence": bool(has_low_confidence),
            "confidence_score": float(confidence_score),
            "weeks_recorded": int(weeks_recorded),
            "ground_truth_risk": int(ground_truth_risk)
        })

    return pd.DataFrame(features)
