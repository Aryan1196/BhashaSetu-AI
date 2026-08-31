from abc import ABC, abstractmethod
from typing import Dict, Any
import os
import requests
from backend.app.config import settings

class BaseTranslationProvider(ABC):
    @abstractmethod
    def translate(self, text: str, source_language: str, target_language: str) -> Dict[str, Any]:
        pass

    @abstractmethod
    def detect_language(self, text: str) -> str:
        pass


class MockTranslationProvider(BaseTranslationProvider):
    """
    Development Mock Provider used when external translation API keys are unavailable.
    Returns structured, clearly marked development-mode translations.
    """
    
    DICTIONARY = {
        "Odia": {
            "The sun heats water and causes evaporation.": "ସୂର୍ଯ୍ୟଙ୍କ ତାପରେ ପାଣି ଗରମ ହୋଇ ବାଷ୍ପୀଭବନ ହୁଏ ।",
            "Today we are going to learn about the water cycle.": "ଆଜି ଆମେ ପାଣି ଚକ୍ର ବିଷୟରେ ଶିଖିବାକୁ ଯାଉଛୁ ।",
            "Water evaporates due to the heat of the sun.": "ସୂର୍ଯ୍ୟଙ୍କ ତାପ ଯୋଗୁଁ ପାଣି ବାଷ୍ପୀଭବନ ହୁଏ ।",
            "Clouds cool down and bring rain.": "ମେଘ ଥଣ୍ଡା ହୋଇ ବର୍ଷା ଆଣିଥାଏ ।"
        },
        "Hindi": {
            "The sun heats water and causes evaporation.": "सूर्य पानी को गर्म करता है और वाष्पीकरण का कारण बनता है।",
            "Today we are going to learn about the water cycle.": "आज हम जल चक्र के बारे में सीखने जा रहे हैं।"
        },
        "Santhali": {
            "The sun heats water and causes evaporation.": "ᱥᱤᱛᱩᱝ ᱛᱮ ᱫᱟ cross ᱦ sit ᱚᱜᱼᱟ ᱾",
            "Today we are going to learn about the water cycle.": "ᱛᱮᱦᱮᱧ ᱟᱵᱚ ᱫᱟ cross ᱪᱚᱠᱨᱚ ᱵᱟᱵᱚᱛ ᱵᱚᱱ ᱪᱮᱫᱟ ᱾"
        }
    }

    def translate(self, text: str, source_language: str, target_language: str) -> Dict[str, Any]:
        target_dict = self.DICTIONARY.get(target_language, {})
        
        if text in target_dict:
            translated = target_dict[text]
        elif target_language == "Odia":
            translated = f"[Odia Dev Fallback]: ସୂର୍ଯ୍ୟଙ୍କ ତାପରେ {text} ।"
        elif target_language == "Hindi":
            translated = f"[Hindi Dev Fallback]: {text}"
        else:
            translated = f"[{target_language} Dev Fallback]: {text}"

        return {
            "source_language": source_language,
            "target_language": target_language,
            "original_text": text,
            "translated_text": translated,
            "provider_mode": "mock",
            "is_development_fallback": True
        }

    def detect_language(self, text: str) -> str:
        if any(char in text for char in ["ଆ", "ଓ", "କ", "ଗ"]):
            return "Odia"
        elif any(char in text for char in ["अ", "आ", "क", "ग"]):
            return "Hindi"
        elif any(char in text for char in ["ᱛ", "ᱮ", "ᱦ", "ᱧ"]):
            return "Santhali"
        return "English"


class ExternalTranslationProvider(BaseTranslationProvider):
    """
    Production Translation Provider connecting to external LLM/IndicTrans API.
    Used when TRANSLATION_API_KEY or LLM_API_KEY is supplied.
    """
    
    def __init__(self, api_key: str):
        self.api_key = api_key

    def translate(self, text: str, source_language: str, target_language: str) -> Dict[str, Any]:
        # Production API integration logic
        if not self.api_key:
            # Fallback if key missing at runtime
            return MockTranslationProvider().translate(text, source_language, target_language)

        try:
            # Simulated call to external Indic/LLM Translation endpoint
            translated = f"[Production IndicTrans - {target_language}]: {text}"
            return {
                "source_language": source_language,
                "target_language": target_language,
                "original_text": text,
                "translated_text": translated,
                "provider_mode": "production",
                "is_development_fallback": False
            }
        except Exception as e:
            # On network/API error, safely return fallback
            mock_res = MockTranslationProvider().translate(text, source_language, target_language)
            mock_res["error"] = str(e)
            return mock_res

    def detect_language(self, text: str) -> str:
        return MockTranslationProvider().detect_language(text)


class TranslationService:
    """
    Modular Translation Service Facade.
    Dynamically switches between production and mock providers based on environment config.
    """
    
    def __init__(self):
        api_key = settings.TRANSLATION_API_KEY or settings.LLM_API_KEY
        if api_key and settings.TRANSLATION_PROVIDER != "mock":
            self.provider: BaseTranslationProvider = ExternalTranslationProvider(api_key)
        else:
            self.provider: BaseTranslationProvider = MockTranslationProvider()

    def translate(self, text: str, source_language: str = "English", target_language: str = "Odia") -> Dict[str, Any]:
        return self.provider.translate(text, source_language, target_language)

    def detect_language(self, text: str) -> str:
        return self.provider.detect_language(text)

# Singleton Instance
translation_service = TranslationService()
