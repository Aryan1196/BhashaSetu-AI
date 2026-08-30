from abc import ABC, abstractmethod
from typing import List, Dict, Any

class BaseTranslationProvider(ABC):
    @abstractmethod
    def translate(self, text: str, source_lang: str, target_lang: str) -> str:
        pass

    @abstractmethod
    def detect_language(self, text: str) -> str:
        pass

class BasePedagogyProvider(ABC):
    @abstractmethod
    def adapt(self, text: str, grade: str, subject: str, target_lang: str) -> Dict[str, Any]:
        pass

class BaseSTTProvider(ABC):
    @abstractmethod
    def transcribe(self, audio_bytes: bytes) -> Dict[str, Any]:
        pass

class BaseTTSProvider(ABC):
    @abstractmethod
    def synthesize(self, text: str, lang: str) -> str:
        pass

class BaseQuizProvider(ABC):
    @abstractmethod
    def generate(self, topic: str, grade: str, subject: str, target_lang: str, num_questions: int) -> Dict[str, Any]:
        pass

    @abstractmethod
    def evaluate(self, quiz_id: str, user_answers: List[Dict[str, Any]]) -> Dict[str, Any]:
        pass
