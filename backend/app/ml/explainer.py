import numpy as np
import pandas as pd
from typing import List, Dict, Any
from .feature_engineering import FEATURE_COLUMNS, FEATURE_LABELS_HUMAN

def generate_plain_language_explanation(feature_name: str, feature_value: float, shap_value: float, risk_tier: str) -> str:
    """
    Translates a feature name, its numerical value and its SHAP contribution
    into a helpful, plain-language sentence suitable for teachers and parents.
    """
    if feature_name == "attendance_avg_4w":
        if feature_value < 70:
            return f"Average attendance over the last 4 weeks is critically low at {feature_value:.1f}% (standard requirement is 75%)."
        elif feature_value < 82:
            return f"Attendance has softened to {feature_value:.1f}%, hovering near the borderline threshold."
        else:
            return f"Consistent school attendance at {feature_value:.1f}%, serving as a positive protective factor."

    elif feature_name == "attendance_trend_4w":
        if feature_value <= -10:
            return f"Attendance suffered a steep decline of {abs(feature_value):.1f}% over the last 4 weeks."
        elif feature_value < 0:
            return f"Attendance is showing a downward slope of {abs(feature_value):.1f}% across recent weeks."
        else:
            return f"Attendance trend is positive and improving (+{feature_value:.1f}% over the month)."

    elif feature_name == "attendance_drop_anomaly":
        if feature_value >= 1.0:
            return "An acute attendance drop (>20% in a single week) was flagged by anomaly detection."
        else:
            return "No sudden single-week attendance crash detected."

    elif feature_name == "marks_avg_4w":
        if feature_value < 45:
            return f"Recent test marks average {feature_value:.1f}/100, indicating severe academic distress across core subjects."
        elif feature_value < 60:
            return f"Overall academic performance stands at {feature_value:.1f}/100, indicating vulnerability in upcoming assessments."
        else:
            return f"Healthy academic standing with an average score of {feature_value:.1f}/100."

    elif feature_name == "marks_vs_class_avg":
        if feature_value <= -15:
            return f"Subject scores trail {abs(feature_value):.1f} marks below the section class average."
        elif feature_value < 0:
            return f"Academic scores are slightly below peer benchmark (-{abs(feature_value):.1f} from class average)."
        else:
            return f"Outperforming class section average by +{feature_value:.1f} points."

    elif feature_name == "marks_delta_3tests":
        if feature_value <= -10:
            return f"Performance dropped by {abs(feature_value):.1f} marks across the last three consecutive tests."
        elif feature_value < 0:
            return f"Subtle downward trend of {abs(feature_value):.1f} marks over recent test cycles."
        else:
            return f"Upward test trajectory with an increase of +{feature_value:.1f} marks."

    elif feature_name == "late_submission_rate_4w":
        if feature_value >= 40:
            return f"High homework delay rate: {feature_value:.1f}% of assignments were submitted late or missed entirely."
        elif feature_value >= 20:
            return f"{feature_value:.1f}% late submission rate on course assignments in the past 4 weeks."
        else:
            return f"Strong coursework punctuality with minimal late submissions ({feature_value:.1f}%)."

    elif feature_name == "behavior_severity_score_4w" or feature_name == "behavior_incidents_4w":
        if feature_value >= 5:
            return f"Multiple classroom incidents recorded (severity score {feature_value:.0f}), requiring pastoral counseling."
        elif feature_value >= 2:
            return f"Logged disciplinary incidents (severity score {feature_value:.0f}) noted in the past 4 weeks."
        else:
            return f"Exemplary classroom conduct with no notable disciplinary entries."

    elif feature_name == "late_arrivals_4w":
        if feature_value >= 4:
            return f"Frequent tardiness with {feature_value:.0f} late arrivals to morning assembly and first period."
        else:
            return f"Punctual morning arrival with {feature_value:.0f} late arrivals recorded."

    elif feature_name == "engagement_logins_avg_4w" or feature_name == "engagement_score_avg_4w":
        if feature_value < 3:
            return f"Very low digital learning activity (only {feature_value:.1f} portal sessions/week), signaling disengagement."
        else:
            return f"Regular digital portal engagement ({feature_value:.1f} sessions/week)."

    return f"{FEATURE_LABELS_HUMAN.get(feature_name, feature_name)}: current metric is {feature_value:.1f}."

class ShapExplainerService:
    def __init__(self, explainer, feature_columns: List[str]):
        self.explainer = explainer
        self.feature_columns = feature_columns

    def explain_student(self, feature_row: pd.Series, risk_probability: float, risk_tier: str) -> List[Dict[str, Any]]:
        """
        Computes SHAP feature attributions and generates EXACTLY three plain-language reasons.
        """
        # Ensure row is formatted as 2D DataFrame with correct columns
        X_row = pd.DataFrame([feature_row[self.feature_columns].values], columns=self.feature_columns)
        
        # Calculate SHAP values for single instance
        shap_values = self.explainer(X_row)
        
        # shap_values.values has shape (1, num_features) or (1, num_features, classes)
        if len(shap_values.values.shape) == 3:
            # Positive class (class 1)
            raw_shap = shap_values.values[0, :, 1]
        elif len(shap_values.values.shape) == 2:
            raw_shap = shap_values.values[0, :]
        else:
            raw_shap = shap_values.values[0]

        impacts = []
        for feat_name, s_val in zip(self.feature_columns, raw_shap):
            feat_val = float(feature_row[feat_name])
            impacts.append({
                "feature": feat_name,
                "label": FEATURE_LABELS_HUMAN.get(feat_name, feat_name),
                "feature_value": feat_val,
                "shap_value": float(s_val),
                # For at-risk students, positive SHAP means increasing risk
                "impact_direction": "risk_driver" if s_val > 0 else "protective_factor"
            })

        # Rank features:
        # If High/Medium risk: pick top positive risk drivers (greatest positive SHAP values).
        # If Low risk: pick top protective factors (most negative SHAP values) or highest absolute impact.
        if risk_tier in ["High", "Medium"]:
            sorted_impacts = sorted(impacts, key=lambda x: x["shap_value"], reverse=True)
        else:
            # For low risk, show what keeps them safe or minor potential watch factors
            sorted_impacts = sorted(impacts, key=lambda x: abs(x["shap_value"]), reverse=True)

        # EXACTLY TOP 3 REASONS required by Spec (Sections 7, 15)
        top_3 = sorted_impacts[:3]

        # Calculate percentage contribution among the top 3 for visual weight bars
        total_weight = sum(abs(item["shap_value"]) for item in top_3)
        if total_weight == 0:
            total_weight = 1.0

        results = []
        for idx, item in enumerate(top_3):
            explanation_text = generate_plain_language_explanation(
                item["feature"],
                item["feature_value"],
                item["shap_value"],
                risk_tier
            )
            weight_pct = round((abs(item["shap_value"]) / total_weight) * 100.0, 1)

            results.append({
                "rank": idx + 1,
                "feature": item["feature"],
                "label": item["label"],
                "feature_value": item["feature_value"],
                "shap_value": round(item["shap_value"], 4),
                "weight_percentage": weight_pct,
                "impact_direction": item["impact_direction"],
                "explanation": explanation_text
            })

        return results
