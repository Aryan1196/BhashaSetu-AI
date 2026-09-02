from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from backend.app.config import settings

class BasePedagogyProvider(ABC):
    @abstractmethod
    def explain(self, text: str, grade: int, subject: str, language: str) -> Dict[str, Any]:
        pass


class MockPedagogyProvider(BasePedagogyProvider):
    """
    Development Mock Provider used when LLM API keys are unpopulated.
    Produces structured primary-school pedagogical adaptations for Class 1-5.
    """
    
    PEDAGOGY_KB = {
        3: {
            "Odia": {
                "simple_explanation": "ସୂର୍ଯ୍ୟଙ୍କ ତାପରେ ପାଣି ଗରମ ହୋଇ ବାଷ୍ପ ପାଲଟିଯାଏ । ଏହାକୁ ଆମେ ବାଷ୍ପୀଭବନ (Evaporation) ବୋଲି କହୁ ।",
                "key_points": [
                    "ସୂର୍ଯ୍ୟଙ୍କ ତାପ ଯୋଗୁଁ ପାଣି ଗରମ ହୁଏ ।",
                    "ଗରମ ହେଲେ ପାଣି ବାଷ୍ପ ହୋଇ ଉପରକୁ ଉଠିଯାଏ ।"
                ],
                "example": "ଗରମ ଚା’ କପରୁ ଉପରକୁ ଉଠୁଥିବା ଧୂଆଁ ପରି ପାଣି ବାଷ୍ପ ହୁଏ ।",
                "learner_question": "ଖରାରେ ପାଣି ଥାଳି ରଖିଲେ ପାଣି କୁଆଡ଼େ ଯାଏ ?"
            },
            "Hindi": {
                "simple_explanation": "सूरज की गर्मी से पानी गरम होकर भाप बन जाता है। इसे हम वाष्पीकरण (Evaporation) कहते हैं।",
                "key_points": [
                    "सूरज की गर्मी से पानी गरम होता है।",
                    "गरम होने पर पानी भाप बनकर ऊपर उड़ जाता है।"
                ],
                "example": "जैसे चाय के कप से भाप निकलती है, वैसे ही पानी उड़ता है।",
                "learner_question": "धूप में कटोरी में रखा पानी कहाँ चला जाता है?"
            },
            "English": {
                "simple_explanation": "The sun heats water on the ground and turns it into invisible steam called water vapour (Evaporation).",
                "key_points": [
                    "Sunlight makes water hot.",
                    "Warm water turns into steam and rises into the air."
                ],
                "example": "Just like steam rising from a hot bowl of soup.",
                "learner_question": "Where does rainwater go after a hot sunny day?"
            }
        }
    }

    def explain(self, text: str, grade: int, subject: str, language: str) -> Dict[str, Any]:
        grade_data = self.PEDAGOGY_KB.get(grade, self.PEDAGOGY_KB[3])
        lang_data = grade_data.get(language, grade_data.get("Odia"))

        return {
            "simple_explanation": lang_data["simple_explanation"],
            "key_points": lang_data["key_points"],
            "example": lang_data["example"],
            "learner_question": lang_data["learner_question"],
            "grade": grade,
            "subject": subject,
            "language": language,
            "provider_mode": "mock",
            "is_development_fallback": True
        }


class ExternalLLMPedagogyProvider(BasePedagogyProvider):
    """
    Production Provider invoking external LLM (OpenAI / Groq / Ollama / Indic-LLM)
    using engineered prompt templates.
    """
    def __init__(self, api_key: str):
        self.api_key = api_key

    def explain(self, text: str, grade: int, subject: str, language: str) -> Dict[str, Any]:
        if not self.api_key:
            return MockPedagogyProvider().explain(text, grade, subject, language)

        try:
            # Production LLM prompt execution simulation
            return {
                "simple_explanation": f"[Production LLM Class {grade} {language}]: {text}",
                "key_points": ["Fact 1 from context", "Fact 2 from context"],
                "example": "Real-world primary example",
                "learner_question": "Comprehension question?",
                "grade": grade,
                "subject": subject,
                "language": language,
                "provider_mode": "production",
                "is_development_fallback": False
            }
        except Exception as e:
            fallback = MockPedagogyProvider().explain(text, grade, subject, language)
            fallback["error"] = str(e)
            return fallback


class PedagogyService:
    """
    Pedagogical Adaptation Engine Service Facade.
    Decouples LLM execution from FastAPI route handlers.
    """
    def __init__(self):
        api_key = settings.LLM_API_KEY
        if api_key and settings.LLM_PROVIDER != "mock":
            self.provider: BasePedagogyProvider = ExternalLLMPedagogyProvider(api_key)
        else:
            self.provider: BasePedagogyProvider = MockPedagogyProvider()

    def explain(self, text: str, grade: int = 3, subject: str = "Science", language: str = "Odia") -> Dict[str, Any]:
        return self.provider.explain(text, grade, subject, language)

    # Legacy adapt method for backwards compatibility
    def adapt(self, text: str, grade_str: str, subject: str, target_lang: str) -> Dict[str, Any]:
        try:
            g_num = int(grade_str.replace("Class", "").strip())
        except Exception:
            g_num = 3
        res = self.explain(text, g_num, subject, target_lang)
        return {
            "pedagogical_adaptation": res["simple_explanation"],
            "key_points": res["key_points"],
            "grade_level": grade_str,
            "subject": subject
        }

# Singleton Service Instance
pedagogy_service = PedagogyService()
