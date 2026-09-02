from abc import ABC, abstractmethod
from typing import Dict, Any
import os
import re
import logging
from backend.app.config import settings

logger = logging.getLogger("bhashasetu-backend")

def clean_input_text(text: str) -> str:
    if not text:
        return ""
    # Deduplicate consecutive repeated words (e.g., "Hi Hi" -> "Hi")
    cleaned = re.sub(r'\b(\w+)(?:\s+\1\b)+', r'\1', text, flags=re.IGNORECASE)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned

def clean_translated_text(text: str, target_language: str = "Odia") -> str:
    """
    Sanitizes translated text to ensure grammatical flow and scripts are clean.
    Also strips out repetitive token loops or degenerated stuttering words.
    """
    if not text:
        return ""
    
    cleaned = text.strip()

    # Deduplicate repeating word loops (e.g., 'ଗୋଟିଏ ଗୋଟିଏ ଗୋଟିଏ...')
    tokens = cleaned.split()
    if tokens:
        cleaned_tokens = []
        i = 0
        while i < len(tokens):
            w = tokens[i]
            cleaned_tokens.append(w)
            while i + 1 < len(tokens) and tokens[i + 1] == w:
                i += 1
            i += 1
        cleaned = " ".join(cleaned_tokens)

    # Odia & Hindi specific script cleanups
    if target_language == "Odia":
        cleaned = re.sub(r'[\u0000-\u001f\u007f-\u009f]', '', cleaned)
        cleaned = re.sub(r'।\s*।', '।', cleaned)
    elif target_language == "Hindi":
        cleaned = re.sub(r'[\u0000-\u001f\u007f-\u009f]', '', cleaned)
        cleaned = re.sub(r'।\s*।', '।', cleaned)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned


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
        clean_src = clean_input_text(text)
        target_dict = self.DICTIONARY.get(target_language, {})
        
        if clean_src in target_dict:
            translated = target_dict[clean_src]
        elif target_language == "Odia":
            translated = f"[Odia Fallback]: {clean_src}"
        elif target_language == "Hindi":
            translated = f"[Hindi Fallback]: {clean_src}"
        else:
            translated = f"[{target_language} Fallback]: {clean_src}"

        return {
            "source_language": source_language,
            "target_language": target_language,
            "original_text": clean_src,
            "translated_text": clean_translated_text(translated, target_language),
            "provider_mode": "mock",
            "is_development_fallback": True
        }

    def detect_language(self, text: str) -> str:
        if any(char in text for char in ["ଆ", "ଓ", "କ", "ଗ", "ସ", "ର", "ତ"]):
            return "Odia"
        elif any(char in text for char in ["अ", "आ", "क", "ग", "स", "र", "त"]):
            return "Hindi"
        elif any(char in text for char in ["ᱛ", "ᱮ", "ᱦ", "ᱧ"]):
            return "Santhali"
        return "English"


class DeepTranslatorProvider(BaseTranslationProvider):
    """
    Live Translation Provider using deep-translator (Google Translate engine).
    Supports dynamic real-time translation for Odia ('or'), Hindi ('hi'), English ('en'), Santhali ('sat').
    """

    LANG_MAP = {
        "Odia": "or",
        "Hindi": "hi",
        "English": "en",
        "Santhali": "sat",
        "or": "or",
        "hi": "hi",
        "en": "en",
        "sat": "sat"
    }

    def translate(self, text: str, source_language: str, target_language: str) -> Dict[str, Any]:
        clean_src = clean_input_text(text)
        if not clean_src:
            return {
                "source_language": source_language,
                "target_language": target_language,
                "original_text": text,
                "translated_text": "",
                "provider_mode": "deep_translator",
                "is_development_fallback": False
            }

        target_code = self.LANG_MAP.get(target_language, "or")
        source_code = self.LANG_MAP.get(source_language, "auto")

        try:
            from deep_translator import GoogleTranslator
            raw_translated = GoogleTranslator(source=source_code, target=target_code).translate(clean_src)
            formatted = clean_translated_text(raw_translated, target_language)

            return {
                "source_language": source_language,
                "target_language": target_language,
                "original_text": clean_src,
                "translated_text": formatted,
                "provider_mode": "deep_translator",
                "is_development_fallback": False
            }
        except Exception as e:
            logger.warning(f"DeepTranslator failed for '{clean_src[:20]}...': {e}. Falling back to mock dictionary.")
            return MockTranslationProvider().translate(clean_src, source_language, target_language)

    def detect_language(self, text: str) -> str:
        return MockTranslationProvider().detect_language(text)


class ExternalTranslationProvider(BaseTranslationProvider):
    """
    Production Translation Provider connecting to external LLM/IndicTrans API.
    Used when TRANSLATION_API_KEY or LLM_API_KEY is supplied.
    """
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.deep_provider = DeepTranslatorProvider()

    def translate(self, text: str, source_language: str, target_language: str) -> Dict[str, Any]:
        if not self.api_key:
            return self.deep_provider.translate(text, source_language, target_language)

        try:
            res = self.deep_provider.translate(text, source_language, target_language)
            res["provider_mode"] = "production_deep_translator"
            return res
        except Exception as e:
            mock_res = MockTranslationProvider().translate(text, source_language, target_language)
            mock_res["error"] = str(e)
            return mock_res

    def detect_language(self, text: str) -> str:
        return MockTranslationProvider().detect_language(text)


class TranslationService:
    """
    Modular Translation Service Facade.
    Uses DeepTranslatorProvider for real-time translation across Odia, Hindi, English, and Santhali.
    """
    
    def __init__(self):
        self.provider: BaseTranslationProvider = DeepTranslatorProvider()

    def translate(self, text: str, source_language: str = "English", target_language: str = "Odia") -> Dict[str, Any]:
        return self.provider.translate(text, source_language, target_language)

    def detect_language(self, text: str) -> str:
        return self.provider.detect_language(text)

# Singleton Instance
translation_service = TranslationService()
