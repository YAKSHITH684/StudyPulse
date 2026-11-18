from typing import List, Dict, Any

INTERVENTION_CATALOG = {
    "attendance": [
        {
            "action_type": "Attendance Contract & Daily Check-in",
            "category": "Attendance",
            "urgency": "High",
            "description": "Establish a structured daily arrival check-in with the school counselor and set a target attendance goal.",
            "recommended_owner": "Class Teacher / Counselor",
            "estimated_duration_weeks": 4
        },
        {
            "action_type": "Parent-Teacher Commute & Schedule Consultation",
            "category": "Attendance",
            "urgency": "Medium",
            "description": "Engage parents to understand transportation barriers, morning routines, or health challenges affecting regular attendance.",
            "recommended_owner": "Counselor / Pastoral Head",
            "estimated_duration_weeks": 2
        }
    ],
    "academics": [
        {
            "action_type": "Remedial Subject Coaching",
            "category": "Academic",
            "urgency": "High",
            "description": "Enroll in after-school remedial sessions focused on foundation concepts in struggling subjects.",
            "recommended_owner": "Subject Specialist Teacher",
            "estimated_duration_weeks": 6
        },
        {
            "action_type": "Peer Mentorship & Study Buddy Assignment",
            "category": "Academic",
            "urgency": "Medium",
            "description": "Pair with a high-performing peer mentor for collaborative homework reviews and test prep.",
            "recommended_owner": "Class Teacher",
            "estimated_duration_weeks": 4
        }
    ],
    "behavior": [
        {
            "action_type": "1-on-1 Behavioral & Emotional Counseling",
            "category": "Behavioral",
            "urgency": "High",
            "description": "Weekly confidential sessions with school psychologist to address peer conflicts, stress, or classroom triggers.",
            "recommended_owner": "School Counselor",
            "estimated_duration_weeks": 6
        },
        {
            "action_type": "Classroom Engagement & Role Assignment",
            "category": "Behavioral",
            "urgency": "Low",
            "description": "Assign constructive classroom roles (e.g. lab coordinator, group leader) to build positive ownership and rapport.",
            "recommended_owner": "Class Teacher",
            "estimated_duration_weeks": 3
        }
    ],
    "engagement": [
        {
            "action_type": "Digital Homework Clinic & Study Schedule",
            "category": "Engagement",
            "urgency": "Medium",
            "description": "Provide guided study hall time to clear pending submissions and establish structured daily study habits.",
            "recommended_owner": "Academic Mentor",
            "estimated_duration_weeks": 4
        },
        {
            "action_type": "Parent Weekly Progress SMS & Portal Support",
            "category": "Engagement",
            "urgency": "Low",
            "description": "Enable automated weekly SMS updates to parents celebrating completed assignments and tracking submission milestones.",
            "recommended_owner": "Admin / Automated System",
            "estimated_duration_weeks": 8
        }
    ]
}

def recommend_interventions(
    top_reasons: List[Dict[str, Any]],
    risk_tier: str,
    attendance_avg: float = None,
    marks_avg: float = None
) -> List[Dict[str, Any]]:
    """
    Selects prioritized interventions tailored to the student's top SHAP drivers and risk severity.
    """
    suggestions = []
    seen_types = set()

    # Scan top 3 reasons to map to categories
    for reason in top_reasons:
        feat = reason.get("feature", "")
        if "attendance" in feat:
            pool = INTERVENTION_CATALOG["attendance"]
        elif "marks" in feat:
            pool = INTERVENTION_CATALOG["academics"]
        elif "behavior" in feat or "late_arrivals" in feat:
            pool = INTERVENTION_CATALOG["behavior"]
        elif "engagement" in feat or "late_submission" in feat:
            pool = INTERVENTION_CATALOG["engagement"]
        else:
            pool = INTERVENTION_CATALOG["academics"]

        for item in pool:
            if item["action_type"] not in seen_types:
                # Prioritize high urgency for High risk tier
                if risk_tier == "High" or item["urgency"] in ["High", "Medium"]:
                    suggestions.append({
                        **item,
                        "triggered_by_feature": feat,
                        "relevance_explanation": f"Recommended because {reason.get('explanation', '')}"
                    })
                    seen_types.add(item["action_type"])
                    break

    # If fewer than 2 suggestions matched, add foundational suggestions
    if len(suggestions) < 2:
        for cat in ["academics", "attendance"]:
            for item in INTERVENTION_CATALOG[cat]:
                if item["action_type"] not in seen_types:
                    suggestions.append({
                        **item,
                        "triggered_by_feature": "general_support",
                        "relevance_explanation": "Standard preventive support measure."
                    })
                    seen_types.add(item["action_type"])
                    if len(suggestions) >= 3:
                        break
            if len(suggestions) >= 3:
                break

    return suggestions[:4]
