from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Student, RiskScore, User
from ..auth import get_current_user
from ..ml.indic_nlp import (
    INDIC_LANGUAGES,
    detect_indian_language,
    detect_script,
    translate_early_warning_insight,
    generate_parent_regional_alert,
    process_document_intelligence,
    generate_multilingual_quiz
)
from ..ml.groq_service import (
    generate_parent_alert_with_groq,
    is_groq_available,
    get_groq_model
)

router = APIRouter(prefix="/multilingual", tags=["Indic Multilingual & OCR Suite"])

class DetectRequest(BaseModel):
    text: str

class DocumentIntelRequest(BaseModel):
    document_text: str
    target_language: Optional[str] = "en"

class QuizRequest(BaseModel):
    subject: str = "Mathematics"
    topic: str = "Quadratic Equations"
    language: Optional[str] = "en"

class ParentAlertRequest(BaseModel):
    student_id: str
    target_language: Optional[str] = "hi"

class TranslateInsightRequest(BaseModel):
    student_id: str
    target_language: str

@router.get("/languages")
def list_supported_languages():
    """
    Returns full metadata for all 22 Constitutionally Scheduled Languages
    + 7 Regional/Tribal Languages + English, including native scripts and BCP-47 codes.
    """
    languages_list = []
    for code, info in INDIC_LANGUAGES.items():
        languages_list.append({
            "code": code,
            "name": info["name"],
            "native_name": info["native_name"],
            "script": info["script"],
            "bcp47": info["bcp47"],
            "category": info["category"],
            "greeting": info["greeting"],
            "direction": info["direction"]
        })
    return {
        "total_languages": len(languages_list),
        "scheduled_languages_count": sum(1 for l in languages_list if l["category"] == "Scheduled"),
        "regional_tribal_count": sum(1 for l in languages_list if l["category"] == "Regional & Tribal"),
        "languages": languages_list
    }

@router.post("/detect")
def detect_language(req: DetectRequest):
    """
    Detects Indian language, script, and code-mixed patterns from input text.
    """
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    return detect_indian_language(req.text)

@router.post("/document-intel")
def document_intelligence_ocr(
    req: DocumentIntelRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Regional-Language OCR & Document Intelligence:
    Ingests teacher remarks, progress cards, or handwritten notes in ANY Indian language,
    detects script/language, extracts academic distress indicators, and produces an actionable summary.
    """
    if not req.document_text.strip():
        raise HTTPException(status_code=400, detail="Document text cannot be empty")
    
    return process_document_intelligence(req.document_text, req.target_language)

@router.post("/quiz")
def get_multilingual_quiz(
    req: QuizRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generates diagnostic multiple-choice and conceptual practice questions in the requested Indian language.
    """
    return generate_multilingual_quiz(req.subject, req.topic, req.language)

@router.post("/parent-alert")
def create_parent_alert(
    req: ParentAlertRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generates culturally empathetic, respectful regional-language SMS / WhatsApp alerts for parents.
    """
    student = db.query(Student).filter(Student.student_id == req.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    risk = db.query(RiskScore).filter(RiskScore.student_id == req.student_id).order_by(RiskScore.calculated_at.desc()).first()
    risk_tier = risk.risk_tier if risk else "Medium"
    
    factors = risk.top_factors_json if risk else []
    import json
    if isinstance(factors, str):
        factors = json.loads(factors)
    primary_factor = factors[0].get("explanation", "Overall attendance and marks progress") if factors else "Routine academic check-in"
    target_l = req.target_language or "hi"
    lang_info = INDIC_LANGUAGES.get(target_l, {})

    # Try Groq Llama for custom culturally nuanced regional alert
    groq_alert = generate_parent_alert_with_groq(
        student_name=student.name,
        risk_tier=risk_tier,
        primary_reasons=[f.get("explanation", "") for f in factors[:3]] if factors else [primary_factor],
        language_code=target_l,
        language_name=lang_info.get("name", "Hindi")
    )
    if groq_alert:
        return {
            "student_id": student.student_id,
            "student_name": student.name,
            "language": target_l,
            "language_name": lang_info.get("name", target_l),
            "sms_whatsapp_text": groq_alert.get("message"),
            "english_translation": groq_alert.get("english_summary"),
            "recommended_parent_action": "; ".join(groq_alert.get("action_items", [])),
            "tone": "Respectful, supportive partnership",
            "engine": f"Groq Llama ({get_groq_model()})"
        }

    return generate_parent_regional_alert(
        student_name=student.name,
        risk_tier=risk_tier,
        primary_factor=primary_factor,
        target_lang=target_l
    )

@router.post("/translate-insight")
def translate_insight(
    req: TranslateInsightRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Translates a student's risk profile and SHAP attributions into any requested Indian language.
    """
    student = db.query(Student).filter(Student.student_id == req.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    risk = db.query(RiskScore).filter(RiskScore.student_id == req.student_id).order_by(RiskScore.calculated_at.desc()).first()
    if not risk:
        raise HTTPException(status_code=404, detail="Risk score not found for student")

    factors = risk.top_factors_json
    import json
    if isinstance(factors, str):
        factors = json.loads(factors)

    return translate_early_warning_insight(
        student_name=student.name,
        risk_tier=risk.risk_tier,
        probability=risk.risk_probability,
        factors=factors or [],
        target_lang=req.target_language
    )
