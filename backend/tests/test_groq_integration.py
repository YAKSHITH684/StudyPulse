import os
import pytest
from app.ml.groq_service import (
    is_groq_available,
    get_groq_model,
    get_masked_api_key,
    set_runtime_groq_config,
    test_groq_connection as check_groq_connection,
    AVAILABLE_MODELS
)

def test_groq_availability_defaults():
    set_runtime_groq_config(api_key="", model="llama-3.3-70b-versatile", save_to_env=False)
    assert not is_groq_available()
    assert get_masked_api_key() == ""
    assert get_groq_model() == "llama-3.3-70b-versatile"
    assert len(AVAILABLE_MODELS) >= 2

def test_groq_masked_key():
    set_runtime_groq_config(api_key="gsk_1234567890abcdef", save_to_env=False)
    assert is_groq_available()
    assert get_masked_api_key().startswith("gsk_")
    assert get_masked_api_key().endswith("cdef")
    # Reset
    set_runtime_groq_config(api_key="", save_to_env=False)

def test_groq_test_connection_fails_cleanly_on_empty_key():
    res = check_groq_connection("")
    assert not res["success"]
    assert "No Groq API key" in res["error"]
