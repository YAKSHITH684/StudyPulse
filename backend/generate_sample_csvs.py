import os
import sys
import pandas as pd

# Add app to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.ml.data_generator import generate_synthetic_school_data

OUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "sample_datasets"))
os.makedirs(OUT_DIR, exist_ok=True)

def generate_sample_csvs(num_students=100, num_weeks=8, seed=42):
    print(f"Generating {num_students} students with {num_weeks} weeks of data (seed={seed})...")
    st_df, att_df, mk_df, bh_df, eng_df = generate_synthetic_school_data(
        num_students=num_students, num_weeks=num_weeks, seed=seed
    )

    # 1. Students Master CSV
    students_path = os.path.join(OUT_DIR, "1_students_master.csv")
    st_df.to_csv(students_path, index=False)
    print(f"Saved: {students_path} ({len(st_df)} rows)")

    # 2. Attendance CSV
    att_path = os.path.join(OUT_DIR, "2_weekly_attendance.csv")
    att_df.to_csv(att_path, index=False)
    print(f"Saved: {att_path} ({len(att_df)} rows)")

    # 3. Marks CSV
    mk_path = os.path.join(OUT_DIR, "3_academic_marks.csv")
    mk_df.to_csv(mk_path, index=False)
    print(f"Saved: {mk_path} ({len(mk_df)} rows)")

    # 4. Behavior CSV
    bh_path = os.path.join(OUT_DIR, "4_behavior_and_incidents.csv")
    bh_df.to_csv(bh_path, index=False)
    print(f"Saved: {bh_path} ({len(bh_df)} rows)")

    # 5. Engagement CSV
    eng_path = os.path.join(OUT_DIR, "5_digital_engagement.csv")
    eng_df.to_csv(eng_path, index=False)
    print(f"Saved: {eng_path} ({len(eng_df)} rows)")

if __name__ == "__main__":
    generate_sample_csvs()
