import os
import asyncio
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, Field
import websockets

from backend.app.config import settings
from backend.app.schemas.payload import (
    TranslationRequest, TranslationResponse,
    STTResponse, RAGQueryRequest, RAGQueryResponse, DocumentUploadResponse,
    QuizGenerateRequest, QuizGenerateResponse, QuizEvaluateRequest, QuizEvaluateResponse,
    AnalyticsSummary, HealthCheck
)
from backend.app.services.translation_service import translation_service
from backend.app.services.pedagogy_service import pedagogy_service
from backend.app.services.quiz_service import quiz_service
from backend.app.services.speech_service import tts_service, stt_service
from rag.vector_store import rag_engine
from backend.app.core.database import get_db
from backend.app.core import models

router = APIRouter()

# Schemas
class StandardTranslationRequest(BaseModel):
    text: str = Field(..., description="Text to translate")
    source_language: Optional[str] = Field(default="English", description="Source language")
    target_language: Optional[str] = Field(default="Odia", description="Target language")
    source_lang: Optional[str] = None
    target_lang: Optional[str] = None

class PedagogyExplainRequest(BaseModel):
    text: str = Field(..., description="Text for pedagogical explanation")
    grade: int = Field(default=3, description="Grade level")
    subject: str = Field(default="Science", description="Subject")
    language: str = Field(default="Odia", description="Target language")

class SynthesizePayload(BaseModel):
    text: str = Field(..., description="Text for synthesis")
    language: Optional[str] = Field(default="Odia", description="Target voice language")
    lang: Optional[str] = None

class TranscribePayload(BaseModel):
    text_override: Optional[str] = None
    source_lang: Optional[str] = "English"

class DeepgramKeyPayload(BaseModel):
    key: str

# Foundation API Endpoint: POST /api/speech/synthesize
@router.post("/speech/synthesize")
def speech_synthesize(payload: SynthesizePayload):
    if not payload.text or not payload.text.strip():
        raise HTTPException(status_code=400, detail="Empty text provided for speech synthesis.")
    
    target_language = payload.language or payload.lang or "Odia"

    supported_languages = ["Odia", "Hindi", "Santhali", "English"]
    if target_language not in supported_languages:
        raise HTTPException(
            status_code=422,
            detail=f"Unsupported language '{target_language}' for speech synthesis. Supported languages: {supported_languages}"
        )

    res = tts_service.synthesize(payload.text, target_language)
    return res

# Foundation API Endpoint: POST /api/pedagogy/explain
@router.post("/pedagogy/explain")
def pedagogy_explain(payload: PedagogyExplainRequest):
    if not payload.text or not payload.text.strip():
        raise HTTPException(status_code=400, detail="Empty text provided for pedagogical explanation.")
    
    if payload.grade < 1 or payload.grade > 12:
        raise HTTPException(status_code=422, detail=f"Invalid grade level '{payload.grade}'. Primary/Secondary grades supported: 1 to 12.")

    res = pedagogy_service.explain(payload.text, payload.grade, payload.subject, payload.language)
    return res

# Foundation API Endpoint: POST /api/translation/translate
@router.post("/translation/translate")
def translate_text(payload: StandardTranslationRequest):
    if not payload.text or not payload.text.strip():
        raise HTTPException(status_code=400, detail="Empty text provided for translation.")
    
    src = payload.source_language or payload.source_lang or "English"
    tgt = payload.target_language or payload.target_lang or "Odia"

    supported_langs = ["Odia", "Hindi", "Santhali", "Bengali", "English", "Ho", "Mundari"]
    if tgt not in supported_langs:
        raise HTTPException(status_code=422, detail=f"Unsupported target language '{tgt}'. Supported: {supported_langs}")

    result = translation_service.translate(payload.text, src, tgt)
    
    return {
        "source_language": result["source_language"],
        "target_language": result["target_language"],
        "original_text": result["original_text"],
        "translated_text": result["translated_text"],
        "provider_mode": result["provider_mode"],
        "is_development_fallback": result["is_development_fallback"]
    }

@router.post("/speech/transcribe")
async def speech_transcribe(payload: Optional[TranscribePayload] = None):
    text = (payload.text_override if payload and payload.text_override else "").strip()
    
    # If a custom override text is sent, treat it as a direct transcription return
    if text:
        return {
            "transcript": text,
            "detected_language": "English",
            "confidence": 0.98,
            "provider_mode": "deepgram" if settings.STT_PROVIDER != "mock" else "mock"
        }
        
    # Otherwise run default mock transcription through stt_service
    res = stt_service.transcribe(b"")
    return res

@router.get("/speech/deepgram-key")
def get_deepgram_key():
    key = os.getenv("DEEPGRAM_API_KEY", "23dae82420be843b3b183028b35162dfca167b8c").strip()
    return {"key": key, "status": "active" if bool(key) else "missing"}

@router.post("/speech/deepgram-key")
def update_deepgram_key(payload: DeepgramKeyPayload):
    key = payload.key.strip()
    os.environ["DEEPGRAM_API_KEY"] = key
    return {"key": key, "status": "updated"}

# Live Streaming STT WebSocket endpoint for browser audio chunk relay
@router.websocket("/speech/live-stt")
async def live_stt_ws(websocket: WebSocket):
    await websocket.accept()
    key = os.getenv("DEEPGRAM_API_KEY", "23dae82420be843b3b183028b35162dfca167b8c").strip()
    deepgram_ws_url = "wss://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&interim_results=true&detect_language=true&endpointing=300"
    
    try:
        async with websockets.connect(deepgram_ws_url, subprotocols=['token', key]) as dg_ws:
            async def forward_audio_to_dg():
                try:
                    while True:
                        msg = await websocket.receive()
                        if "bytes" in msg and msg["bytes"]:
                            await dg_ws.send(msg["bytes"])
                        elif "text" in msg and msg["text"]:
                            await dg_ws.send(msg["text"])
                except (WebSocketDisconnect, Exception):
                    pass

            async def forward_transcripts_to_client():
                try:
                    async for msg in dg_ws:
                        await websocket.send_text(msg)
                except (WebSocketDisconnect, Exception):
                    pass

            await asyncio.gather(forward_audio_to_dg(), forward_transcripts_to_client())
    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_json({"type": "Error", "message": str(e)})
        except Exception:
            pass

# v1 Router Endpoints
@router.get("/health", response_model=HealthCheck)
def health_check():
    return HealthCheck(
        status="online",
        version="1.0.0",
        rag_status="active",
        database="sqlite"
    )

@router.post("/translate", response_model=TranslationResponse)
def translate_and_adapt(payload: TranslationRequest, db: Session = Depends(get_db)):
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Empty text provided.")
        
    detected = translation_service.detect_language(payload.text)
    trans_res = translation_service.translate(payload.text, payload.source_lang, payload.target_lang)
    direct_trans = trans_res["translated_text"]
    ped_result = pedagogy_service.adapt(payload.text, payload.grade, payload.subject, payload.target_lang)
    rag_res = rag_engine.query(payload.text, payload.grade, payload.subject, payload.target_lang)

    try:
        lesson_record = models.LessonRecord(
            title=payload.topic or "Lesson",
            grade=payload.grade,
            subject=payload.subject,
            source_lang=payload.source_lang,
            target_lang=payload.target_lang
        )
        db.add(lesson_record)
        db.commit()
    except Exception as e:
        print("Database save notice:", e)

    return TranslationResponse(
        source_text=payload.text,
        detected_lang=detected,
        direct_translation=direct_trans,
        pedagogical_adaptation=ped_result["pedagogical_adaptation"],
        key_points=ped_result["key_points"],
        rag_source=rag_res["source"],
        audio_script=ped_result["pedagogical_adaptation"]
    )

@router.post("/speech/stt", response_model=STTResponse)
async def speech_to_text(file: UploadFile = File(...)):
    audio_bytes = await file.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Empty audio file uploaded.")
        
    res = stt_service.transcribe(audio_bytes, content_type=file.content_type or "audio/webm")
    return STTResponse(
        transcript=res["transcript"],
        detected_language=res["detected_language"],
        confidence=res["confidence"]
    )

@router.post("/rag/query", response_model=RAGQueryResponse)
def query_rag(payload: RAGQueryRequest):
    res = rag_engine.query(payload.query, payload.grade, payload.subject, payload.lang)
    return RAGQueryResponse(
        answer=res["answer"],
        source=res["source"],
        confidence_score=res["confidence_score"]
    )

@router.post("/rag/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    grade: str = Form("Class 3"),
    subject: str = Form("Science"),
    lang: str = Form("Odia"),
    db: Session = Depends(get_db)
):
    content = await file.read()
    text_content = content.decode("utf-8", errors="ignore") or f"Textbook content from {file.filename}"
    res = rag_engine.add_document(file.filename, text_content, grade, subject, lang)
    
    try:
        doc_record = models.CurriculumDoc(
            name=file.filename,
            grade=grade,
            subject=subject,
            lang=lang,
            status="Ready",
            num_chunks=res["num_chunks"]
        )
        db.add(doc_record)
        db.commit()
    except Exception as e:
        print("Database save notice:", e)
        
    return DocumentUploadResponse(**res)

@router.post("/quiz/generate", response_model=QuizGenerateResponse)
def generate_quiz(payload: QuizGenerateRequest):
    res = quiz_service.generate(
        payload.topic, payload.grade, payload.subject, payload.target_lang, payload.num_questions
    )
    return QuizGenerateResponse(**res)

@router.post("/quiz/evaluate", response_model=QuizEvaluateResponse)
def evaluate_quiz(payload: QuizEvaluateRequest, db: Session = Depends(get_db)):
    answers_dict = [{"question_id": a.question_id, "selected_key": a.selected_key} for a in payload.answers]
    res = quiz_service.evaluate(payload.quiz_id, answers_dict)
    
    try:
        qr = models.QuizResultRecord(
            topic="Water Cycle",
            score=res["score"],
            total=res["total"],
            percentage=res["percentage"]
        )
        db.add(qr)
        db.commit()
    except Exception as e:
        print("Database save notice:", e)

    return QuizEvaluateResponse(**res)

@router.get("/analytics/summary", response_model=AnalyticsSummary)
def get_analytics():
    return AnalyticsSummary(
        total_lessons=12,
        total_students=35,
        avg_accuracy=84.0,
        language_breakdown={"Odia": 60, "Hindi": 25, "English": 15},
        recent_activity=[
            {
                "id": 1,
                "title": "Water Cycle lesson conducted for Class 3 Science",
                "target_lang": "Odia",
                "accuracy": 92,
                "date": "20 May 2025 - 10:30 AM"
            }
        ]
    )
