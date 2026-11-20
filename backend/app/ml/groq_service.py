import os
import json
import logging
import time
from typing import Optional, List, Dict, Any
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from root or backend
env_paths = [
    Path(__file__).resolve().parent.parent.parent.parent / ".env",
    Path(__file__).resolve().parent.parent.parent / ".env",
    Path(".env")
]
for ep in env_paths:
    if ep.exists():
        load_dotenv(ep)
        break

logger = logging.getLogger("studypulse.groq")

# In-memory runtime override if set via API
_RUNTIME_GROQ_API_KEY: Optional[str] = None
_RUNTIME_GROQ_MODEL: Optional[str] = None

# Default preferred models in order of priority
PREFERRED_MODELS = [
    "qwen/qwen3.8-27b",
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "allam-2-7b"
]

AVAILABLE_MODELS = [
    {"id": "qwen/qwen3.8-27b", "name": "Qwen 3.8 27B", "badge": "Recommended • Multilingual Reasoning", "context_window": 131072},
    {"id": "openai/gpt-oss-120b", "name": "GPT OSS 120B", "badge": "Deep Reasoning • 131k context", "context_window": 131072},
    {"id": "openai/gpt-oss-20b", "name": "GPT OSS 20B", "badge": "Ultra-Fast • 131k context", "context_window": 131072},
    {"id": "llama-3.3-70b-versatile", "name": "Llama 3.3 70B Versatile", "badge": "Meta Llama", "context_window": 128000}
]

def get_groq_api_key() -> Optional[str]:
    """Retrieve Groq API key from runtime override or environment variables."""
    global _RUNTIME_GROQ_API_KEY
    if _RUNTIME_GROQ_API_KEY:
        return _RUNTIME_GROQ_API_KEY.strip()
    return os.getenv("GROQ_API_KEY", "").strip() or None

def get_groq_client():
    """Create Groq client instance if key is available."""
    key = get_groq_api_key()
    if not key:
        return None
    try:
        from groq import Groq
        return Groq(api_key=key, timeout=25.0)
    except Exception as e:
        logger.error("Error creating Groq client: %s", e)
        return None

def get_available_chat_models(client=None) -> List[Dict[str, Any]]:
    """Query Groq API dynamically for chat-completion models available on the active key."""
    if client is None:
        client = get_groq_client()
    if not client:
        return [
            {"id": "qwen/qwen3.8-27b", "name": "Qwen 3.8 27B", "badge": "Multilingual Reasoning", "context_window": 131072},
            {"id": "openai/gpt-oss-120b", "name": "GPT OSS 120B", "badge": "Deep Reasoning", "context_window": 131072},
            {"id": "openai/gpt-oss-20b", "name": "GPT OSS 20B", "badge": "Ultra-Fast Inference", "context_window": 131072},
            {"id": "llama-3.3-70b-versatile", "name": "Llama 3.3 70B Versatile", "badge": "Meta Llama", "context_window": 128000}
        ]

    try:
        model_list = client.models.list().data
        viable = []
        excluded = ["whisper", "prompt-guard", "orpheus", "safeguard"]
        for m in model_list:
            if not any(ex in m.id for ex in excluded):
                name = getattr(m, "name", m.id)
                badge = "Fast & Capable"
                if "qwen" in m.id:
                    badge = "Recommended • Multilingual Reasoning"
                elif "120b" in m.id:
                    badge = "Deep Reasoning • 131k context"
                elif "20b" in m.id:
                    badge = "Ultra-Fast • 131k context"
                elif "llama" in m.id:
                    badge = "Meta Llama"

                viable.append({
                    "id": m.id,
                    "name": name,
                    "badge": badge,
                    "context_window": getattr(m, "context_window", 131072)
                })

        # Sort with preferred priority
        viable.sort(key=lambda x: (
            0 if "qwen" in x["id"] else
            1 if "120b" in x["id"] else
            2 if "llama" in x["id"] else
            3 if "20b" in x["id"] else 4
        ))
        return viable if viable else [
            {"id": "qwen/qwen3.8-27b", "name": "Qwen 3.8 27B", "badge": "Active", "context_window": 131072}
        ]
    except Exception as e:
        logger.warning("Could not list Groq models dynamically: %s", e)
        return [
            {"id": "qwen/qwen3.8-27b", "name": "Qwen 3.8 27B", "badge": "Active", "context_window": 131072}
        ]

def get_groq_model() -> str:
    """Retrieve active Groq model identifier with auto-fallback."""
    global _RUNTIME_GROQ_MODEL
    if _RUNTIME_GROQ_MODEL:
        return _RUNTIME_GROQ_MODEL
    env_model = os.getenv("GROQ_MODEL", "").strip()
    if env_model:
        return env_model
    return "qwen/qwen3.8-27b"

def set_runtime_groq_config(api_key: Optional[str] = None, model: Optional[str] = None, save_to_env: bool = True):
    """Set Groq API key and model at runtime, optionally saving to .env file."""
    global _RUNTIME_GROQ_API_KEY, _RUNTIME_GROQ_MODEL
    if api_key is not None:
        _RUNTIME_GROQ_API_KEY = api_key.strip()
        os.environ["GROQ_API_KEY"] = _RUNTIME_GROQ_API_KEY
    if model is not None:
        _RUNTIME_GROQ_MODEL = model.strip()
        os.environ["GROQ_MODEL"] = _RUNTIME_GROQ_MODEL

    if save_to_env:
        root_env = Path(__file__).resolve().parent.parent.parent.parent / ".env"
        try:
            lines = []
            key_written = False
            model_written = False
            if root_env.exists():
                with open(root_env, "r", encoding="utf-8") as f:
                    for line in f:
                        if line.startswith("GROQ_API_KEY="):
                            lines.append(f"GROQ_API_KEY={_RUNTIME_GROQ_API_KEY or ''}\n")
                            key_written = True
                        elif line.startswith("GROQ_MODEL="):
                            lines.append(f"GROQ_MODEL={_RUNTIME_GROQ_MODEL or get_groq_model()}\n")
                            model_written = True
                        else:
                            lines.append(line)
            if not key_written and _RUNTIME_GROQ_API_KEY is not None:
                lines.append(f"GROQ_API_KEY={_RUNTIME_GROQ_API_KEY}\n")
            if not model_written and _RUNTIME_GROQ_MODEL is not None:
                lines.append(f"GROQ_MODEL={_RUNTIME_GROQ_MODEL}\n")

            with open(root_env, "w", encoding="utf-8") as f:
                f.writelines(lines)
            logger.info("Updated Groq configuration in %s", root_env)
        except Exception as e:
            logger.warning("Could not persist to .env: %s", e)

def is_groq_available() -> bool:
    """Check if a non-empty Groq API key is present."""
    key = get_groq_api_key()
    return bool(key and len(key) >= 10)

def get_masked_api_key() -> str:
    """Return a masked representation of the active key for security."""
    key = get_groq_api_key()
    if not key:
        return ""
    if len(key) <= 8:
        return "***"
    return f"{key[:4]}...{key[-4:]}"

def test_groq_connection(api_key: Optional[str] = None) -> Dict[str, Any]:
    """Test connection to Groq API with latency measurement and auto-model detection."""
    test_key = api_key.strip() if api_key is not None else get_groq_api_key()
    if not test_key:
        return {
            "success": False,
            "error": "No Groq API key provided. Please configure GROQ_API_KEY in .env or the UI.",
            "latency_ms": 0
        }

    try:
        from groq import Groq
        client = Groq(api_key=test_key, timeout=15.0)

        # Discover accessible models on this specific account
        available = get_available_chat_models(client)
        chosen_model = available[0]["id"] if available else "qwen/qwen3.8-27b"

        # Try active model if in available list
        curr = get_groq_model()
        if any(m["id"] == curr for m in available):
            chosen_model = curr

        start_t = time.time()
        completion = client.chat.completions.create(
            model=chosen_model,
            messages=[
                {"role": "system", "content": "You are StudyPulse AI tester. Reply with 'READY: Online'."},
                {"role": "user", "content": "Ping status"}
            ],
            max_tokens=20,
            temperature=0.2
        )
        latency = int((time.time() - start_t) * 1000)
        reply = completion.choices[0].message.content.strip()

        return {
            "success": True,
            "model_tested": chosen_model,
            "available_models": available,
            "latency_ms": latency,
            "response": reply,
            "message": f"Successfully connected to Groq! Model: {chosen_model} (Latency: {latency}ms)"
        }
    except Exception as e:
        logger.error("Groq connection test failed: %s", e)
        return {
            "success": False,
            "error": str(e),
            "latency_ms": 0
        }

def call_groq_chat(
    messages: List[Dict[str, str]],
    model: Optional[str] = None,
    temperature: float = 0.5,
    max_tokens: int = 1024,
    response_json: bool = False
) -> Optional[str]:
    """Execute chat completion call to Groq with automatic model fallback."""
    client = get_groq_client()
    if not client:
        return None

    configured_model = model or get_groq_model()
    available_models = [m["id"] for m in get_available_chat_models(client)]

    # Prioritize: configured_model, then available models
    models_to_try = []
    if configured_model in available_models:
        models_to_try.append(configured_model)
    elif configured_model:
        models_to_try.append(configured_model)

    for am in available_models:
        if am not in models_to_try:
            models_to_try.append(am)

    for target_model in models_to_try[:3]:
        kwargs = {
            "model": target_model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        if response_json:
            kwargs["response_format"] = {"type": "json_object"}

        try:
            completion = client.chat.completions.create(**kwargs)
            content = completion.choices[0].message.content
            if content and content.strip():
                return content.strip()
        except Exception as e:
            logger.warning("Groq call to model %s failed: %s", target_model, e)
            continue

    return None

# ==============================================================================
# Domain-Specific AI Workflows Powered by Groq LLM
# ==============================================================================

def generate_counselor_response_with_groq(
    user_message: str,
    student_context: Optional[Dict[str, Any]],
    language_code: str = "en",
    language_name: str = "English",
    is_code_mixed: bool = False
) -> Optional[str]:
    """Generate empathetic, pedagogical student counselor reply using Groq."""
    if not is_groq_available():
        return None

    from datetime import datetime
    now = datetime.now()
    current_date_str = now.strftime("%A, %d %B %Y")
    current_time_str = now.strftime("%I:%M %p")

    ctx_text = "No specific student selected. General educational inquiry."
    if student_context:
        ctx_text = (
            f"Target Student: {student_context.get('name')} (ID: {student_context.get('student_id')})\n"
            f"Grade & Section: Grade {student_context.get('grade')}-{student_context.get('section')}\n"
            f"Risk Tier: {student_context.get('risk_tier')} ({int(student_context.get('risk_probability', 0.5) * 100)}% risk)\n"
            f"Attendance Rate: {student_context.get('latest_attendance', 'N/A')}%\n"
            f"Top SHAP Contributing Risk Factors:\n"
        )
        factors = student_context.get('top_factors', [])
        for f in factors[:3]:
            ctx_text += f" - {f.get('label', f.get('feature'))}: {f.get('explanation')}\n"

    system_prompt = (
        "You are StudyPulse AI, an empathetic, highly knowledgeable AI Student Counselor and Early-Warning Assistant "
        "deployed in Indian secondary schools. You adhere to Indian Digital Personal Data Protection (DPDP) principles.\n"
        f"System Date & Time: {current_date_str}, {current_time_str} IST (Academic Session 2026-2027, Term 2).\n"
        f"Active Language: {language_name} ({language_code}). "
        + ("Support natural code-mixed conversation (e.g. Hinglish / Telugish / Tanglish) as preferred by Indian students and educators.\n" if is_code_mixed or language_code != "en" else "")
        + "Your behavioral guidelines:\n"
        "1. Always start your response with a complete, warm greeting (e.g. 'Namaste! 🙏' or 'Hello! 👋').\n"
        "2. If asked about current date, deadlines, term schedules or time, state the current date and academic term directly.\n"
        "3. Provide encouraging, supportive, non-stigmatizing pastoral guidance.\n"
        "4. Explain academic risk objectively using 4-week indicators (attendance, marks, conduct, digital LMS engagement).\n"
        "5. Provide actionable, realistic remediation steps (e.g. attendance contracts, peer mentoring, foundational practice).\n"
        "6. Format your output with clear markdown: bullet points, bold key takeaways, and structured sections.\n"
        f"Student Context:\n{ctx_text}"
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_message}
    ]

    return call_groq_chat(messages, temperature=0.6, max_tokens=900)

def generate_concept_explanation_with_groq(
    subject: str,
    topic: str,
    grade: int = 10,
    language_code: str = "en",
    language_name: str = "English"
) -> Optional[Dict[str, Any]]:
    """Generate comprehensive concept explanation and practice with Groq LLM."""
    if not is_groq_available():
        return None

    system_prompt = (
        "You are a master Indian school educator (CBSE/ICSE/State Board curriculum). "
        "Explain academic concepts with clarity, inspiring real-world analogies, and step-by-step guidance.\n"
        f"Target Subject: {subject}\n"
        f"Target Topic: {topic}\n"
        f"Student Grade: {grade}\n"
        f"Target Language: {language_name} ({language_code})\n\n"
        "Respond ONLY with a valid JSON object matching this schema:\n"
        "{\n"
        '  "title": "Title of topic in target language",\n'
        '  "concept_summary": "2-3 sentence core definition and why it matters",\n'
        '  "real_world_analogy": "A relatable real-world analogy from everyday life in India",\n'
        '  "key_steps": ["Step 1 explanation", "Step 2 explanation", "Step 3 explanation", "Step 4 explanation"],\n'
        '  "pro_tip": "High-yield exam tip or common pitfall to avoid"\n'
        "}"
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Please explain '{topic}' for Grade {grade} {subject}."}
    ]

    reply = call_groq_chat(messages, temperature=0.3, max_tokens=1000, response_json=True)
    if not reply:
        return None
    try:
        return json.loads(reply)
    except Exception as e:
        logger.warning("Failed to parse Groq concept JSON: %s", e)
        return None

def generate_study_plan_with_groq(
    student_name: str,
    grade: int,
    weak_subjects: List[str],
    target_hours: float,
    language_name: str = "English"
) -> Optional[Dict[str, Any]]:
    """Generate personalized 7-day study schedule with Groq LLM."""
    if not is_groq_available():
        return None

    system_prompt = (
        "You are an expert academic counselor and study planner. "
        "Create an optimal 7-day remedial study timetable for an Indian school student.\n"
        f"Student: {student_name}, Grade: {grade}\n"
        f"Weak Subjects: {', '.join(weak_subjects)}\n"
        f"Target Daily Study: {target_hours} hours\n"
        f"Language: {language_name}\n\n"
        "Respond ONLY with a valid JSON object matching this schema:\n"
        "{\n"
        '  "weekly_goal": "Overarching academic recovery goal for the week",\n'
        '  "schedule": [\n'
        '    {\n'
        '      "day": "Monday",\n'
        '      "focus_subject": "Subject name",\n'
        '      "duration_minutes": 60,\n'
        '      "tasks": ["Task 1", "Task 2", "Task 3"]\n'
        '    }\n'
        '  ],\n'
        '  "habits": ["Daily Pomodoro cycle tip", "Sleep schedule advice", "Active recall tip"]\n'
        "}"
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": "Generate the 7-day remedial study schedule."}
    ]

    reply = call_groq_chat(messages, temperature=0.4, max_tokens=1200, response_json=True)
    if not reply:
        return None
    try:
        return json.loads(reply)
    except Exception as e:
        logger.warning("Failed to parse Groq study plan JSON: %s", e)
        return None

def generate_parent_alert_with_groq(
    student_name: str,
    risk_tier: str,
    primary_reasons: List[str],
    language_code: str,
    language_name: str
) -> Optional[Dict[str, str]]:
    """Generate supportive regional parent communication using Groq."""
    if not is_groq_available():
        return None

    system_prompt = (
        "You are a school pastoral liaison communicating with Indian parents. "
        f"Translate and formulate a respectful, supportive, non-alarmist notification in {language_name} ({language_code}). "
        "Indian parents appreciate constructive partnerships between home and school.\n\n"
        "Respond ONLY with a valid JSON object:\n"
        "{\n"
        '  "title": "Title in target language",\n'
        '  "message": "Full SMS/WhatsApp message in target Indian language script with respectful salutation",\n'
        '  "action_items": ["Action item 1 for parent", "Action item 2"],\n'
        '  "english_summary": "1-sentence English translation for educator records"\n'
        "}"
    )

    content_prompt = (
        f"Student: {student_name}\n"
        f"Risk Status: {risk_tier}\n"
        f"Observations: {'; '.join(primary_reasons)}\n"
        f"Please write the alert in {language_name} ({language_code})."
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": content_prompt}
    ]

    reply = call_groq_chat(messages, temperature=0.4, max_tokens=800, response_json=True)
    if not reply:
        return None
    try:
        return json.loads(reply)
    except Exception as e:
        logger.warning("Failed to parse Groq parent alert JSON: %s", e)
        return None
