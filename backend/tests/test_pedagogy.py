import sys
import os
import json
import django

# Ensure root workspace is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.bhashasetu_backend.settings")
django.setup()

from django.test import Client
from backend.app.services.pedagogy_service import pedagogy_service, MockPedagogyProvider

client = Client()

def test_pedagogy_service_class3_science_odia():
    """Unit test for Class 3 Science Odia pedagogical explanation."""
    provider = MockPedagogyProvider()
    res = provider.explain("The sun heats water and causes evaporation.", 3, "Science", "Odia")
    
    assert res["grade"] == 3
    assert res["subject"] == "Science"
    assert res["language"] == "Odia"
    assert "ସୂର୍ଯ୍ୟଙ୍କ ତାପରେ" in res["simple_explanation"]
    assert isinstance(res["key_points"], list)
    assert len(res["key_points"]) > 0
    assert "example" in res
    assert "learner_question" in res
    assert res["is_development_fallback"] is True

def test_pedagogy_service_class3_science_english():
    """Unit test for Class 3 Science English pedagogical explanation."""
    res = pedagogy_service.explain("The sun heats water and causes evaporation.", 3, "Science", "English")
    
    assert res["grade"] == 3
    assert res["language"] == "English"
    assert "sun heats water" in res["simple_explanation"].lower()
    assert len(res["key_points"]) >= 2

def test_pedagogy_api_endpoint():
    """Integration test for POST /api/pedagogy/explain endpoint."""
    payload = {
        "text": "The sun heats water and causes evaporation.",
        "grade": 3,
        "subject": "Science",
        "language": "Odia"
    }
    response = client.post("/api/pedagogy/explain", data=json.dumps(payload), content_type="application/json")
    assert response.status_code == 200
    
    data = response.json()
    assert data["grade"] == 3
    assert data["subject"] == "Science"
    assert data["language"] == "Odia"
    assert "simple_explanation" in data
    assert "key_points" in data
    assert "example" in data
    assert "learner_question" in data
    assert data["provider_mode"] in ["mock", "production"]

def test_pedagogy_empty_text_error():
    """Test error handling for empty text."""
    payload = {
        "text": "",
        "grade": 3,
        "subject": "Science",
        "language": "Odia"
    }
    response = client.post("/api/pedagogy/explain", data=json.dumps(payload), content_type="application/json")
    assert response.status_code == 400
    assert "Empty text" in response.json()["detail"]

def test_pedagogy_invalid_grade_error():
    """Test error handling for invalid grade out of bounds."""
    payload = {
        "text": "Valid text",
        "grade": 99,
        "subject": "Science",
        "language": "Odia"
    }
    response = client.post("/api/pedagogy/explain", data=json.dumps(payload), content_type="application/json")
    assert response.status_code == 422
    assert "Invalid grade level" in response.json()["detail"]
