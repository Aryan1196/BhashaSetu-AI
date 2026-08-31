import sys
import os
import json
import django
from django.core.files.uploadedfile import SimpleUploadedFile

# Ensure root workspace is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.bhashasetu_backend.settings")
django.setup()

from django.test import Client
from backend.app.services.speech_service import stt_service, MockSTTProvider, DeepgramSTTProvider

client = Client()

def test_stt_service_mock_unit():
    """Unit test for MockSTTProvider transcript return."""
    provider = MockSTTProvider()
    res = provider.transcribe(b"dummy_bytes")
    
    assert res["transcript"] == "Today we are going to learn about the water cycle."
    assert res["detected_language"] == "English"
    assert res["confidence"] == 0.98
    assert res["provider_mode"] == "mock"
    assert res["is_development_fallback"] is True

def test_deepgram_stt_provider_mock_fallback():
    """Test that DeepgramSTTProvider falls back gracefully when API fails or key is missing."""
    provider = DeepgramSTTProvider("")
    res = provider.transcribe(b"dummy_bytes")
    assert res["is_development_fallback"] is True
    assert "Today we are going to learn" in res["transcript"]

def test_stt_transcribe_api_success():
    """Integration test for POST /api/speech/transcribe endpoint."""
    payload = {
        "text_override": "Custom spoken text simulation."
    }
    response = client.post("/api/speech/transcribe", data=json.dumps(payload), content_type="application/json")
    assert response.status_code == 200
    
    data = response.json()
    assert data["transcript"] == "Custom spoken text simulation."
    assert data["detected_language"] == "English"

def test_stt_upload_api_success():
    """Integration test for POST /api/speech/stt upload endpoint."""
    wav_file = SimpleUploadedFile("test.wav", b"RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00\x44\xac\x00\x00\x88\x58\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00", content_type="audio/wav")
    response = client.post("/api/speech/stt", {"file": wav_file})
    assert response.status_code == 200
    
    data = response.json()
    assert "transcript" in data
    assert "detected_language" in data
    assert "confidence" in data

def test_deepgram_key_api():
    """Integration test for GET & POST /api/speech/deepgram-key."""
    res = client.get("/api/speech/deepgram-key")
    assert res.status_code == 200
    data = res.json()
    assert "key" in data
    assert data["status"] == "active"

    # Test updating key
    post_res = client.post("/api/speech/deepgram-key", data=json.dumps({"key": "test_deepgram_key_12345"}), content_type="application/json")
    assert post_res.status_code == 200
    assert post_res.json()["key"] == "test_deepgram_key_12345"

    # Restore default
    client.post("/api/speech/deepgram-key", data=json.dumps({"key": "23dae82420be843b3b183028b35162dfca167b8c"}), content_type="application/json")
