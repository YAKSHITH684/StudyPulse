from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from ..models import User
from ..auth import get_current_user
from ..ml.groq_service import (
    is_groq_available,
    get_groq_model,
    get_masked_api_key,
    set_runtime_groq_config,
    test_groq_connection,
    call_groq_chat,
    get_available_chat_models
)

router = APIRouter(prefix="/llm", tags=["LLM & Groq Llama Integration"])

class GroqConfigUpdate(BaseModel):
    api_key: str
    model: Optional[str] = "llama-3.3-70b-versatile"
    persist: Optional[bool] = True

class GroqTestRequest(BaseModel):
    api_key: Optional[str] = None

class GroqDirectPrompt(BaseModel):
    prompt: str
    system_prompt: Optional[str] = None
    model: Optional[str] = None
    temperature: Optional[float] = 0.5
    max_tokens: Optional[int] = 512

@router.get("/status")
def get_groq_status():
    """Retrieve current Groq LLM availability, active model, and masked key."""
    models = get_available_chat_models()
    return {
        "groq_configured": is_groq_available(),
        "active_model": get_groq_model(),
        "masked_key": get_masked_api_key(),
        "available_models": models,
        "engine_label": f"Groq AI ({get_groq_model()})" if is_groq_available() else "Built-in Intelligent Rule/Indic NLP Engine"
    }

@router.post("/test")
def test_connection(req: GroqTestRequest):
    """Test connection to Groq API with given key or configured key."""
    res = test_groq_connection(req.api_key)
    return res

@router.post("/config")
def update_groq_configuration(
    req: GroqConfigUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update Groq API key and preferred model at runtime and in .env."""
    clean_key = req.api_key.strip()
    if not clean_key:
        raise HTTPException(status_code=400, detail="API key cannot be empty")

    # Perform quick validation
    test_result = test_groq_connection(clean_key)
    if not test_result.get("success"):
        raise HTTPException(
            status_code=400, 
            detail=f"Groq API key test failed: {test_result.get('error')}"
        )

    # Save to runtime & .env
    set_runtime_groq_config(api_key=clean_key, model=req.model, save_to_env=req.persist)

    return {
        "success": True,
        "message": "Groq API key successfully verified and configured!",
        "active_model": get_groq_model(),
        "masked_key": get_masked_api_key(),
        "latency_ms": test_result.get("latency_ms", 0)
    }

@router.post("/generate")
def generate_direct_text(
    req: GroqDirectPrompt,
    current_user: User = Depends(get_current_user)
):
    """Direct inference endpoint powered by Groq Llama."""
    if not is_groq_available():
        raise HTTPException(
            status_code=400, 
            detail="Groq API key is not configured. Please add GROQ_API_KEY."
        )

    messages = []
    if req.system_prompt:
        messages.append({"role": "system", "content": req.system_prompt})
    messages.append({"role": "user", "content": req.prompt})

    reply = call_groq_chat(
        messages=messages,
        model=req.model,
        temperature=req.temperature,
        max_tokens=req.max_tokens
    )
    if not reply:
        raise HTTPException(status_code=502, detail="Groq LLM call timed out or failed.")

    return {
        "reply": reply,
        "model_used": req.model or get_groq_model()
    }
