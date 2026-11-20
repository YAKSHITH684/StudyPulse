import numpy as np
from typing import Dict, List, Any

def calculate_predictive_timeline(
    current_probability: float,
    attendance_trend: float,
    marks_delta: float,
    weeks_ahead: int = 4
) -> Dict[str, Any]:
    """
    Projects the student's risk trajectory over the next 4-8 weeks
    under two scenarios:
    1. Status Quo (unaddressed trajectory continuing the current slope)
    2. With Targeted Intervention (attendance contract + remedial tutoring)
    """
    timeline = []
    
    # Negative trend accelerates risk; positive trend softens it
    weekly_decay_factor = (-attendance_trend * 0.008) + (-marks_delta * 0.006)
    if weekly_decay_factor == 0:
        weekly_decay_factor = 0.03 if current_probability > 0.5 else -0.01

    prob_unaddressed = current_probability
    prob_with_intervention = current_probability

    critical_dropout_week = None

    for week in range(1, weeks_ahead + 1):
        # Scenario 1: Unaddressed
        prob_unaddressed = np.clip(prob_unaddressed + weekly_decay_factor, 0.05, 0.99)
        
        # Scenario 2: With Intervention (gradual recovery: ~8% improvement per week)
        intervention_recovery = 0.075 + (0.02 * week)
        prob_with_intervention = np.clip(prob_with_intervention - intervention_recovery, 0.08, 0.95)

        if prob_unaddressed >= 0.85 and critical_dropout_week is None:
            critical_dropout_week = f"Week +{week}"

        timeline.append({
            "week_label": f"Week +{week}",
            "week_number": week,
            "projected_risk_unaddressed": round(float(prob_unaddressed) * 100, 1),
            "projected_risk_with_intervention": round(float(prob_with_intervention) * 100, 1),
            "status_quo_tier": "High" if prob_unaddressed >= 0.65 else "Medium" if prob_unaddressed >= 0.35 else "Low",
            "intervention_tier": "High" if prob_with_intervention >= 0.65 else "Medium" if prob_with_intervention >= 0.35 else "Low"
        })

    estimated_critical_point = critical_dropout_week or "Beyond 4 weeks"

    return {
        "current_probability": round(current_probability * 100, 1),
        "estimated_critical_point": estimated_critical_point,
        "urgency_level": "Immediate Action Required" if current_probability >= 0.65 else "Preventive Watch" if current_probability >= 0.35 else "Normal Progress",
        "timeline": timeline,
        "timeline_forecast": timeline
    }
