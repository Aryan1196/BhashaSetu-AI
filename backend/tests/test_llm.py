"""
BhashaSetu AI - Unit & Integration Tests for LLM Educational Service & Endpoint
Tests POST /api/ai/respond/ with prompt construction, grade/subject adaptation, and mocked LLM calls.
"""

import sys
import os
import json
from unittest.mock import patch, MagicMock
import django

# Ensure root workspace is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.bhashasetu_backend.settings")
django.setup()

from django.test import Client
from backend.app.services.llm_service import llm_service, MockLLMProvider, OpenAILLMProvider
from backend.app.services.prompt_service import SYSTEM_PROMPT, build_user_prompt, GRADE_PEDAGOGY_GUIDELINES

client = Client()


def test_prompt_construction():
    """Verify that user prompt builder correctly embeds grade, subject, target language and pedagogy rules."""
    user_prompt = build_user_prompt(
        text="Water evaporates when heated by the sun.",
        target_language="Odia",
        grade="Class 3",
        subject="Science",
        source_language="English"
    )

    assert "Water evaporates when heated by the sun." in user_prompt
    assert "Student Grade: Class 3" in user_prompt
    assert "Subject: Science" in user_prompt
    assert "Desired Response Language: Odia" in user_prompt
    assert "Understand → Translate → Adapt" in user_prompt


def test_grade_aware_prompt_guidelines():
    """Verify that different grades produce tailored pedagogical instructions."""
    p1 = build_user_prompt("Rain falls from clouds.", "Odia", "Class 1", "Science")
    p5 = build_user_prompt("Rain falls from clouds.", "Odia", "Class 5", "Science")

    assert "Class 1" in p1
    assert "short sentences" in p1.lower() or "simple words" in p1.lower()
    assert "Class 5" in p5


def test_mock_llm_provider_water_evaporation_odia():
    """Verify MockLLMProvider produces appropriate Odia pedagogical response for standard input."""
    provider = MockLLMProvider()
    res = provider.generate_response(
        text="Water evaporates when heated by the sun.",
        target_language="Odia",
        grade="Class 3",
        subject="Science"
    )

    assert res["success"] is True
    assert res["language"] == "Odia"
    assert "ବାଷ୍ପୀଭବନ" in res["response"] or "ବାଷ୍ପ" in res["response"]
    assert res["is_development_fallback"] is True


def test_mock_llm_provider_hindi():
    """Verify MockLLMProvider produces Hindi response."""
    provider = MockLLMProvider()
    res = provider.generate_response(
        text="Water evaporates when heated by the sun.",
        target_language="Hindi",
        grade="Class 3",
        subject="Science"
    )

    assert res["success"] is True
    assert res["language"] == "Hindi"
    assert "वाष्पीकरण" in res["response"] or "भाप" in res["response"]


def test_api_ai_respond_success():
    """Integration test for POST /api/ai/respond/ endpoint."""
    payload = {
        "text": "Water evaporates when heated by the sun.",
        "target_language": "Odia",
        "grade": "Class 3",
        "subject": "Science",
        "source_language": "English"
    }

    response = client.post("/api/ai/respond/", data=json.dumps(payload), content_type="application/json")
    assert response.status_code == 200

    data = response.json()
    assert data["success"] is True
    assert data["language"] == "Odia"
    assert "response" in data
    assert len(data["response"]) > 0


def test_api_ai_respond_without_trailing_slash():
    """Ensure POST /api/ai/respond works smoothly."""
    payload = {
        "text": "Today we are going to learn about the water cycle.",
        "target_language": "Odia",
        "grade": "Class 3",
        "subject": "Science"
    }

    response = client.post("/api/ai/respond", data=json.dumps(payload), content_type="application/json")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["language"] == "Odia"


def test_api_ai_respond_empty_text():
    """Test validation when empty text is provided."""
    payload = {
        "text": "",
        "target_language": "Odia",
        "grade": "Class 3",
        "subject": "Science"
    }

    response = client.post("/api/ai/respond/", data=json.dumps(payload), content_type="application/json")
    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False
    assert "Empty text provided" in data["error"]


def test_api_ai_respond_defaults():
    """Test that default grade, subject, and target language are applied when omitted."""
    payload = {
        "text": "Plants make their food using sunlight."
    }

    response = client.post("/api/ai/respond/", data=json.dumps(payload), content_type="application/json")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["language"] == "Odia"


@patch("backend.app.services.llm_service.httpx.Client")
def test_openai_llm_provider_mocked_success(mock_client_cls):
    """Test OpenAILLMProvider execution with mocked HTTP 200 response."""
    mock_client = MagicMock()
    mock_client_cls.return_value.__enter__.return_value = mock_client
    
    mock_http_response = MagicMock()
    mock_http_response.status_code = 200
    mock_http_response.json.return_value = {
        "choices": [
            {
                "message": {
                    "role": "assistant",
                    "content": "ସୂର୍ଯ୍ୟଙ୍କ ତାପରେ ପାଣି ଗରମ ହୋଇ ଉପରକୁ ଉଠିଯାଏ ।"
                }
            }
        ]
    }
    mock_client.post.return_value = mock_http_response

    provider = OpenAILLMProvider(api_key="sk-test-key-12345")
    res = provider.generate_response(
        text="Water evaporates when heated by the sun.",
        target_language="Odia",
        grade="Class 3",
        subject="Science"
    )

    assert res["success"] is True
    assert res["language"] == "Odia"
    assert res["response"] == "ସୂର୍ଯ୍ୟଙ୍କ ତାପରେ ପାଣି ଗରମ ହୋଇ ଉପରକୁ ଉଠିଯାଏ ।"
    assert res["provider_mode"] == "production_llm"


def test_security_no_api_key_exposure():
    """Ensure API keys and secret variables are never present in API outputs or error responses."""
    payload = {
        "text": "Water evaporates when heated by the sun.",
        "target_language": "Odia"
    }

    response = client.post("/api/ai/respond/", data=json.dumps(payload), content_type="application/json")
    content_str = response.content.decode("utf-8")
    
    assert "sk-" not in content_str
    assert "gsk_" not in content_str
    assert "SECRET_KEY" not in content_str


def test_ai_tutor_odia_query():
    """Ensure student question in Odia receives answer in Odia."""
    payload = {
        "query": "ପାଣି କାହିଁକି ବାଷ୍ପ ହୁଏ ?",
        "grade": "Class 3",
        "subject": "Science"
    }
    response = client.post("/api/ai/tutor/", data=json.dumps(payload), content_type="application/json")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["detected_language"] == "Odia"
    assert "ବାଷ୍ପ" in data["response"] or "ପାଣି" in data["response"]


def test_ai_tutor_hindi_query():
    """Ensure student question in Hindi receives answer in Hindi."""
    payload = {
        "query": "पेड़ पौधे अपना खाना कैसे बनाते हैं?",
        "grade": "Class 3",
        "subject": "Science"
    }
    response = client.post("/api/ai/tutor/", data=json.dumps(payload), content_type="application/json")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["detected_language"] == "Hindi"
    assert "पौधे" in data["response"] or "रोशनी" in data["response"] or "पेड़" in data["response"]


def test_ai_tutor_english_query():
    """Ensure student question in English receives answer in English."""
    payload = {
        "query": "Why does water evaporate?",
        "grade": "Class 3",
        "subject": "Science"
    }
    response = client.post("/api/ai/tutor/", data=json.dumps(payload), content_type="application/json")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["detected_language"] == "English"
    assert "water" in data["response"].lower() or "sun" in data["response"].lower()


def test_ai_tutor_empty_query():
    """Test validation when empty query is sent to AI tutor."""
    payload = {"query": ""}
    response = client.post("/api/ai/tutor/", data=json.dumps(payload), content_type="application/json")
    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False
    assert "Empty question" in data["error"]
