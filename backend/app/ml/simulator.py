import numpy as np
import pandas as pd
from typing import Dict, Any

def simulate_what_if(
    model,
    feature_row: pd.Series,
    feature_columns: list,
    adjustments: Dict[str, float]
) -> Dict[str, Any]:
    """
    Simulates the impact of targeted student improvements (e.g. higher attendance,
    extra tutoring marks, fewer behavioral incidents, improved homework submission)
    on the student's predicted risk score.
    """
    # Baseline prediction
    X_base = pd.DataFrame([feature_row[feature_columns].values], columns=feature_columns)
    base_prob = float(model.predict_proba(X_base)[0, 1])

    if base_prob >= 0.65:
        base_tier = "High"
    elif base_prob >= 0.35:
        base_tier = "Medium"
    else:
        base_tier = "Low"

    # Simulated prediction
    simulated_values = feature_row[feature_columns].copy()

    # Apply adjustments
    if "attendance_delta" in adjustments:
        delta = adjustments["attendance_delta"]
        simulated_values["attendance_avg_4w"] = np.clip(simulated_values["attendance_avg_4w"] + delta, 0, 100)
        simulated_values["attendance_recent"] = np.clip(simulated_values["attendance_recent"] + delta, 0, 100)
        simulated_values["attendance_trend_4w"] = simulated_values["attendance_trend_4w"] + delta * 0.5
        if simulated_values["attendance_trend_4w"] > 0:
            simulated_values["attendance_drop_anomaly"] = 0.0

    if "marks_delta" in adjustments:
        delta = adjustments["marks_delta"]
        simulated_values["marks_avg_4w"] = np.clip(simulated_values["marks_avg_4w"] + delta, 0, 100)
        simulated_values["marks_vs_class_avg"] = simulated_values["marks_vs_class_avg"] + delta
        simulated_values["marks_delta_3tests"] = simulated_values["marks_delta_3tests"] + delta * 0.5

    if "late_submission_delta" in adjustments:
        delta = adjustments["late_submission_delta"]  # negative delta reduces late submissions
        simulated_values["late_submission_rate_4w"] = np.clip(simulated_values["late_submission_rate_4w"] + delta, 0, 100)

    if "behavior_incident_delta" in adjustments:
        delta = adjustments["behavior_incident_delta"]  # negative delta reduces incidents
        simulated_values["behavior_incidents_4w"] = max(0, simulated_values["behavior_incidents_4w"] + delta)
        simulated_values["behavior_severity_score_4w"] = max(0, simulated_values["behavior_severity_score_4w"] + (delta * 2))

    if "engagement_login_delta" in adjustments:
        delta = adjustments["engagement_login_delta"]
        simulated_values["engagement_logins_avg_4w"] = max(0, simulated_values["engagement_logins_avg_4w"] + delta)
        simulated_values["engagement_score_avg_4w"] = np.clip(simulated_values["engagement_score_avg_4w"] + delta * 5, 0, 100)

    X_sim = pd.DataFrame([simulated_values[feature_columns].values], columns=feature_columns)
    sim_prob = float(model.predict_proba(X_sim)[0, 1])

    if sim_prob >= 0.65:
        sim_tier = "High"
    elif sim_prob >= 0.35:
        sim_tier = "Medium"
    else:
        sim_tier = "Low"

    risk_reduction_pct = round(((base_prob - sim_prob) / max(0.001, base_prob)) * 100.0, 1)

    return {
        "baseline_probability": round(base_prob, 3),
        "baseline_risk_tier": base_tier,
        "simulated_probability": round(sim_prob, 3),
        "simulated_risk_tier": sim_tier,
        "risk_delta": round(sim_prob - base_prob, 3),
        "risk_reduction_percentage": risk_reduction_pct,
        "improved_status": sim_prob < base_prob
    }
