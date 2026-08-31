import sys
import os
import json
import django

# Ensure root workspace is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.bhashasetu_backend.settings")
django.setup()

from django.test import Client
from backend.app.services.speech_service import tts_service, MockTTSProvider

client = Client()

def test_tts_service_english_odia():
    """Unit test for English and Odia TTS synthesis."""
    provider = MockTTSProvider()
    res_odia = provider.synthesize("ସୂର୍ଯ୍ୟଙ୍କ ତାପରେ", "Odia")
    assert res_odia["status"] == "synthesized"
    assert res_odia["audio_supported"] is True
    assert res_odia["audio_url"] is not None

    res_eng = provider.synthesize("The sun heats water", "English")
    assert res_eng["status"] == "synthesized"
    assert res_eng["audio_supported"] is True

def test_tts_service_unsupported_language():
    """Unit test for graceful limitation reporting on unsupported languages."""
    provider = MockTTSProvider()
    res = provider.synthesize("Hello", "Klingon")
    assert res["status"] == "unsupported_language"
    assert res["audio_supported"] is False
    assert "not supported" in res["limitation_message"]

def test_tts_api_endpoint_success():
    """Integration test for POST /api/speech/synthesize endpoint."""
    payload = {
        "text": "ସୂର୍ଯ୍ୟଙ୍କ ତାପରେ ପାଣି ଗରମ ହୋଇ ବାଷ୍ପ ପାଲଟିଯାଏ ।",
        "language": "Odia"
    }
    response = client.post("/api/speech/synthesize", data=json.dumps(payload), content_type="application/json")
    assert response.status_code == 200
    
    data = response.json()
    assert data["language"] == "Odia"
    assert data["status"] == "synthesized"
    assert data["audio_supported"] is True
    assert "audio_url" in data

def test_tts_api_empty_text_error():
    """Test error handling for empty text."""
    payload = {
        "text": "",
        "language": "Odia"
    }
    response = client.post("/api/speech/synthesize", data=json.dumps(payload), content_type="application/json")
    assert response.status_code == 400
    assert "Empty text" in response.json()["detail"]

def test_tts_api_unsupported_language_error():
    """Test error handling for unsupported language."""
    payload = {
        "text": "Hello world",
        "language": "Klingon"
    }
    response = client.post("/api/speech/synthesize", data=json.dumps(payload), content_type="application/json")
    assert response.status_code == 422
    assert "Unsupported language" in response.json()["detail"]

def test_edge_tts_provider_live():
    """Unit test for EdgeTTSProvider live behavior with English and Odia."""
    from backend.app.services.speech_service import EdgeTTSProvider
    provider = EdgeTTSProvider()
    
    # Test English
    res_en = provider.synthesize("Welcome to BhashaSetu AI.", "English")
    assert res_en["audio_supported"] is True
    assert res_en["audio_url"].startswith("data:audio/mp3;base64,")
    assert res_en["provider_mode"] == "edge-tts"
    
    # Test Hindi
    res_hi = provider.synthesize("नमस्ते, आप कैसे हैं?", "Hindi")
    assert res_hi["audio_supported"] is True
    assert res_hi["audio_url"].startswith("data:audio/mp3;base64,")

    # Test Odia Limitation
    res_or = provider.synthesize("ସୂର୍ଯ୍ୟଙ୍କ ତାପରେ", "Odia")
    assert res_or["audio_supported"] is False
    assert "not supported" in res_or["limitation_message"]
