import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "healthy"}

def test_login_and_auth():
    # Admin login
    res = client.post("/auth/login", json={"email": "admin@studypulse.edu", "password": "Admin@123"})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["role"] == "admin"

    # Teacher login
    res_teacher = client.post("/auth/login", json={"email": "teacher@studypulse.edu", "password": "Teacher@123"})
    assert res_teacher.status_code == 200
    assert res_teacher.json()["role"] == "teacher"

    # Parent login
    res_parent = client.post("/auth/login", json={"email": "parent@studypulse.edu", "password": "Parent@123"})
    assert res_parent.status_code == 200
    assert res_parent.json()["role"] == "parent"
    assert res_parent.json()["linked_student_id"] == "STU-1004"

def test_teacher_role_restriction():
    # Login as teacher
    res_login = client.post("/auth/login", json={"email": "teacher@studypulse.edu", "password": "Teacher@123"})
    token = res_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch risk list
    res_risk = client.get("/risk", headers=headers)
    assert res_risk.status_code == 200
    students = res_risk.json()
    assert len(students) > 0
    # Teacher is assigned Grade 10, Sections A, B
    for s in students:
        assert s["grade"] == 10
        assert s["section"] in ["A", "B"]
        # Exactly 3 SHAP reasons
        assert len(s["top_factors"]) == 3

def test_parent_child_restriction():
    # Login as parent
    res_login = client.post("/auth/login", json={"email": "parent@studypulse.edu", "password": "Parent@123"})
    token = res_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Parent should only see their child in risk list
    res_risk = client.get("/risk", headers=headers)
    assert res_risk.status_code == 200
    students = res_risk.json()
    assert len(students) == 1
    assert students[0]["student_id"] == "STU-1004"

    # Parent accessing other student should fail with 403
    res_other = client.get("/students/STU-1001", headers=headers)
    assert res_other.status_code == 403

def test_student_detail_and_suggestions():
    res_login = client.post("/auth/login", json={"email": "admin@studypulse.edu", "password": "Admin@123"})
    headers = {"Authorization": f"Bearer {res_login.json()['access_token']}"}

    res = client.get("/students/STU-1004", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["student"]["name"] == "Aryan Rao"
    assert len(data["attendance_history"]) > 0
    assert len(data["marks_history"]) > 0
    assert len(data["risk_score"]["top_factors"]) == 3

    # Suggestions
    res_sugg = client.get("/students/STU-1004/suggestions", headers=headers)
    assert res_sugg.status_code == 200
    assert len(res_sugg.json()) > 0

def test_what_if_simulation_endpoint():
    res_login = client.post("/auth/login", json={"email": "admin@studypulse.edu", "password": "Admin@123"})
    headers = {"Authorization": f"Bearer {res_login.json()['access_token']}"}

    res = client.post("/students/STU-1004/what-if", headers=headers, json={
        "attendance_delta": 20.0,
        "marks_delta": 15.0,
        "late_submission_delta": -30.0
    })
    assert res.status_code == 200
    data = res.json()
    assert "baseline_probability" in data
    assert "simulated_probability" in data
    assert "risk_reduction_percentage" in data

def test_metrics_endpoint():
    res_login = client.post("/auth/login", json={"email": "admin@studypulse.edu", "password": "Admin@123"})
    headers = {"Authorization": f"Bearer {res_login.json()['access_token']}"}

    res = client.get("/metrics", headers=headers)
    assert res.status_code == 200
    metrics = res.json()
    assert "recall" in metrics
    assert "high_risk_recall" in metrics
    assert "precision_at_top_20" in metrics
    assert "calibration_curve" in metrics
