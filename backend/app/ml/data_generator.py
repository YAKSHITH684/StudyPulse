import random
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

# Reproducible seed
DEFAULT_SEED = 42

FIRST_NAMES = [
    "Aarav", "Aryan", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna",
    "Ishaan", "Dhruv", "Rohan", "Kabir", "Ananya", "Diya", "Saanvi", "Aadhya", "Pari", "Isha",
    "Navya", "Riya", "Sneha", "Kavya", "Pooja", "Meera", "Tanvi", "Anushka", "Prisha", "Deepika",
    "Rahul", "Kunal", "Harsh", "Varun", "Neha", "Shreya", "Aditi", "Tarun", "Simran", "Vikas"
]

LAST_NAMES = [
    "Sharma", "Verma", "Patel", "Reddy", "Rao", "Nair", "Iyer", "Kumar", "Singh", "Gupta",
    "Joshi", "Das", "Choudhury", "Bose", "Mehta", "Bhat", "Kulkarni", "Deshmukh", "Pillai", "Menon"
]

GRADES = [9, 10, 11, 12]
SECTIONS = ["A", "B", "C"]
SUBJECTS = ["Mathematics", "Science", "English", "Social Science"]

def generate_synthetic_school_data(num_students=300, num_weeks=8, seed=DEFAULT_SEED):
    """
    Generates synthetic multi-week student datasets for StudyPulse.
    Returns:
        students_df, attendance_df, marks_df, behavior_df, engagement_df, ground_truth_df
    """
    random.seed(seed)
    np.random.seed(seed)

    students = []
    base_profiles = []

    for i in range(1, num_students + 1):
        student_id = f"STU-{1000 + i}"
        first_name = random.choice(FIRST_NAMES)
        last_name = random.choice(LAST_NAMES)
        name = f"{first_name} {last_name}"
        grade = random.choice(GRADES)
        section = random.choice(SECTIONS)
        gender = random.choice(["Male", "Female"])
        parent_name = f"Mr./Mrs. {last_name}"
        parent_phone = f"+91 98{random.randint(10000000, 99999999)}"
        parent_email = f"parent.{student_id.lower()}@example.com"

        # Hidden latent risk archetype
        # 0: Low Risk (~65%), 1: Medium Risk (~20%), 2: High Risk (~15%)
        archetype_prob = random.random()
        if archetype_prob < 0.65:
            risk_tier = "low"
            base_attendance = np.random.uniform(88, 98)
            attendance_slope = np.random.uniform(-0.5, 0.5)
            base_marks = np.random.uniform(70, 95)
            marks_slope = np.random.uniform(-0.5, 1.0)
            incident_prob = 0.05
            login_rate = np.random.uniform(5, 10)
            missing_rate = 0.02
        elif archetype_prob < 0.85:
            risk_tier = "medium"
            base_attendance = np.random.uniform(72, 85)
            attendance_slope = np.random.uniform(-1.5, -0.2)
            base_marks = np.random.uniform(50, 70)
            marks_slope = np.random.uniform(-1.5, 0.2)
            incident_prob = 0.20
            login_rate = np.random.uniform(2, 5)
            missing_rate = 0.15
        else:
            risk_tier = "high"
            base_attendance = np.random.uniform(50, 70)
            attendance_slope = np.random.uniform(-3.0, -1.0)
            base_marks = np.random.uniform(30, 52)
            marks_slope = np.random.uniform(-3.0, -0.5)
            incident_prob = 0.45
            login_rate = np.random.uniform(0.5, 2.5)
            missing_rate = 0.40

        # Inject realistic data missingness flag for 7% students to evaluate low-confidence flag
        has_missing_data = random.random() < 0.07

        students.append({
            "student_id": student_id,
            "name": name,
            "grade": grade,
            "section": section,
            "gender": gender,
            "parent_name": parent_name,
            "parent_phone": parent_phone,
            "parent_email": parent_email,
            "risk_tier": risk_tier,
            "has_missing_data": has_missing_data
        })

        base_profiles.append({
            "student_id": student_id,
            "risk_tier": risk_tier,
            "base_attendance": base_attendance,
            "attendance_slope": attendance_slope,
            "base_marks": base_marks,
            "marks_slope": marks_slope,
            "incident_prob": incident_prob,
            "login_rate": login_rate,
            "missing_rate": missing_rate,
            "has_missing_data": has_missing_data
        })

    students_df = pd.DataFrame(students)

    # 1. Attendance Records (Weekly aggregates per student)
    attendance_records = []
    # 2. Marks Records (Weekly subject tests)
    marks_records = []
    # 3. Behavior Records (Weekly incident counts and late arrivals)
    behavior_records = []
    # 4. Engagement Records (Weekly logins and homework submissions)
    engagement_records = []

    # Simulation start date: 8 weeks ago
    start_date = datetime.now() - timedelta(weeks=num_weeks)

    for prof in base_profiles:
        sid = prof["student_id"]
        for week in range(1, num_weeks + 1):
            week_date = (start_date + timedelta(weeks=week-1)).strftime("%Y-%m-%d")

            # Check if this student has missing data for recent weeks (low confidence)
            if prof["has_missing_data"] and week >= num_weeks - 1:
                # Omit recent data for testing low-confidence flags
                continue

            # Attendance calculation
            att_val = np.clip(
                prof["base_attendance"] + prof["attendance_slope"] * week + np.random.normal(0, 3),
                20, 100
            )
            # 5 school days per week
            days_total = 5
            present_days = int(round(att_val / 100.0 * days_total))
            absent_days = days_total - present_days
            late_days = int(np.random.binomial(days_total, 0.15 if prof["risk_tier"] == "high" else 0.05))

            attendance_records.append({
                "student_id": sid,
                "week_number": week,
                "week_date": week_date,
                "days_total": days_total,
                "days_present": present_days,
                "days_absent": absent_days,
                "days_late": late_days,
                "attendance_percentage": round((present_days / days_total) * 100.0, 1)
            })

            # Marks calculation across subjects
            for sub in SUBJECTS:
                # Section baseline
                sub_offset = {"Mathematics": -5, "Science": 0, "English": 5, "Social Science": 3}[sub]
                mark_val = np.clip(
                    prof["base_marks"] + sub_offset + prof["marks_slope"] * week + np.random.normal(0, 5),
                    15, 100
                )
                class_avg = 72.0 + sub_offset + np.random.normal(0, 2)
                marks_records.append({
                    "student_id": sid,
                    "week_number": week,
                    "week_date": week_date,
                    "subject": sub,
                    "score": round(mark_val, 1),
                    "max_score": 100,
                    "class_average": round(class_avg, 1)
                })

            # Behavior records
            num_incidents = int(np.random.poisson(prof["incident_prob"]))
            incident_severity_sum = 0
            incident_descriptions = []
            if num_incidents > 0:
                for _ in range(num_incidents):
                    sev = random.choices([1, 2, 3], weights=[0.6, 0.3, 0.1] if prof["risk_tier"] != "high" else [0.3, 0.4, 0.3])[0]
                    incident_severity_sum += sev
                    desc = random.choice([
                        "Disruptive in classroom", "Incomplete homework & insubordination",
                        "Late to morning assembly", "Verbal confrontation with peer", "Sleeping in class"
                    ])
                    incident_descriptions.append(f"{desc} (Sev {sev})")

            behavior_records.append({
                "student_id": sid,
                "week_number": week,
                "week_date": week_date,
                "incident_count": num_incidents,
                "severity_score": incident_severity_sum,
                "late_arrivals": late_days,
                "notes": "; ".join(incident_descriptions) if incident_descriptions else "Good conduct"
            })

            # Engagement records
            logins = max(0, int(round(prof["login_rate"] + np.random.normal(0, 1.5))))
            assignments_assigned = 4
            late_sub = int(np.random.binomial(assignments_assigned, prof["missing_rate"]))
            completed = assignments_assigned - late_sub
            engagement_records.append({
                "student_id": sid,
                "week_number": week,
                "week_date": week_date,
                "portal_logins": logins,
                "assignments_assigned": assignments_assigned,
                "assignments_completed": completed,
                "late_submissions": late_sub,
                "engagement_score": round(np.clip((logins * 8) + (completed / assignments_assigned * 50), 5, 100), 1)
            })

    attendance_df = pd.DataFrame(attendance_records)
    marks_df = pd.DataFrame(marks_records)
    behavior_df = pd.DataFrame(behavior_records)
    engagement_df = pd.DataFrame(engagement_records)

    return students_df, attendance_df, marks_df, behavior_df, engagement_df

if __name__ == "__main__":
    st_df, att_df, mk_df, bh_df, eng_df = generate_synthetic_school_data(50, 8)
    print("Students generated:", len(st_df))
    print("Attendance rows:", len(att_df))
    print("Marks rows:", len(mk_df))
    print("Behavior rows:", len(bh_df))
    print("Engagement rows:", len(eng_df))
