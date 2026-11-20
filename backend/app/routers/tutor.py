from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Student, Marks, RiskScore, User
from ..auth import get_current_user
from ..ml.indic_nlp import generate_multilingual_quiz, INDIC_LANGUAGES
from ..ml.groq_service import (
    generate_concept_explanation_with_groq,
    generate_study_plan_with_groq,
    is_groq_available,
    get_groq_model
)

router = APIRouter(prefix="/tutor", tags=["AI Study Tutor & Planner"])

class StudyPlanRequest(BaseModel):
    student_id: str
    target_hours_per_day: Optional[float] = 1.5

class ConceptExplanationRequest(BaseModel):
    subject: str
    topic: str
    grade: Optional[int] = 10
    language: Optional[str] = "en"

class PracticeQuestionRequest(BaseModel):
    subject: str
    topic: str
    difficulty: Optional[str] = "Medium"
    language: Optional[str] = "en"

CONCEPT_LIBRARY = {
    "mathematics": {
        "linear equations": {
            "title": "Solving Linear Equations in Two Variables",
            "concept_summary": "A linear equation forms a straight line on a graph. When you have two equations, their intersection point is the unique solution that satisfies both.",
            "real_world_analogy": "Imagine buying pens and notebooks with a fixed budget. Finding the exact price of one pen and one notebook given two different receipts is solving a system of equations!",
            "key_steps": [
                "Step 1: Express one variable in terms of the other (Substitution method) or multiply to cancel out coefficients (Elimination method).",
                "Step 2: Substitute the result into the remaining equation to solve for the first unknown.",
                "Step 3: Plug that value back into either original equation to find the second unknown.",
                "Step 4: Check your solution by verifying that both original equations balance."
            ],
            "pro_tip": "Always draw a quick sketch of the lines to check if they intersect (1 solution), are parallel (no solution), or overlap (infinite solutions)."
        },
        "quadratic equations": {
            "title": "Quadratic Equations (ax² + bx + c = 0)",
            "concept_summary": "A quadratic equation involves a variable raised to the second power, forming a parabola (U-shaped curve).",
            "real_world_analogy": "Throwing a cricket ball in the air creates an arch path (parabola). The ball's height over time is governed by a quadratic equation!",
            "key_steps": [
                "Step 1: Standard form: ensure everything is on one side equaling zero: ax² + bx + c = 0.",
                "Step 2: Check the discriminant: D = b² - 4ac. If D > 0, there are two distinct real roots.",
                "Step 3: Apply the Quadratic Formula: x = (-b ± √D) / (2a).",
                "Step 4: Verify your roots by factoring when possible."
            ],
            "pro_tip": "If the problem involves physical distance or time, discard negative root solutions."
        }
    },
    "science": {
        "photosynthesis": {
            "title": "Photosynthesis: The Plant Energy Engine",
            "concept_summary": "The biological process by which green plants transform sunlight, carbon dioxide, and water into chemical energy (glucose) while releasing oxygen.",
            "real_world_analogy": "Think of plant leaves as solar-powered kitchens. Sunlight is the oven power, water and CO2 are raw ingredients, and glucose is the baked bread!",
            "key_steps": [
                "Light Reaction: Occurs in the thylakoid membranes where chlorophyll absorbs light to split water into oxygen and hydrogen protons.",
                "Dark Reaction (Calvin Cycle): Occurs in the stroma where carbon dioxide is fixed into carbohydrate molecules."
            ],
            "pro_tip": "Remember the balanced equation: 6CO₂ + 6H₂O + Sunlight → C₆H₁₂O₆ + 6O₂."
        },
        "newton's laws": {
            "title": "Newton's Laws of Motion",
            "concept_summary": "Three fundamental physical principles describing the relationship between the forces acting on a body and its motion.",
            "real_world_analogy": "When you are riding in a bus and it suddenly brakes, your body lurches forward. That is inertia (First Law)!",
            "key_steps": [
                "1st Law (Inertia): An object remains at rest or constant velocity unless acted upon by a net external force.",
                "2nd Law (Force): F = ma. Heavier objects require more force to accelerate.",
                "3rd Law (Action-Reaction): For every action, there is an equal and opposite reaction."
            ],
            "pro_tip": "Force is a vector quantity—always pay close attention to direction (+ vs -)."
        }
    }
}

@router.post("/study-plan")
def generate_personalized_study_plan(
    req: StudyPlanRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.student_id == req.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Fetch lowest scoring subjects
    marks = db.query(Marks).filter(Marks.student_id == req.student_id).order_by(Marks.score.asc()).limit(4).all()
    weak_subjects = [m.subject for m in marks[:2]] if marks else ["Mathematics", "Science"]

    # Try Groq Llama generative study plan
    groq_plan = generate_study_plan_with_groq(
        student_name=student.name,
        grade=student.grade,
        weak_subjects=weak_subjects,
        target_hours=req.target_hours_per_day or 1.5,
        language_name="English"
    )
    if groq_plan and "schedule" in groq_plan:
        return {
            "student_id": student.student_id,
            "student_name": student.name,
            "priority_subjects": weak_subjects,
            "target_hours_per_day": req.target_hours_per_day,
            "weekly_schedule": groq_plan.get("schedule"),
            "habit_goals": groq_plan.get("habits", [
                "25-minute Pomodoro focus blocks with 5-minute movement breaks",
                "Review yesterday's mistake notes before starting new problem sets",
                "Spend 15 minutes reviewing error log on weekends"
            ]),
            "engine": f"Groq Llama ({get_groq_model()})"
        }

    # Generate structured 7-day schedule (Built-in Heuristic Fallback)
    weekly_schedule = [
        {
            "day": "Monday",
            "focus_subject": weak_subjects[0],
            "duration_minutes": 60,
            "tasks": ["Concept Review & Formula Card building", "Solve 5 foundation problems", "Note doubts for class teacher"],
            "time_slot": "5:30 PM - 6:30 PM"
        },
        {
            "day": "Tuesday",
            "focus_subject": weak_subjects[1] if len(weak_subjects) > 1 else "English",
            "duration_minutes": 60,
            "tasks": ["Textbook chapter reading", "Short answer summary writing", "Key definitions flashcards"],
            "time_slot": "5:30 PM - 6:30 PM"
        },
        {
            "day": "Wednesday",
            "focus_subject": weak_subjects[0],
            "duration_minutes": 60,
            "tasks": ["Solve textbook sample questions", "Peer study check-in with study buddy", "Homework submission check"],
            "time_slot": "5:30 PM - 6:30 PM"
        },
        {
            "day": "Thursday",
            "focus_subject": "Social Science / General",
            "duration_minutes": 45,
            "tasks": ["Mind mapping of key historical events or geography maps", "Clear pending assignments"],
            "time_slot": "6:00 PM - 6:45 PM"
        },
        {
            "day": "Friday",
            "focus_subject": weak_subjects[1] if len(weak_subjects) > 1 else "Science",
            "duration_minutes": 60,
            "tasks": ["Lab formula application", "Review teacher feedback on recent test"],
            "time_slot": "5:30 PM - 6:30 PM"
        },
        {
            "day": "Saturday",
            "focus_subject": "Weekly Consolidation & Practice Quiz",
            "duration_minutes": 90,
            "tasks": ["Timed 20-minute practice quiz (low-stakes)", "Error review & corrections journal", "Prep bag and notes for Monday morning"],
            "time_slot": "10:00 AM - 11:30 AM"
        },
        {
            "day": "Sunday",
            "focus_subject": "Rest, Well-being & Light Planning",
            "duration_minutes": 30,
            "tasks": ["Organize desk & school uniform", "Set goals for upcoming week", "Sleep early for punctual Monday arrival"],
            "time_slot": "7:00 PM - 7:30 PM"
        }
    ]

    return {
        "student_id": student.student_id,
        "student_name": student.name,
        "priority_subjects": weak_subjects,
        "target_hours_per_day": req.target_hours_per_day,
        "weekly_schedule": weekly_schedule,
        "habit_goals": [
            "Arrive to morning assembly by 8:15 AM every day",
            "Complete homework assignments the evening they are assigned",
            "Spend 15 minutes reviewing error log on weekends"
        ]
    }

@router.post("/explain")
def explain_concept(
    req: ConceptExplanationRequest,
    current_user: User = Depends(get_current_user)
):
    # 1. Try Groq Llama 3.3 explanation first if available
    lang = req.language or "en"
    lang_name = INDIC_LANGUAGES.get(lang, {}).get("name", "English")
    groq_explanation = generate_concept_explanation_with_groq(
        subject=req.subject,
        topic=req.topic,
        grade=req.grade or 10,
        language_code=lang,
        language_name=lang_name
    )
    if groq_explanation:
        groq_explanation["engine"] = f"Groq Llama ({get_groq_model()})"
        return groq_explanation

    sub = req.subject.lower()
    top = req.topic.lower()

    # Look up in curated library or generate structured explanation
    match = None
    if sub in CONCEPT_LIBRARY:
        for t_key in CONCEPT_LIBRARY[sub]:
            if t_key in top or top in t_key:
                match = CONCEPT_LIBRARY[sub][t_key]
                break

    if not match:
        # Structured fallback explanation
        match = {
            "title": f"Foundation Overview: {req.topic.title()} ({req.subject.title()})",
            "concept_summary": f"A fundamental cornerstone of Grade {req.grade} {req.subject}. Mastering this topic provides the base for upcoming exam assessments.",
            "real_world_analogy": "Like building a strong foundation for a house, understanding this concept step-by-step makes advanced topics much simpler.",
            "key_steps": [
                "1. Understand the core definitions and terms.",
                "2. Work through 2 basic guided examples with formulas.",
                "3. Try 3 independent practice problems to test understanding.",
                "4. Review mistakes immediately in an errors journal."
            ],
            "pro_tip": "Break complex problems into smaller sub-steps and write down given variables first."
        }

    return match

@router.post("/practice-question")
def get_practice_question(
    req: PracticeQuestionRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Returns a guided practice question with step-by-step solution in the user's preferred Indian language.
    """
    if req.language and req.language != "en":
        quiz = generate_multilingual_quiz(req.subject, req.topic, req.language)
        return {
            "subject": req.subject,
            "topic": req.topic,
            "question": quiz["question"],
            "hint": quiz["hint"],
            "options": quiz.get("options", []),
            "steps": [
                f"Option: {quiz.get('correct_option', 'A')}",
                quiz.get("explanation", "")
            ],
            "answer": quiz.get("correct_option", "A"),
            "encouragement": f"Native language ({req.language.upper()}) diagnostic question verified."
        }

    sub = req.subject.lower()
    if "math" in sub:
        return {
            "subject": "Mathematics",
            "topic": req.topic,
            "question": "Solve for x: 3x - 7 = 14",
            "hint": "Add 7 to both sides of the equation first, then isolate x.",
            "steps": [
                "Step 1: 3x - 7 + 7 = 14 + 7",
                "Step 2: 3x = 21",
                "Step 3: Divide both sides by 3: x = 21 / 3",
                "Step 4: x = 7"
            ],
            "answer": "x = 7",
            "encouragement": "Excellent work! Linear algebra forms the basis for higher calculus and physics."
        }
    else:
        return {
            "subject": req.subject,
            "topic": req.topic,
            "question": "State the primary gas absorbed by plants during the light-independent reactions of photosynthesis.",
            "hint": "It is exhaled by animals and absorbed by plant stomata.",
            "steps": [
                "Step 1: Plants take in water through roots and gas through stomata.",
                "Step 2: The carbon source for building glucose is carbon dioxide (CO2)."
            ],
            "answer": "Carbon Dioxide (CO2)",
            "encouragement": "Spot on! Stomata open during the day to allow gas exchange."
        }
