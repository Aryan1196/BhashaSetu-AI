import sys
import os
from fastapi.testclient import TestClient

# Ensure root workspace is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.app.main import app
from backend.app.services.translation_service import translation_service, MockTranslationProvider

client = TestClient(app)

def test_translation_service_mock_unit():
    """Unit test for MockTranslationProvider direct translation logic."""
    provider = MockTranslationProvider()
    res = provider.translate("The sun heats water and causes evaporation.", "English", "Odia")
    
    assert res["source_language"] == "English"
    assert res["target_language"] == "Odia"
    assert res["original_text"] == "The sun heats water and causes evaporation."
    assert res["translated_text"] == "ସୂର୍ଯ୍ୟଙ୍କ ତାପରେ ପାଣି ଗରମ ହୋଇ ବାଷ୍ପୀଭବନ ହୁଏ ।"
    assert res["provider_mode"] == "mock"
    assert res["is_development_fallback"] is True

def test_language_detection():
    """Unit test for language detection logic."""
    assert translation_service.detect_language("ଆଜି ଆମେ ପାଣି ଚକ୍ର ବିଷୟରେ ଶିଖିବାକୁ ଯାଉଛୁ ।") == "Odia"
    assert translation_service.detect_language("आज हम जल चक्र के बारे में पढ़ने जा रहे हैं।") == "Hindi"
    assert translation_service.detect_language("Today we learn about water cycle") == "English"

def test_translation_api_endpoint():
    """Integration test for POST /api/translation/translate endpoint."""
    payload = {
        "text": "The sun heats water and causes evaporation.",
        "source_language": "English",
        "target_language": "Odia"
    }
    response = client.post("/api/translation/translate", json=payload)
    assert response.status_code == 200
    
    data = response.json()
    assert data["source_language"] == "English"
    assert data["target_language"] == "Odia"
    assert data["original_text"] == "The sun heats water and causes evaporation."
    assert "ସୂର୍ଯ୍ୟଙ୍କ ତାପରେ" in data["translated_text"]
    assert data["provider_mode"] in ["mock", "production"]
    assert "is_development_fallback" in data

def test_empty_text_error():
    """Test error handling for empty text translation."""
    payload = {
        "text": "",
        "source_language": "English",
        "target_language": "Odia"
    }
    response = client.post("/api/translation/translate", json=payload)
    assert response.status_code == 400
    assert "Empty text" in response.json()["detail"]

def test_unsupported_language_error():
    """Test error handling for unsupported language target."""
    payload = {
        "text": "Hello world",
        "source_language": "English",
        "target_language": "Klingon"
    }
    response = client.post("/api/translation/translate", json=payload)
    assert response.status_code == 422
    assert "Unsupported target language" in response.json()["detail"]
