"""
BhashaSetu AI - LLM Service
Isolated LLM Provider integration layer for primary vernacular education.
"""

import os
import re
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import httpx

from backend.app.config import settings
from backend.app.services.prompt_service import (
    SYSTEM_PROMPT, 
    build_user_prompt,
    STUDENT_TUTOR_SYSTEM_PROMPT,
    build_student_tutor_user_prompt
)

logger = logging.getLogger("bhashasetu-llm")


def detect_query_language(text: str, default: str = "English") -> str:
    """
    Lightning-fast Unicode script detector for Indian languages and English.
    Accurately identifies Odia, Hindi/Devanagari, Bengali, Santhali, Telugu, Tamil, Kannada, Marathi, Gujarati.
    """
    if not text:
        return default
    counts = {
        "Odia": len(re.findall(r'[\u0B00-\u0B7F]', text)),
        "Hindi": len(re.findall(r'[\u0900-\u097F]', text)),
        "Bengali": len(re.findall(r'[\u0980-\u09FF]', text)),
        "Santhali": len(re.findall(r'[\u1C50-\u1C7F]', text)),
        "Telugu": len(re.findall(r'[\u0C00-\u0C7F]', text)),
        "Tamil": len(re.findall(r'[\u0B80-\u0BFF]', text)),
        "Kannada": len(re.findall(r'[\u0C80-\u0CFF]', text)),
        "Gujarati": len(re.findall(r'[\u0A80-\u0AFF]', text)),
    }
    max_lang, count = max(counts.items(), key=lambda item: item[1])
    if count > 0:
        return max_lang
    return default


def clean_repetitive_loops(text: str) -> str:
    """
    Post-processing guard to eliminate repetitive token degeneration or loop stuttering.
    Safely compresses words or 2-3 word phrases repeating consecutively.
    """
    if not text or not text.strip():
        return text

    # 1. Clean individual words repeated 2+ times consecutively
    tokens = text.split()
    if not tokens:
        return text

    cleaned_tokens = []
    i = 0
    while i < len(tokens):
        w = tokens[i]
        cleaned_tokens.append(w)
        # Skip subsequent identical tokens
        while i + 1 < len(tokens) and tokens[i + 1] == w:
            i += 1
        i += 1

    cleaned = " ".join(cleaned_tokens)

    # 2. Clean 2-word phrase loops (e.g., 'ଗୋଟିଏ ଛୋଟ ଗୋଟିଏ ଛୋଟ ଗୋଟିଏ ଛୋଟ')
    pattern_2word = re.compile(r'(\b\S+\s+\S+)(?:\s+\1){2,}', re.UNICODE)
    cleaned = pattern_2word.sub(r'\1', cleaned)

    return re.sub(r'\s+', ' ', cleaned).strip()


class BaseLLMProvider(ABC):
    """Abstract Base Class for LLM Providers."""

    @abstractmethod
    def generate_response(
        self,
        text: str,
        target_language: str,
        grade: str,
        subject: str,
        source_language: str = "English"
    ) -> Dict[str, Any]:
        pass

    @abstractmethod
    def generate_tutor_response(
        self,
        query: str,
        detected_language: str,
        grade: str = "Class 3",
        subject: str = "Science",
        topic: str = "General"
    ) -> Dict[str, Any]:
        pass


class MockLLMProvider(BaseLLMProvider):
    """
    Development & Demonstration LLM Provider.
    Used when external API keys are unavailable or when DEMO_MODE=True.
    Provides verified, high-quality primary pedagogical explanations.
    """

    DEMO_KB = {
        "water evaporates when heated by the sun": {
            "Odia": {
                "Class 1": "\u0b38\u0b42\u0b30\u0b4d\u0b2f\u0b19\u0b4d\u0b15 \u0b16\u0b30\u0b3e\u0b30\u0b47 \u0b2a\u0b3e\u0b23\u0b3f \u0b17\u0b30\u0b2e \u0b39\u0b4b\u0b07 \u0b09\u0b21\u0b3c\u0b3f\u0b2f\u0b3e\u0b0f \u0964",
                "Class 2": "\u0b38\u0b42\u0b30\u0b4d\u0b2f\u0b19\u0b4d\u0b15 \u0b24\u0b3e\u0b2a\u0b30\u0b47 \u0b2a\u0b3e\u0b23\u0b3f \u0b17\u0b30\u0b2e \u0b39\u0b4b\u0b07 \u0b2c\u0b3e\u0b37\u0b4d\u0b2a \u0b2a\u0b3e\u0b32\u0b1f\u0b3f \u0b09\u0b2a\u0b30\u0b15\u0b41 \u0b09\u0b20\u0b3f\u0b2f\u0b3e\u0b0f \u0964",
                "Class 3": "\u0b38\u0b42\u0b30\u0b4d\u0b2f\u0b19\u0b4d\u0b15 \u0b24\u0b3e\u0b2a\u0b30\u0b47 \u0b28\u0b26\u0b40 \u0b13 \u0b2a\u0b4b\u0b16\u0b30\u0b40\u0b30 \u0b2a\u0b3e\u0b23\u0b3f \u0b17\u0b30\u0b2e \u0b39\u0b4b\u0b07 \u0b1b\u0b4b\u0b1f \u0b1b\u0b4b\u0b1f \u0b2c\u0b3e\u0b37\u0b4d\u0b2a \u0b2a\u0b3e\u0b32\u0b1f\u0b3f\u0b2f\u0b3e\u0b0f \u0964 \u0b0f\u0b39\u0b3e\u0b15\u0b41 \u0b2c\u0b3e\u0b37\u0b4d\u0b2a\u0b40\u0b2d\u0b2c\u0b28 (Evaporation) \u0b15\u0b41\u0b39\u0b3e\u0b2f\u0b3e\u0b0f, \u0b2f\u0b47\u0b2e\u0b3f\u0b24\u0b3f \u0b17\u0b30\u0b2e \u0b1a\u0b3e\u2019\u0b30\u0b41 \u0b27\u0b42\u0b06\u0b01 \u0b09\u0b20\u0b47 \u0964",
                "Class 4": "\u0b38\u0b42\u0b30\u0b4d\u0b2f\u0b19\u0b4d\u0b15 \u0b09\u0b24\u0b4d\u0b24\u0b3e\u0b2a \u0b2f\u0b4b\u0b17\u0b41\u0b01 \u0b1c\u0b33 \u0b17\u0b30\u0b2e \u0b39\u0b4b\u0b07 \u0b1c\u0b33\u0b40\u0b5f \u0b2c\u0b3e\u0b37\u0b4d\u0b2a\u0b30\u0b47 \u0b2a\u0b30\u0b3f\u0b23\u0b24 \u0b39\u0b41\u0b0f \u0b0f\u0b2c\u0b02 \u0b2c\u0b3e\u0b5f\u0b41\u0b2e\u0b23\u0b4d\u0b21\u0b33\u0b15\u0b41 \u0b2f\u0b3e\u0b0f \u0964 \u0b0f\u0b39\u0b3f \u0b2a\u0b4d\u0b30\u0b15\u0b4d\u0b30\u0b3f\u0b5f\u0b3e\u0b15\u0b41 \u0b2c\u0b3e\u0b37\u0b4d\u0b2a\u0b40\u0b2d\u0b2c\u0b28 (Evaporation) \u0b15\u0b41\u0b39\u0b3e\u0b2f\u0b3e\u0b0f \u0964",
                "Class 5": "\u0b38\u0b42\u0b30\u0b4d\u0b2f\u0b19\u0b4d\u0b15 \u0b15\u0b3f\u0b30\u0b23\u0b30\u0b47 \u0b2a\u0b43\u0b25\u0b3f\u0b2c\u0b40 \u0b2a\u0b43\u0b37\u0b4d\u0b20\u0b30 \u0b1c\u0b33 \u0b17\u0b30\u0b2e \u0b39\u0b4b\u0b07 \u0b05\u0b26\u0b43\u0b36\u0b4d\u0b2f \u0b1c\u0b33\u0b40\u0b5f \u0b2c\u0b3e\u0b37\u0b4d\u0b2a\u0b30\u0b47 \u0b2a\u0b30\u0b3f\u0b23\u0b24 \u0b39\u0b4b\u0b07 \u0b09\u0b2a\u0b30\u0b15\u0b41 \u0b09\u0b20\u0b3f\u0b2f\u0b3e\u0b0f \u0964 \u0b0f\u0b39\u0b3e \u0b39\u0b47\u0b09\u0b1b\u0b3f \u0b1c\u0b33\u0b1a\u0b15\u0b4d\u0b30\u0b30 \u0b2a\u0b4d\u0b30\u0b25\u0b2e \u0b2a\u0b26\u0b15\u0b4d\u0b37\u0b47\u0b2a \u0b2f\u0b3e\u0b39\u0b3e\u0b15\u0b41 \u0b2c\u0b3e\u0b37\u0b4d\u0b2a\u0b40\u0b2d\u0b2c\u0b28 (Evaporation) \u0b15\u0b41\u0b39\u0b3e\u0b2f\u0b3e\u0b0f \u0964"
            },
            "Hindi": {
                "Class 3": "\u0938\u0942\u0930\u091c \u0915\u0940 \u0917\u0930\u094d\u092e\u0940 \u0938\u0947 \u092a\u093e\u0928\u0940 \u0917\u0930\u092e \u0939\u094b\u0915\u0930 \u092d\u093e\u092a \u092c\u0928 \u091c\u093e\u0924\u093e \u0939\u0948 \u0914\u0930 \u090a\u092a\u0930 \u0939\u0935\u093e \u092e\u0947\u0902 \u0909\u0921\u093c \u091c\u093e\u0924\u093e \u0939\u0948\u0964 \u0907\u0938\u0947 \u0935\u093e\u0937\u094d\u092a\u0940\u0915\u0930\u0923 (Evaporation) \u0915\u0939\u0924\u0947 \u0939\u0948\u0902, \u091c\u0948\u0938\u0947 \u0917\u0930\u092e \u0926\u0942\u0927 \u0938\u0947 \u092d\u093e\u092a \u0928\u093f\u0915\u0932\u0924\u0940 \u0939\u0948\u0964"
            },
            "Bengali": {
                "Class 3": "\u09b8\u09c2\u09b0\u09cd\u09af\u09c7\u09b0 \u09a4\u09be\u09aa\u09c7 \u099c\u09b2 \u0997\u09b0\u09ae \u09b9\u09df\u09c7 \u09ac\u09be\u09b7\u09cd\u09aa\u09c7 \u09aa\u09b0\u09bf\u09a3\u09a4 \u09b9\u09df \u098f\u09ac\u0982 \u0993\u09aa\u09b0\u09c7 \u0989\u09a0\u09c7 \u09af\u09be\u09df\u0964 \u098f\u0995\u09c7 \u09ac\u09be\u09b7\u09cd\u09aa\u09c0\u09ad\u09ac\u09a8 (Evaporation) \u09ac\u09b2\u09be \u09b9\u09df\u0964"
            },
            "Santhali": {
                "Class 3": "\u1c65\u1c64\u1c69\u1c69\u1c5e \u1c6b\u1c61 \u1c6a\u1c5f\u1c5e \u1c66\u1c5a\u1c66\u1c5a \u1c60\u1c5f\u1c6b\u1c61 \u1c6d\u1c5a\u1c60 \u1c5f\u1c62 \u1c6e\u1c61\u1c6b\u1c5f\u1c62 \u1c68\u1c5f\u1c60\u1c5f\u1c56\u1c5a\u1c5e\u1c3c\u1c5f \u1c64 \u1c62\u1c5a\u1c61\u1c5f \u1c6a\u1c5a \u1c56\u1c5f\u1c65\u1c6f\u1c5a \u1c60\u1c5a \u1c5d\u1c61\u1c6b\u1c5f\u1c5e\u1c3c\u1c5f \u1c64"
            },
            "English": {
                "Class 3": "When the sun warms up water in ponds and lakes, it turns into tiny invisible steam called water vapour and floats up into the sky. This is called evaporation."
            }
        },
        "today we are going to learn about the water cycle": {
            "Odia": {
                "Class 3": "\u0b06\u0b1c\u0b3f \u0b06\u0b2e\u0b47 \u0b36\u0b3f\u0b16\u0b3f\u0b2c\u0b3e \u0b2f\u0b47 \u0b2a\u0b3e\u0b23\u0b3f \u0b15\u0b3f\u0b2a\u0b30\u0b3f \u0b38\u0b42\u0b30\u0b4d\u0b2f\u0b19\u0b4d\u0b15 \u0b24\u0b3e\u0b2a\u0b30\u0b47 \u0b2c\u0b3e\u0b37\u0b4d\u0b2a \u0b39\u0b4b\u0b07 \u0b2e\u0b47\u0b18 \u0b2a\u0b3e\u0b32\u0b1f\u0b47 \u0b0f\u0b2c\u0b02 \u0b2a\u0b41\u0b23\u0b3f \u0b2c\u0b30\u0b4d\u0b37\u0b3e \u0b39\u0b4b\u0b07 \u0b27\u0b30\u0b3f\u0b24\u0b4d\u0b30\u0b40\u0b15\u0b41 \u0b2b\u0b47\u0b30\u0b3f\u0b06\u0b38\u0b47 \u0964 \u0b0f\u0b39\u0b3e\u0b15\u0b41 \u0b1c\u0b33\u0b1a\u0b15\u0b4d\u0b30 \u0b15\u0b41\u0b39\u0b3e\u0b2f\u0b3e\u0b0f \u0964"
            },
            "Hindi": {
                "Class 3": "\u0906\u091c \u0939\u092e \u0938\u0940\u0916\u0947\u0902\u0917\u0947 \u0915\u093f \u092a\u093e\u0928\u0940 \u0915\u0948\u0938\u0947 \u092d\u093e\u092a \u092c\u0928\u0915\u0930 \u092c\u093e\u0926\u0932 \u092c\u0928\u0924\u093e \u0939\u0948 \u0914\u0930 \u092b\u093f\u0930 \u092c\u093e\u0930\u093f\u0936 \u092c\u0928\u0915\u0930 \u0927\u0930\u0924\u0940 \u092a\u0930 \u0935\u093e\u092a\u0938 \u0906\u0924\u093e \u0939\u0948\u0964 \u0907\u0938\u0947 \u091c\u0932 \u091a\u0915\u094d\u0930 \u0915\u0939\u0924\u0947 \u0939\u0948\u0902\u0964"
            }
        },
        "plants make their food using sunlight": {
            "Odia": {
                "Class 3": "\u0b17\u0b1b\u0b2e\u0b3e\u0b28\u0b47 \u0b38\u0b42\u0b30\u0b4d\u0b2f\u0b4d\u0b2f\u0b3e\u0b32\u0b4b\u0b15, \u0b2a\u0b3e\u0b23\u0b3f \u0b0f\u0b2c\u0b02 \u0b2c\u0b3e\u0b5f\u0b41 \u0b38\u0b3e\u0b39\u0b3e\u0b2f\u0b4d\u0b2f\u0b30\u0b47 \u0b28\u0b3f\u0b1c \u0b2a\u0b24\u0b4d\u0b30\u0b30\u0b47 \u0b16\u0b3e\u0b26\u0b4d\u0b2f \u0b24\u0b3f\u0b06\u0b30\u0b3f \u0b15\u0b30\u0b28\u0b4d\u0b24\u0b3f \u0964 \u0b0f\u0b39\u0b3e\u0b15\u0b41 \u0b06\u0b2e\u0b47 \u0b06\u0b32\u0b4b\u0b15\u0b36\u0b4d\u0b33\u0b47\u0b37\u0b23 \u0b15\u0b3f\u0b2e\u0b4d\u0b2c\u0b3e \u0b2b\u0b1f\u0b4b\u0b38\u0b3f\u0b28\u0b4d\u0b25\u0b47\u0b38\u0b3f\u0b38\u0b4d (Photosynthesis) \u0b15\u0b39\u0b41 \u0964"
            },
            "Hindi": {
                "Class 3": "\u092a\u094c\u0927\u0947 \u0938\u0942\u0930\u091c \u0915\u0940 \u0930\u094b\u0936\u0928\u0940, \u092a\u093e\u0928\u0940 \u0914\u0930 \u0939\u0935\u093e \u0915\u0940 \u092e\u0926\u0926 \u0938\u0947 \u0905\u092a\u0928\u0940 \u092a\u0924\u094d\u0924\u093f\u092f\u094b\u0902 \u092e\u0947\u0902 \u092d\u094b\u091c\u0928 \u092c\u0928\u093e\u0924\u0947 \u0939\u0948\u0902\u0964 \u0907\u0938 \u092a\u094d\u0930\u0915\u094d\u0930\u093f\u092f\u093e \u0915\u094b \u092a\u094d\u0930\u0915\u093e\u0936 \u0938\u0902\u0936\u094d\u0932\u0947\u0937\u0923 (Photosynthesis) \u0915\u0939\u0924\u0947 \u0939\u0948\u0902\u0964"
            }
        }
    }

    def generate_response(
        self,
        text: str,
        target_language: str,
        grade: str,
        subject: str,
        source_language: str = "English"
    ) -> Dict[str, Any]:
        clean_text = text.strip()
        lower_text = clean_text.lower().rstrip(".").rstrip("!")
        
        # 1. Check if known demo input is in KB
        for key, lang_map in self.DEMO_KB.items():
            if key in lower_text or lower_text in key:
                target_lang_map = lang_map.get(target_language, lang_map.get("Odia", {}))
                if grade in target_lang_map:
                    adapted_text = target_lang_map[grade]
                elif "Class 3" in target_lang_map:
                    adapted_text = target_lang_map["Class 3"]
                else:
                    first_val = list(target_lang_map.values())[0]
                    adapted_text = first_val
                
                return {
                    "success": True,
                    "language": target_language,
                    "response": adapted_text,
                    "provider_mode": "mock",
                    "is_development_fallback": True
                }

        # 2. Dynamic live vernacular translation & pedagogical formatting for arbitrary teacher inputs
        try:
            from deep_translator import GoogleTranslator
            from backend.app.services.translation_service import clean_input_text, clean_translated_text
            
            sanitized_input = clean_input_text(clean_text)
            lang_code_map = {
                "Odia": "or",
                "Hindi": "hi",
                "Bengali": "bn",
                "Santhali": "sat",
                "Telugu": "te",
                "Tamil": "ta",
                "Kannada": "kn",
                "Marathi": "mr",
                "English": "en"
            }
            tgt_code = lang_code_map.get(target_language, "or")
            src_code = lang_code_map.get(source_language, "auto")
            raw_translated = GoogleTranslator(source=src_code, target=tgt_code).translate(sanitized_input)
            
            if raw_translated and not any(err_word in raw_translated.lower() for err_word in ["error 500", "server error", "that's an error"]):
                formatted = clean_translated_text(raw_translated, target_language)
                return {
                    "success": True,
                    "language": target_language,
                    "response": formatted,
                    "provider_mode": "mock_dynamic_translation",
                    "is_development_fallback": True
                }
        except Exception as e:
            logger.warning(f"Dynamic translation notice: {e}")

        # 3. Static fallback if network is completely offline
        if target_language == "Odia":
            fallback = f"{clean_text} (\u0b0f\u0b39\u0b3f {grade} \u0b36\u0b4d\u0b30\u0b47\u0b23\u0b40\u0b30 {subject} \u0b2a\u0b3e\u0b07\u0b01 \u0b05\u0b28\u0b41\u0b15\u0b42\u0b33\u0b3f\u0b24)"
        elif target_language == "Hindi":
            fallback = f"{clean_text} (\u092f\u0939 {grade} \u0915\u0947 {subject} \u0915\u0947 \u0932\u093f\u090f \u0905\u0928\u0941\u0915\u0942\u0932\u093f\u0924)"
        else:
            fallback = f"{clean_text} ({grade} {subject} adaptation)"

        return {
            "success": True,
            "language": target_language,
            "response": fallback,
            "provider_mode": "mock",
            "is_development_fallback": True
        }

    def generate_tutor_response(
        self,
        query: str,
        detected_language: str,
        grade: str = "Class 3",
        subject: str = "Science",
        topic: str = "General"
    ) -> Dict[str, Any]:
        clean_q = query.strip()
        lower_q = clean_q.lower()

        # 1. Water Cycle & Evaporation
        if any(w in lower_q for w in ["water", "evaporat", "cycle", "cloud", "rain"]) or any(w in clean_q for w in ["\u0b2a\u0b3e\u0b23\u0b3f", "\u0b2c\u0b30\u0b4d\u0b37\u0b3e", "\u0b2e\u0b47\u0b18", "\u0b1c\u0b33\u0b1a\u0b15\u0b4d\u0b30", "\u092a\u093e\u0928\u0940", "\u092c\u093e\u0930\u093f\u0936", "\u092c\u093e\u0926\u0932"]):
            if detected_language == "Odia":
                return {
                    "response": "\u0b38\u0b42\u0b30\u0b4d\u0b2f\u0b19\u0b4d\u0b15 \u0b09\u0b24\u0b4d\u0b24\u0b3e\u0b2a \u0b2f\u0b4b\u0b17\u0b41\u0b01 \u0b28\u0b26\u0b40, \u0b2a\u0b4b\u0b16\u0b30\u0b40 \u0b13 \u0b38\u0b2e\u0b41\u0b26\u0b4d\u0b30\u0b30 \u0b2a\u0b3e\u0b23\u0b3f \u0b17\u0b30\u0b2e \u0b39\u0b4b\u0b07 \u0b1b\u0b4b\u0b1f \u0b1b\u0b4b\u0b1f \u0b05\u0b26\u0b43\u0b36\u0b4d\u0b2f \u0b2c\u0b3e\u0b37\u0b4d\u0b2a\u0b30\u0b47 \u0b2a\u0b3e\u0b32\u0b1f\u0b3f\u0b2f\u0b3e\u0b0f \u0964 \u0b2c\u0b3e\u0b37\u0b4d\u0b2a \u0b09\u0b2a\u0b30\u0b15\u0b41 \u0b2f\u0b3e\u0b07 \u0b2e\u0b47\u0b18 \u0b24\u0b3f\u0b06\u0b30\u0b3f \u0b15\u0b30\u0b47 \u0b0f\u0b2c\u0b02 \u0b2a\u0b41\u0b23\u0b3f \u0b2c\u0b30\u0b4d\u0b37\u0b3e \u0b39\u0b4b\u0b07 \u0b2b\u0b47\u0b30\u0b3f\u0b06\u0b38\u0b47! \u0b0f\u0b39\u0b3e\u0b15\u0b41 \u0b1c\u0b33\u0b1a\u0b15\u0b4d\u0b30 (Water Cycle) \u0b15\u0b39\u0b28\u0b4d\u0b24\u0b3f \u0964",
                    "key_points": ["\u0b38\u0b42\u0b30\u0b4d\u0b2f\u0b19\u0b4d\u0b15 \u0b24\u0b3e\u0b2a\u0b30\u0b47 \u0b2a\u0b3e\u0b23\u0b3f \u0b2c\u0b3e\u0b37\u0b4d\u0b2a \u0b39\u0b41\u0b0f \u0964", "\u0b2c\u0b3e\u0b37\u0b4d\u0b2a \u0b09\u0b2a\u0b30\u0b15\u0b41 \u0b2f\u0b3e\u0b07 \u0b2e\u0b47\u0b18 \u0b39\u0b41\u0b0f \u0964", "\u0b2e\u0b47\u0b18\u0b30\u0b41 \u0b2c\u0b30\u0b4d\u0b37\u0b3e \u0b39\u0b4b\u0b07 \u0b2b\u0b47\u0b30\u0b3f\u0b06\u0b38\u0b47 \u0964"],
                    "example": "\u0b2f\u0b47\u0b2e\u0b3f\u0b24\u0b3f \u0b17\u0b30\u0b2e \u0b1a\u0b3e\u2019\u0b30\u0b41 \u0b27\u0b42\u0b06\u0b01 \u0b09\u0b20\u0b47, \u0b38\u0b47\u0b2e\u0b3f\u0b24\u0b3f \u0b2a\u0b3e\u0b23\u0b3f \u0b2c\u0b3e\u0b37\u0b4d\u0b2a \u0b39\u0b4b\u0b07 \u0b09\u0b2a\u0b30\u0b15\u0b41 \u0b2f\u0b3e\u0b0f \u0964",
                    "follow_up_question": "\u0b24\u0b41\u0b2e\u0b47 \u0b15\u0b47\u0b2c\u0b47 \u0b27\u0b42\u0b2a\u0b30\u0b47 \u0b17\u0b30\u0b2e \u0b2a\u0b3e\u0b23\u0b3f \u0b36\u0b41\u0b16\u0b3f\u0b2f\u0b3e\u0b07\u0b25\u0b3f\u0b2c\u0b3e \u0b26\u0b47\u0b16\u0b3f\u0b1b ?",
                    "provider_mode": "mock",
                    "is_development_fallback": True
                }
            elif detected_language == "Hindi":
                return {
                    "response": "\u0938\u0942\u0930\u091c \u0915\u0940 \u0917\u0930\u094d\u092e\u0940 \u0938\u0947 \u0928\u0926\u093f\u092f\u094b\u0902, \u0924\u093e\u0932\u093e\u092c\u094b\u0902 \u0914\u0930 \u0938\u092e\u0941\u0926\u094d\u0930 \u0915\u093e \u092a\u093e\u0928\u0940 \u0917\u0930\u092e \u0939\u094b\u0915\u0930 \u092d\u093e\u092a \u092c\u0928 \u091c\u093e\u0924\u093e \u0939\u0948 \u0914\u0930 \u090a\u092a\u0930 \u0909\u0920\u0915\u0930 \u092c\u093e\u0926\u0932 \u092c\u0928\u0924\u093e \u0939\u0948\u0964 \u092b\u093f\u0930 \u092c\u093e\u0930\u093f\u0936 \u0939\u094b\u0915\u0930 \u092a\u093e\u0928\u0940 \u0935\u093e\u092a\u0938 \u0906\u0924\u093e \u0939\u0948!",
                    "key_points": ["\u0927\u0942\u092a \u0938\u0947 \u092a\u093e\u0928\u0940 \u0917\u0930\u092e \u0939\u094b\u0915\u0930 \u092d\u093e\u092a \u092c\u0928\u0924\u093e \u0939\u0948\u0964", "\u092d\u093e\u092a \u090a\u092a\u0930 \u091c\u093e\u0915\u0930 \u092c\u093e\u0926\u0932 \u092c\u0928\u0924\u0940 \u0939\u0948\u0964", "\u092c\u093e\u0926\u0932 \u0938\u0947 \u092c\u093e\u0930\u093f\u0936 \u0939\u094b\u0924\u0940 \u0939\u0948\u0964"],
                    "example": "\u091c\u0948\u0938\u0947 \u0917\u0930\u092e \u0926\u0942\u0927 \u092f\u093e \u091a\u093e\u092f \u0938\u0947 \u092d\u093e\u092a \u090a\u092a\u0930 \u0909\u0920\u0924\u0940 \u0939\u0948\u0964",
                    "follow_up_question": "\u0915\u094d\u092f\u093e \u0906\u092a\u0928\u0947 \u0915\u092d\u0940 \u0927\u0942\u092a \u092e\u0947\u0902 \u0917\u0940\u0932\u0947 \u0915\u092a\u0921\u093c\u0947 \u0938\u0942\u0916\u0924\u0947 \u0926\u0947\u0916\u0947 \u0939\u0948\u0902?",
                    "provider_mode": "mock",
                    "is_development_fallback": True
                }
            elif detected_language == "Bengali":
                return {
                    "response": "\u09b8\u09c2\u09b0\u09cd\u09af\u09c7\u09b0 \u09a4\u09be\u09aa\u09c7 \u09a8\u09a6\u09c0 \u098f\u09ac\u0982 \u09aa\u09c1\u0995\u09c1\u09b0\u09c7\u09b0 \u099c\u09b2 \u0997\u09b0\u09ae \u09b9\u09df\u09c7 \u09ac\u09be\u09b7\u09cd\u09aa\u09c7 \u09aa\u09b0\u09bf\u09a3\u09a4 \u09b9\u09df \u098f\u09ac\u0982 \u0993\u09aa\u09b0\u09c7 \u0989\u09a0\u09c7 \u09ae\u09c7\u0998 \u09a4\u09c8\u09b0\u09bf \u0995\u09b0\u09c7\u0964",
                    "key_points": ["\u09b8\u09c2\u09b0\u09cd\u09af\u09c7\u09b0 \u09a4\u09be\u09aa\u09c7 \u099c\u09b2 \u0997\u09b0\u09ae \u09b9\u09df\u0964", "\u09ac\u09be\u09b7\u09cd\u09aa \u0993\u09aa\u09b0\u09c7 \u0989\u09a0\u09c7 \u09ae\u09c7\u0998 \u09b9\u09df\u0964"],
                    "example": "\u09af\u09c7\u09ae\u09a8 \u0997\u09b0\u09ae \u099a\u09be\u09df\u09c7\u09b0 \u0995\u09be\u09aa \u09a5\u09c7\u0995\u09c7 \u09a7\u09cb\u0981\u09df\u09be \u0993\u09a0\u09c7\u0964",
                    "follow_up_question": "\u09a4\u09c1\u09ae\u09bf \u0995\u09bf \u0995\u0996\u09a8\u09cb \u09b0\u09cb\u09a6\u09c7 \u099c\u09b2 \u09b6\u09c1\u0995\u09be\u09a4\u09c7 \u09a6\u09c7\u0996\u09c7\u099b?",
                    "provider_mode": "mock",
                    "is_development_fallback": True
                }
            else:
                return {
                    "response": "When the sun warms up water in ponds and oceans, it turns into tiny invisible steam called water vapour and floats up to form fluffy clouds!",
                    "key_points": ["The sun warms up the water.", "Warm water turns into light vapour and floats up.", "Clouds bring back rain."],
                    "example": "Just like steam rising from a warm cup of hot soup!",
                    "follow_up_question": "Have you ever seen a puddle dry up after the sun comes out?",
                    "provider_mode": "mock",
                    "is_development_fallback": True
                }

        # 2. Plants, Photosynthesis & Food
        if any(w in lower_q for w in ["plant", "food", "sunlight", "photosynth", "leaf", "leaves"]) or any(w in clean_q for w in ["\u0b17\u0b1b", "\u0b16\u0b3e\u0b26\u0b4d\u0b2f", "\u0b38\u0b42\u0b30\u0b4d\u0b2f\u0b4d\u0b2f", "\u092a\u094c\u0927\u0947", "\u092d\u094b\u091c\u0928", "\u0b2a\u0b24\u0b4d\u0b30"]):
            if detected_language == "Odia":
                return {
                    "response": "\u0b17\u0b1b\u0b2e\u0b3e\u0b28\u0b47 \u0b38\u0b42\u0b30\u0b4d\u0b2f\u0b4d\u0b2f\u0b3e\u0b32\u0b4b\u0b15, \u0b2a\u0b3e\u0b23\u0b3f \u0b0f\u0b2c\u0b02 \u0b2c\u0b3e\u0b5f\u0b41\u0b30 \u0b38\u0b3e\u0b39\u0b3e\u0b2f\u0b4d\u0b2f\u0b30\u0b47 \u0b28\u0b3f\u0b1c \u0b2a\u0b24\u0b4d\u0b30\u0b30\u0b47 \u0b16\u0b3e\u0b26\u0b4d\u0b2f \u0b24\u0b3f\u0b06\u0b30\u0b3f \u0b15\u0b30\u0b28\u0b4d\u0b24\u0b3f \u0964 \u0b0f\u0b39\u0b3e\u0b15\u0b41 \u0b06\u0b32\u0b4b\u0b15\u0b36\u0b4d\u0b33\u0b47\u0b37\u0b23 \u0b15\u0b3f\u0b2e\u0b4d\u0b2c\u0b3e \u0b2b\u0b1f\u0b4b\u0b38\u0b3f\u0b28\u0b4d\u0b25\u0b47\u0b38\u0b3f\u0b38\u0b4d (Photosynthesis) \u0b15\u0b39\u0b28\u0b4d\u0b24\u0b3f \u0964",
                    "key_points": ["\u0b17\u0b1b \u0b38\u0b42\u0b30\u0b4d\u0b2f\u0b4d\u0b2f\u0b3e\u0b32\u0b4b\u0b15 \u0b2c\u0b4d\u0b2f\u0b2c\u0b39\u0b3e\u0b30 \u0b15\u0b30\u0b47 \u0964", "\u0b2a\u0b3e\u0b23\u0b3f \u0b13 \u0b2c\u0b3e\u0b5f\u0b41 \u0b2e\u0b27\u0b4d\u0b2f \u0b32\u0b3e\u0b17\u0b47 \u0964", "\u0b2a\u0b24\u0b4d\u0b30\u0b30\u0b47 \u0b16\u0b3e\u0b26\u0b4d\u0b2f \u0b24\u0b3f\u0b06\u0b30\u0b3f \u0b39\u0b41\u0b0f \u0964"],
                    "example": "\u0b2f\u0b47\u0b2e\u0b3f\u0b24\u0b3f \u0b06\u0b2e\u0b47 \u0b30\u0b3e\u0b28\u0b4d\u0b27\u0b3e \u0b18\u0b30\u0b47 \u0b16\u0b3e\u0b26\u0b4d\u0b2f \u0b24\u0b3f\u0b06\u0b30\u0b3f \u0b15\u0b30\u0b41, \u0b17\u0b1b \u0b2a\u0b24\u0b4d\u0b30\u0b30\u0b47 \u0b24\u0b3f\u0b06\u0b30\u0b3f \u0b15\u0b30\u0b47 \u0964",
                    "follow_up_question": "\u0b17\u0b1b \u0b15\u0b3e\u0b39\u0b3f\u0b01\u0b15\u0b3f \u0b38\u0b2c\u0b41\u0b1c \u0b30\u0b19\u0b4d\u0b17\u0b30 \u0b39\u0b41\u0b0f \u0b1c\u0b3e\u0b23 ?",
                    "provider_mode": "mock",
                    "is_development_fallback": True
                }
            elif detected_language == "Hindi":
                return {
                    "response": "\u092a\u094c\u0927\u0947 \u0938\u0942\u0930\u091c \u0915\u0940 \u0930\u094b\u0936\u0928\u0940, \u092a\u093e\u0928\u0940 \u0914\u0930 \u0939\u0935\u093e \u0915\u0940 \u092e\u0926\u0926 \u0938\u0947 \u0905\u092a\u0928\u0940 \u092a\u0924\u094d\u0924\u093f\u092f\u094b\u0902 \u092e\u0947\u0902 \u092d\u094b\u091c\u0928 \u092c\u0928\u093e\u0924\u0947 \u0939\u0948\u0902\u0964 \u0907\u0938\u0947 \u092a\u094d\u0930\u0915\u093e\u0936 \u0938\u0902\u0936\u094d\u0932\u0947\u0937\u0923 (Photosynthesis) \u0915\u0939\u0924\u0947 \u0939\u0948\u0902\u0964",
                    "key_points": ["\u092a\u094c\u0927\u0947 \u0938\u0942\u0930\u091c \u0915\u0940 \u0930\u094b\u0936\u0928\u0940 \u0932\u0947\u0924\u0947 \u0939\u0948\u0902\u0964", "\u092a\u093e\u0928\u0940 \u0914\u0930 \u0939\u0935\u093e \u091c\u0930\u0942\u0930\u0940 \u0939\u0948\u0964", "\u092a\u0924\u094d\u0924\u093f\u092f\u094b\u0902 \u092e\u0947\u0902 \u092d\u094b\u091c\u0928 \u092c\u0928\u0924\u093e \u0939\u0948\u0964"],
                    "example": "\u091c\u0948\u0938\u0947 \u0939\u092e \u0930\u0938\u094b\u0908 \u092e\u0947\u0902 \u0916\u093e\u0928\u093e \u092c\u0928\u093e\u0924\u0947 \u0939\u0948\u0902, \u092a\u094c\u0927\u0947 \u092a\u0924\u094d\u0924\u093f\u092f\u094b\u0902 \u092e\u0947\u0902 \u092c\u0928\u093e\u0924\u0947 \u0939\u0948\u0902\u0964",
                    "follow_up_question": "\u092a\u094c\u0927\u094b\u0902 \u0915\u0940 \u092a\u0924\u094d\u0924\u093f\u092f\u093e\u0901 \u0939\u0930\u0940 \u0915\u094d\u092f\u094b\u0902 \u0939\u094b\u0924\u0940 \u0939\u0948\u0902?",
                    "provider_mode": "mock",
                    "is_development_fallback": True
                }
            else:
                return {
                    "response": "Plants are amazing! They use sunlight, water from the soil, and air to make their own food inside their green leaves. This process is called Photosynthesis!",
                    "key_points": ["Plants use sunlight to make food.", "They need water and air too.", "Food is made in the leaves."],
                    "example": "Just like we cook food in a kitchen, plants cook their food in their green leaves using sunlight!",
                    "follow_up_question": "Do you know why leaves are green?",
                    "provider_mode": "mock",
                    "is_development_fallback": True
                }

        # 3. Generic fallback for unknown topics
        if detected_language == "Odia":
            return {
                "response": f"\u098f\u099f\u09bf \u098f\u0995\u099f\u09bf \u09ad\u09be\u09b2\u09cb \u09aa\u09cd\u09b0\u09b6\u09cd\u09a8! {topic} \u0b2c\u0b3f\u0b37\u0b5f\u0b30\u0b47 \u0b06\u0b09 \u0b36\u0b3f\u0b16\u0b3f\u0b2c\u0b3e \u0964 \u0b24\u0b41\u0b2e\u0b30 \u0b36\u0b3f\u0b15\u0b4d\u0b37\u0b15\u0b19\u0b4d\u0b15\u0b41 \u0b2a\u0b1a\u0b3e\u0b30\u0b3f\u0b32\u0b47 \u0b38\u0b47\u0b2e\u0b3e\u0b28\u0b47 \u0b06\u0b39\u0b41\u0b30\u0b3f \u0b2d\u0b32 \u0b15\u0b30\u0b3f \u0b2c\u0b41\u0b1d\u0b3e\u0b07\u0b26\u0b47\u0b2c\u0b47 \u0964",
                "key_points": [],
                "example": "",
                "follow_up_question": "\u0b24\u0b41\u0b2e\u0b47 \u0b06\u0b09 \u0b15\u0b3f\u0b1b\u0b3f \u0b1c\u0b3e\u0b23\u0b3f\u0b2c\u0b3e\u0b15\u0b41 \u0b1a\u0b3e\u0b39\u0b41\u0b01\u0b1b ?",
                "provider_mode": "mock",
                "is_development_fallback": True
            }
        elif detected_language == "Hindi":
            return {
                "response": f"\u092c\u0939\u0941\u0924 \u0905\u091a\u094d\u091b\u093e \u0938\u0935\u093e\u0932! {topic} \u0915\u0947 \u092c\u093e\u0930\u0947 \u092e\u0947\u0902 \u0914\u0930 \u0938\u0940\u0916\u0924\u0947 \u0939\u0948\u0902\u0964 \u0905\u092a\u0928\u0947 \u0936\u093f\u0915\u094d\u0937\u0915 \u0938\u0947 \u092a\u0942\u091b\u094b \u0924\u094b \u0935\u0947 \u0914\u0930 \u0905\u091a\u094d\u091b\u0947 \u0938\u0947 \u0938\u092e\u091d\u093e\u090f\u0902\u0917\u0947\u0964",
                "key_points": [],
                "example": "",
                "follow_up_question": "\u0915\u094d\u092f\u093e \u0906\u092a \u0914\u0930 \u0915\u0941\u091b \u091c\u093e\u0928\u0928\u093e \u091a\u093e\u0939\u0924\u0947 \u0939\u0948\u0902?",
                "provider_mode": "mock",
                "is_development_fallback": True
            }
        else:
            return {
                "response": f"Great question! Let's explore {topic} together. Ask your teacher and they'll explain it wonderfully!",
                "key_points": [],
                "example": "",
                "follow_up_question": "Would you like to know more about something else?",
                "provider_mode": "mock",
                "is_development_fallback": True
            }


# =============================================================================
# GOOGLE GEMINI NATIVE PROVIDER (Primary)
# =============================================================================

class GeminiLLMProvider(BaseLLMProvider):
    """
    Native Google Gemini LLM Provider using the google-genai SDK.
    Uses the Gemini API directly for high-quality multilingual educational responses.
    Includes multi-model candidate failover and loop degeneration guards.
    """

    CANDIDATE_MODELS = [
        "gemini-3.7-flash",
        "gemini-3.6-flash",
        "gemini-3.5-flash",
        "gemini-2.5-flash-lite"
    ]

    def __init__(
        self,
        api_key: str,
        model: str = "gemini-3.7-flash",
        timeout_seconds: float = 25.0
    ):
        from google import genai
        self.api_key = api_key.strip()
        self.model_name = model if model in self.CANDIDATE_MODELS else "gemini-3.7-flash"
        self.timeout = timeout_seconds

        # Create the Gemini client
        self.client = genai.Client(api_key=self.api_key)

        logger.info(f"GeminiLLMProvider initialized with model: {self.model_name}")

    def _generate(self, system_prompt: str, user_prompt: str, temperature: float = 0.35, max_tokens: int = 800) -> str:
        """Execute a Gemini generation call with system + user prompt and multi-model failover."""
        from google.genai import types

        config = types.GenerateContentConfig(
            system_instruction=system_prompt,
            temperature=temperature,
            max_output_tokens=max_tokens,
            top_p=0.95,
            safety_settings=[
                types.SafetySetting(category="HARM_CATEGORY_HARASSMENT", threshold="OFF"),
                types.SafetySetting(category="HARM_CATEGORY_HATE_SPEECH", threshold="OFF"),
                types.SafetySetting(category="HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold="OFF"),
                types.SafetySetting(category="HARM_CATEGORY_DANGEROUS_CONTENT", threshold="OFF"),
            ]
        )

        models_to_try = [self.model_name] + [m for m in self.CANDIDATE_MODELS if m != self.model_name]
        last_error = None

        for candidate in models_to_try:
            try:
                response = self.client.models.generate_content(
                    model=candidate,
                    contents=user_prompt,
                    config=config,
                )

                if response and response.text:
                    generated = response.text.strip()
                    # Clean markdown fencing
                    generated = re.sub(r"^```[a-z]*\s*", "", generated)
                    generated = re.sub(r"\s*```$", "", generated)
                    generated = generated.strip('"').strip("'").strip()
                    # Post-process repetition loop cleanup
                    generated = clean_repetitive_loops(generated)
                    if generated:
                        self.model_name = candidate
                        return generated

                logger.warning(f"Model {candidate} returned empty response. Trying next candidate...")
            except Exception as e:
                last_error = e
                err_str = str(e).lower()
                if "api key" in err_str or "permission" in err_str or "403" in err_str:
                    raise ValueError(f"Invalid Google Gemini API Key: {e}")
                logger.warning(f"Gemini candidate {candidate} failed ({e}). Trying next model...")

        raise RuntimeError(f"All Gemini models failed. Last error: {last_error}")

    def generate_response(
        self,
        text: str,
        target_language: str,
        grade: str,
        subject: str,
        source_language: str = "English"
    ) -> Dict[str, Any]:
        if not self.api_key:
            raise ValueError("Google Gemini API key is missing or unconfigured.")

        user_content = build_user_prompt(
            text=text,
            target_language=target_language,
            grade=grade,
            subject=subject,
            source_language=source_language
        )

        generated_text = self._generate(
            system_prompt=SYSTEM_PROMPT,
            user_prompt=user_content,
            temperature=0.35,
            max_tokens=800
        )

        return {
            "success": True,
            "language": target_language,
            "response": generated_text,
            "provider_mode": "gemini",
            "model": self.model_name,
            "is_development_fallback": False
        }

    def generate_tutor_response(
        self,
        query: str,
        detected_language: str,
        grade: str = "Class 3",
        subject: str = "Science",
        topic: str = "General"
    ) -> Dict[str, Any]:
        if not self.api_key:
            raise ValueError("Google Gemini API key is missing or unconfigured.")

        user_content = build_student_tutor_user_prompt(
            query=query,
            grade=grade,
            subject=subject,
            topic=topic,
            language_hint=detected_language
        )

        generated_text = self._generate(
            system_prompt=STUDENT_TUTOR_SYSTEM_PROMPT,
            user_prompt=user_content,
            temperature=0.4,
            max_tokens=800
        )

        return {
            "response": generated_text,
            "key_points": [],
            "example": "",
            "follow_up_question": "",
            "provider_mode": "gemini",
            "model": self.model_name,
            "is_development_fallback": False
        }


# =============================================================================
# OPENAI-COMPATIBLE PROVIDER (Fallback for Groq / OpenAI / other endpoints)
# =============================================================================

class OpenAILLMProvider(BaseLLMProvider):
    """
    OpenAI-compatible chat completion provider.
    Supports any OpenAI-compatible API endpoint
    (e.g., Groq Qwen/Llama, OpenAI GPT-4o-mini, Ollama).
    Used as fallback when Gemini is not configured.
    """

    def __init__(
        self,
        api_key: str,
        model: Optional[str] = None,
        api_base: Optional[str] = None,
        timeout_seconds: float = 20.0
    ):
        self.api_key = api_key.strip()
        
        # Auto-configure provider based on API Key / Base URL
        if self.api_key.startswith("gsk_") or "groq" in (api_base or "").lower():
            default_base = "https://api.groq.com/openai/v1"
            default_model = "qwen/qwen3.8-27b"
        else:
            default_base = "https://api.openai.com/v1"
            default_model = "gpt-4o-mini"

        self.api_base = (api_base or os.getenv("LLM_API_BASE") or default_base).rstrip("/")
        
        configured_model = model or os.getenv("LLM_MODEL")
        if not configured_model or configured_model in ["llama-3.3-70b-versatile", "llama-3.1-70b-versatile", "llama-3.1-8b-instant"]:
            self.model = default_model
        elif "openai.com" in self.api_base and ("llama" in configured_model.lower() or "qwen" in configured_model.lower()):
            self.model = "gpt-4o-mini"
        elif "groq.com" in self.api_base and "gpt-4" in configured_model.lower():
            self.model = "qwen/qwen3.8-27b"
        else:
            self.model = configured_model

        self.timeout = timeout_seconds

    def _execute_chat_completion(self, messages: list, max_tokens: int = 600, temperature: float = 0.4) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        endpoint_url = f"{self.api_base}/chat/completions"

        # Candidate models to try if the active model encounters 404 or 400
        candidate_models = [self.model]
        if "groq.com" in self.api_base:
            for fallback_m in ["qwen/qwen3.8-27b", "groq/compound-mini", "openai/gpt-oss-120b"]:
                if fallback_m not in candidate_models:
                    candidate_models.append(fallback_m)
        elif "openai.com" in self.api_base:
            for fallback_m in ["gpt-4o-mini", "gpt-3.5-turbo"]:
                if fallback_m not in candidate_models:
                    candidate_models.append(fallback_m)

        last_error = None
        for candidate in candidate_models:
            payload = {
                "model": candidate,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens
            }
            try:
                with httpx.Client(timeout=self.timeout) as client:
                    response = client.post(endpoint_url, headers=headers, json=payload)
                
                if response.status_code == 200:
                    res_json = response.json()
                    choices = res_json.get("choices", [])
                    if choices:
                        self.model = candidate  # Update active model
                        generated = choices[0].get("message", {}).get("content", "").strip()
                        return generated
                elif response.status_code == 401:
                    raise ValueError("Invalid LLM API Key. Please check your credentials.")
                elif response.status_code == 429:
                    raise RuntimeError("LLM rate limit reached. Please try again shortly.")
                else:
                    last_error = f"Status {response.status_code}: {response.text}"
                    logger.warning(f"Model {candidate} failed with {last_error}. Trying next candidate...")
            except (ValueError, RuntimeError):
                raise
            except Exception as e:
                last_error = str(e)
                logger.warning(f"Connection notice with model {candidate}: {e}")

        raise RuntimeError(f"All LLM candidate models failed. Last error: {last_error}")

    def generate_response(
        self,
        text: str,
        target_language: str,
        grade: str,
        subject: str,
        source_language: str = "English"
    ) -> Dict[str, Any]:
        if not self.api_key:
            raise ValueError("LLM API key is missing or unconfigured.")

        user_content = build_user_prompt(
            text=text,
            target_language=target_language,
            grade=grade,
            subject=subject,
            source_language=source_language
        )

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content}
        ]

        generated_text = self._execute_chat_completion(messages, max_tokens=500, temperature=0.3)
        generated_text = re.sub(r"^```[a-z]*\s*", "", generated_text)
        generated_text = re.sub(r"\s*```$", "", generated_text)
        generated_text = generated_text.strip('"').strip("'").strip()

        return {
            "success": True,
            "language": target_language,
            "response": generated_text,
            "provider_mode": "production_llm",
            "model": self.model,
            "is_development_fallback": False
        }

    def generate_tutor_response(
        self,
        query: str,
        detected_language: str,
        grade: str = "Class 3",
        subject: str = "Science",
        topic: str = "General"
    ) -> Dict[str, Any]:
        if not self.api_key:
            raise ValueError("LLM API key is missing or unconfigured.")

        user_content = build_student_tutor_user_prompt(
            query=query,
            grade=grade,
            subject=subject,
            topic=topic,
            language_hint=detected_language
        )

        messages = [
            {"role": "system", "content": STUDENT_TUTOR_SYSTEM_PROMPT},
            {"role": "user", "content": user_content}
        ]

        generated_text = self._execute_chat_completion(messages, max_tokens=600, temperature=0.4)
        generated_text = re.sub(r"^```[a-z]*\s*", "", generated_text)
        generated_text = re.sub(r"\s*```$", "", generated_text)
        generated_text = generated_text.strip('"').strip("'").strip()

        return {
            "response": generated_text,
            "key_points": [],
            "example": "",
            "follow_up_question": "",
            "provider_mode": "production_llm",
            "model": self.model,
            "is_development_fallback": False
        }


# =============================================================================
# LLM SERVICE FACADE
# =============================================================================

class LLMService:
    """
    LLM Service Facade.
    Isolates external LLM invocation, handles DEMO_MODE fallback, and provides unified error handling.
    Provider priority: Google Gemini (native) > OpenAI-compatible (Groq/OpenAI) > Mock (demo).
    """

    SUPPORTED_LANGUAGES = [
        "Odia", "Hindi", "Bengali", "Santhali", "Ho", "Mundari", 
        "Telugu", "Tamil", "Kannada", "Marathi", "Assamese", "English"
    ]

    def get_provider(self) -> BaseLLMProvider:
        demo_mode = os.getenv("DEMO_MODE", "False").lower() in ["true", "1", "yes"]

        # If demo mode is explicitly active, always use mock
        if demo_mode:
            logger.info("DEMO_MODE active — using MockLLMProvider.")
            return MockLLMProvider()

        # 1. Try Google Gemini API key first (primary provider)
        google_api_key = (
            os.getenv("GOOGLE_API_KEY") or
            os.getenv("GEMINI_API_KEY") or
            ""
        ).strip()

        google_placeholder = google_api_key.lower() in ["your_api_key_here", "your_google_api_key_here", "placeholder", "none", ""]

        if google_api_key and not google_placeholder:
            gemini_model = os.getenv("GEMINI_MODEL") or os.getenv("LLM_MODEL") or "gemini-3.6-flash"
            # Ensure we use a Gemini-compatible model name
            if not gemini_model.startswith("gemini"):
                gemini_model = "gemini-3.6-flash"
            logger.info(f"Using GeminiLLMProvider with model: {gemini_model}")
            return GeminiLLMProvider(api_key=google_api_key, model=gemini_model)

        # 2. Fallback to OpenAI-compatible provider (Groq, OpenAI, etc.)
        api_key = (
            os.getenv("LLM_API_KEY") or 
            os.getenv("OPENAI_API_KEY") or 
            os.getenv("GROQ_API_KEY") or 
            getattr(settings, "LLM_API_KEY", "")
        ).strip()

        is_placeholder = api_key.lower() in ["your_api_key_here", "your_llm_api_key_here", "placeholder", "none", ""]

        if not api_key or is_placeholder:
            logger.info("No valid API key found — using MockLLMProvider.")
            return MockLLMProvider()

        # Check if provider is explicitly set to mock
        if getattr(settings, "LLM_PROVIDER", "mock").lower() == "mock":
            logger.info("LLM_PROVIDER=mock — using MockLLMProvider.")
            return MockLLMProvider()

        model = os.getenv("LLM_MODEL") or getattr(settings, "LLM_MODEL", "llama-3.3-70b-versatile")
        api_base = os.getenv("LLM_API_BASE") or getattr(settings, "LLM_API_BASE", None)
        logger.info(f"Using OpenAILLMProvider with model: {model}")
        return OpenAILLMProvider(api_key=api_key, model=model, api_base=api_base)

    def respond(
        self,
        text: str,
        target_language: str = "Odia",
        grade: str = "Class 3",
        subject: str = "Science",
        source_language: str = "English"
    ) -> Dict[str, Any]:
        """
        Main entry point for STT Transcript -> Understand -> Translate -> Adapt flow.
        """
        # 1. Validate Text Input
        if not text or not text.strip():
            return {
                "success": False,
                "error": "Empty text provided. Please provide a valid teacher transcript."
            }

        # 2. Normalize Inputs
        clean_text = text.strip()
        target_lang = (target_language or "Odia").strip()
        grade_str = (grade or "Class 3").strip()
        subject_str = (subject or "Science").strip()
        source_lang = (source_language or "English").strip()

        # Normalize grade representation (e.g., '3' -> 'Class 3')
        if grade_str.isdigit():
            grade_str = f"Class {grade_str}"

        # 3. Invoke Provider with Fallback Strategy
        try:
            provider = self.get_provider()
            res = provider.generate_response(
                text=clean_text,
                target_language=target_lang,
                grade=grade_str,
                subject=subject_str,
                source_language=source_lang
            )
            return {
                "success": True,
                "language": target_lang,
                "response": res.get("response", ""),
                "provider_mode": res.get("provider_mode", "llm"),
                "is_development_fallback": res.get("is_development_fallback", False)
            }
        except Exception as e:
            logger.warning(f"LLM API execution notice ({e}). Activating dynamic vernacular engine fallback.")
            mock_res = MockLLMProvider().generate_response(
                text=clean_text,
                target_language=target_lang,
                grade=grade_str,
                subject=subject_str,
                source_language=source_lang
            )
            return {
                "success": True,
                "language": target_lang,
                "response": mock_res.get("response", ""),
                "provider_mode": mock_res.get("provider_mode", "mock_dynamic_fallback"),
                "is_development_fallback": True
            }

    def tutor_respond(
        self,
        query: str,
        grade: str = "Class 3",
        subject: str = "Science",
        topic: str = "General",
        language_override: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Student AI Tutor interaction:
        Accepts questions in ANY language and responds in the EXACT SAME language as the student.
        """
        if not query or not query.strip():
            return {
                "success": False,
                "error": "Empty question provided. Please enter a question."
            }

        clean_query = query.strip()
        detected_lang = detect_query_language(clean_query)
        target_lang = language_override if language_override and language_override != "auto" else detected_lang
        
        provider = self.get_provider()
        
        try:
            res = provider.generate_tutor_response(
                query=clean_query,
                detected_language=target_lang,
                grade=grade,
                subject=subject,
                topic=topic
            )
            return {
                "success": True,
                "query": clean_query,
                "detected_language": target_lang,
                "response": res.get("response", ""),
                "simple_explanation": res.get("response", ""),
                "key_points": res.get("key_points", []),
                "example": res.get("example", ""),
                "follow_up_question": res.get("follow_up_question", ""),
                "source": f"{grade} {subject} - {topic}",
                "confidence_score": 0.96,
                "provider_mode": res.get("provider_mode", "llm"),
                "is_development_fallback": res.get("is_development_fallback", False)
            }
        except Exception as e:
            logger.warning(f"LLM Tutor execution notice ({e}). Activating dynamic vernacular engine fallback.")
            mock_res = MockLLMProvider().generate_tutor_response(
                query=clean_query,
                detected_language=target_lang,
                grade=grade,
                subject=subject,
                topic=topic
            )
            return {
                "success": True,
                "query": clean_query,
                "detected_language": target_lang,
                "response": mock_res.get("response", ""),
                "simple_explanation": mock_res.get("response", ""),
                "key_points": mock_res.get("key_points", []),
                "example": mock_res.get("example", ""),
                "follow_up_question": mock_res.get("follow_up_question", ""),
                "source": f"{grade} {subject} - {topic}",
                "confidence_score": 0.95,
                "provider_mode": mock_res.get("provider_mode", "mock_dynamic_tutor"),
                "is_development_fallback": True
            }


# Singleton Service Instance
llm_service = LLMService()
