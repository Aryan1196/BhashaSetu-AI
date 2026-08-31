from pydantic import BaseModel, Field
from typing import List, Optional

# LLM Educational Response Schemas
class AIRespondRequest(BaseModel):
    text: str = Field(..., example="Water evaporates when heated by the sun.")
    target_language: str = Field(default="Odia", example="Odia")
    grade: str = Field(default="Class 3", example="Class 3")
    subject: str = Field(default="Science", example="Science")
    source_language: Optional[str] = Field(default="English", example="English")
    source_lang: Optional[str] = None
    target_lang: Optional[str] = None

class AIRespondResponse(BaseModel):
    success: bool = True
    language: str = "Odia"
    response: str
    error: Optional[str] = None

# Translation & Pedagogy Schemas
class TranslationRequest(BaseModel):
    text: str = Field(..., example="Today we are going to learn about the water cycle.")
    source_lang: str = Field(default="English", example="English")
    target_lang: str = Field(default="Odia", example="Odia")
    source_language: Optional[str] = None
    target_language: Optional[str] = None
    grade: str = Field(default="Class 3", example="Class 3")
    subject: str = Field(default="Science", example="Science")
    topic: Optional[str] = Field(default="Water Cycle", example="Water Cycle")

class TranslationResponse(BaseModel):
    source_text: str
    detected_lang: str
    direct_translation: str
    pedagogical_adaptation: str
    key_points: List[str]
    rag_source: str
    audio_script: str

# Speech Processing Schemas
class STTResponse(BaseModel):
    transcript: str
    detected_language: str
    confidence: float = 0.98

# RAG Schemas
class RAGQueryRequest(BaseModel):
    query: str
    grade: str = "Class 3"
    subject: str = "Science"
    lang: str = "Odia"

class RAGQueryResponse(BaseModel):
    answer: str
    source: str
    confidence_score: float = 0.94

class DocumentUploadResponse(BaseModel):
    document_id: str
    name: str
    grade: str
    subject: str
    lang: str
    status: str
    num_chunks: int

# Quiz Schemas
class QuizOption(BaseModel):
    key: str
    text: str

class QuizQuestion(BaseModel):
    id: int
    question: str
    translation: str
    options: List[QuizOption]

class QuizGenerateRequest(BaseModel):
    topic: str = "Water Cycle"
    grade: str = "Class 3"
    subject: str = "Science"
    target_lang: str = "Odia"
    num_questions: int = 3

class QuizGenerateResponse(BaseModel):
    quiz_id: str
    topic: str
    questions: List[QuizQuestion]

class UserAnswer(BaseModel):
    question_id: int
    selected_key: str

class QuizEvaluateRequest(BaseModel):
    quiz_id: str
    answers: List[UserAnswer]

class QuizEvaluateResponse(BaseModel):
    score: int
    total: int
    percentage: float
    feedback: str

# Analytics & Health
class AnalyticsSummary(BaseModel):
    total_lessons: int
    total_students: int
    avg_accuracy: float
    language_breakdown: dict
    recent_activity: List[dict]

class HealthCheck(BaseModel):
    status: str
    version: str
    rag_status: str
    database: str
