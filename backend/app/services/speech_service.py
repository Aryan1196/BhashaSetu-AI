from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import os
import asyncio
import base64
import tempfile
import concurrent.futures
import edge_tts
import httpx
from backend.app.config import settings

class BaseTTSProvider(ABC):
    @abstractmethod
    def synthesize(self, text: str, language: str) -> Dict[str, Any]:
        pass


class MockTTSProvider(BaseTTSProvider):
    """
    Development TTS Provider used when external audio credentials are unavailable.
    Provides browser-compatible audio payload metadata and reports language support accurately.
    """
    
    SUPPORTED_LANGUAGES = ["English", "Odia", "Hindi", "Santhali"]

    def synthesize(self, text: str, language: str) -> Dict[str, Any]:
        if language not in self.SUPPORTED_LANGUAGES:
            return {
                "text": text,
                "language": language,
                "status": "unsupported_language",
                "audio_supported": False,
                "limitation_message": f"TTS synthesis for '{language}' is not supported by current provider.",
                "audio_url": None,
                "provider_mode": "mock",
                "is_development_fallback": True
            }

        # For Odia and English, return playable audio metadata & fallback script
        return {
            "text": text,
            "language": language,
            "status": "synthesized",
            "audio_supported": True,
            "limitation_message": None,
            "audio_url": f"data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=",
            "provider_mode": "mock",
            "is_development_fallback": True
        }


class EdgeTTSProvider(BaseTTSProvider):
    """
    Production Text-to-Speech Provider using Microsoft Edge's high-quality neural voices.
    Supports English (RyanNeural - JARVIS voice) and Hindi (MadhurNeural).
    Gracefully handles unsupported languages like Odia and Santhali.
    """
    VOICES = {
        "English": "en-GB-RyanNeural",
        "Hindi": "hi-IN-MadhurNeural"
    }

    def synthesize(self, text: str, language: str) -> Dict[str, Any]:
        voice = self.VOICES.get(language)
        if not voice:
            return {
                "text": text,
                "language": language,
                "status": "unsupported_language",
                "audio_supported": False,
                "limitation_message": f"Odia/Santhali/vernacular language TTS is not supported by current Edge-TTS provider. Please select English or Hindi.",
                "audio_url": None,
                "provider_mode": "edge-tts",
                "is_development_fallback": True
            }

        try:
            async def run_tts():
                communicate = edge_tts.Communicate(text, voice)
                with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as temp_file:
                    temp_path = temp_file.name
                try:
                    await communicate.save(temp_path)
                    with open(temp_path, "rb") as f:
                        data = f.read()
                    encoded = base64.b64encode(data).decode("utf-8")
                    return f"data:audio/mp3;base64,{encoded}"
                finally:
                    if os.path.exists(temp_path):
                        os.remove(temp_path)

            # Event loop helper for uvicorn/fastapi environment
            try:
                loop = asyncio.get_event_loop()
            except RuntimeError:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)

            if loop.is_running():
                with concurrent.futures.ThreadPoolExecutor() as pool:
                    audio_data_url = pool.submit(asyncio.run, run_tts()).result()
            else:
                audio_data_url = asyncio.run(run_tts())

            return {
                "text": text,
                "language": language,
                "status": "synthesized",
                "audio_supported": True,
                "limitation_message": None,
                "audio_url": audio_data_url,
                "provider_mode": "edge-tts",
                "is_development_fallback": False
            }
        except Exception as e:
            return {
                "text": text,
                "language": language,
                "status": "error",
                "audio_supported": False,
                "limitation_message": f"Edge-TTS synthesis failed: {str(e)}",
                "audio_url": None,
                "provider_mode": "edge-tts",
                "is_development_fallback": True
            }


class TTSService:
    """
    TTS Service Facade.
    Isolates text-to-speech audio provider details from API handlers.
    """
    def __init__(self):
        # Default to EdgeTTSProvider as it runs without requiring an API key
        if settings.TTS_PROVIDER != "mock":
            self.provider: BaseTTSProvider = EdgeTTSProvider()
        else:
            self.provider: BaseTTSProvider = MockTTSProvider()

    def synthesize(self, text: str, language: str = "Odia") -> Dict[str, Any]:
        return self.provider.synthesize(text, language)

# Singleton Instance
tts_service = TTSService()


# ==========================================
# Speech-To-Text (STT) Service Integration
# ==========================================

class BaseSTTProvider(ABC):
    @abstractmethod
    def transcribe(self, audio_bytes: bytes, content_type: str = "audio/webm") -> Dict[str, Any]:
        pass


class MockSTTProvider(BaseSTTProvider):
    """
    Development STT Provider returning pre-configured mock transcription results.
    """
    def transcribe(self, audio_bytes: bytes, content_type: str = "audio/webm") -> Dict[str, Any]:
        return {
            "transcript": "Today we are going to learn about the water cycle.",
            "detected_language": "English",
            "confidence": 0.98,
            "provider_mode": "mock",
            "is_development_fallback": True
        }


class DeepgramSTTProvider(BaseSTTProvider):
    """
    Production Speech-to-Text Provider powered by Deepgram API.
    """
    def __init__(self, api_key: str):
        self.api_key = api_key

    def transcribe(self, audio_bytes: bytes, content_type: str = "audio/webm") -> Dict[str, Any]:
        if not self.api_key:
            return MockSTTProvider().transcribe(audio_bytes, content_type)

        try:
            headers = {
                "Authorization": f"Token {self.api_key}",
                "Content-Type": content_type
            }
            params = {
                "model": "nova-2",
                "smart_format": "true",
                "detect_language": "true"
            }
            
            with httpx.Client(timeout=15.0) as client:
                response = client.post(
                    "https://api.deepgram.com/v1/listen",
                    headers=headers,
                    params=params,
                    content=audio_bytes
                )
            
            if response.status_code != 200:
                raise Exception(f"Deepgram API error status {response.status_code}: {response.text}")

            res_json = response.json()
            channels = res_json.get("results", {}).get("channels", [])
            if not channels:
                raise Exception("Deepgram response contains empty channels list.")
            
            alternatives = channels[0].get("alternatives", [])
            if not alternatives:
                raise Exception("Deepgram response contains empty alternatives list.")

            transcript = alternatives[0].get("transcript", "")
            confidence = alternatives[0].get("confidence", 1.0)
            
            # Map detected locale short-code to human-readable format
            detected_locale = res_json.get("metadata", {}).get("detected_language", "en")
            locale_map = {
                "en": "English",
                "or": "Odia",
                "hi": "Hindi",
                "bn": "Bengali",
                "sa": "Santhali"
            }
            simple_lang = locale_map.get(detected_locale.lower().split("-")[0], "English")

            return {
                "transcript": transcript,
                "detected_language": simple_lang,
                "confidence": confidence,
                "provider_mode": "deepgram",
                "is_development_fallback": False
            }
        except Exception as e:
            # Automatic fallback to mock provider on network or API failures
            fallback_res = MockSTTProvider().transcribe(audio_bytes, content_type)
            fallback_res["error"] = str(e)
            return fallback_res


class STTService:
    """
    STT Service Facade.
    Exposes transcribing functionality with fallback mechanisms.
    """
    def get_provider(self) -> BaseSTTProvider:
        api_key = os.getenv("DEEPGRAM_API_KEY", "23dae82420be843b3b183028b35162dfca167b8c").strip()
        if api_key and settings.STT_PROVIDER != "mock":
            return DeepgramSTTProvider(api_key)
        return MockSTTProvider()

    def transcribe(self, audio_bytes: bytes, content_type: str = "audio/webm") -> Dict[str, Any]:
        if not audio_bytes:
            return MockSTTProvider().transcribe(b"", content_type)
        return self.get_provider().transcribe(audio_bytes, content_type)

# Singleton Instance
stt_service = STTService()

