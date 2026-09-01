import os
import json
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from backend.app.config import settings
from backend.app.services.translation_service import translation_service
from backend.app.services.pedagogy_service import pedagogy_service
from backend.app.services.quiz_service import quiz_service
from backend.app.services.speech_service import tts_service, stt_service
from backend.app.services.llm_service import llm_service
from rag.vector_store import rag_engine
from backend.app.models import LessonRecord, CurriculumDoc, QuizResultRecord

@api_view(['POST'])
@permission_classes([AllowAny])
def ai_respond_view(request):
    """
    Primary LLM Integration Endpoint: POST /api/ai/respond/
    Understands teacher transcript, translates, and adapts to student grade & subject in target language.
    """
    data = request.data or {}
    text = (data.get("text") or "").strip()
    if not text:
        return Response(
            {"success": False, "error": "Empty text provided. Please provide a valid teacher transcript."},
            status=status.HTTP_400_BAD_REQUEST
        )

    target_lang = (
        data.get("target_language") or 
        data.get("target_lang") or 
        data.get("language") or 
        "Odia"
    ).strip()

    source_lang = (
        data.get("source_language") or 
        data.get("source_lang") or 
        "English"
    ).strip()

    grade = str(data.get("grade", "Class 3")).strip()
    subject = str(data.get("subject", "Science")).strip()

    res = llm_service.respond(
        text=text,
        target_language=target_lang,
        grade=grade,
        subject=subject,
        source_language=source_lang
    )

    if not res.get("success", False):
        return Response(res, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response(res, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def ai_tutor_view(request):
    """
    AI Student Tutor Endpoint: POST /api/ai/tutor/
    Accepts question in ANY language and responds in the EXACT SAME language.
    """
    data = request.data or {}
    query = (data.get("query") or data.get("text") or data.get("question") or "").strip()
    if not query:
        return Response(
            {"success": False, "error": "Empty question provided. Please enter a question."},
            status=status.HTTP_400_BAD_REQUEST
        )

    grade = data.get("grade", "Class 3")
    subject = data.get("subject", "Science")
    topic = data.get("topic", "General")
    language = data.get("language") or data.get("lang") or "auto"

    res = llm_service.tutor_respond(
        query=query,
        grade=grade,
        subject=subject,
        topic=topic,
        language_override=language
    )

    if not res.get("success", False):
        return Response(res, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response(res, status=status.HTTP_200_OK)

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def llm_key_view(request):
    """
    LLM Key Management Endpoint: GET/POST /api/ai/llm-key/
    Allows inspecting and dynamically updating the active LLM API Key and Model.
    """
    if request.method == 'GET':
        key = (os.getenv("LLM_API_KEY") or os.getenv("GROQ_API_KEY") or os.getenv("OPENAI_API_KEY") or "").strip()
        has_key = bool(key) and key.lower() not in ["your_api_key_here", "your_llm_api_key_here"]
        masked = f"{key[:6]}...{key[-4:]}" if has_key and len(key) > 10 else ("Active" if has_key else "Not Configured")
        return Response({
            "key": key if has_key else "",
            "masked_key": masked,
            "status": "active" if has_key else "unconfigured",
            "model": os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")
        })
    else:
        data = request.data or {}
        key = (data.get("key") or "").strip()
        model = (data.get("model") or "").strip()
        if key:
            os.environ["LLM_API_KEY"] = key
        if model:
            os.environ["LLM_MODEL"] = model
        return Response({"status": "updated", "model": os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")})

@api_view(['GET'])
@permission_classes([AllowAny])
def root_view(request):
    return Response({
        "app": settings.PROJECT_NAME,
        "status": "ok",
        "service": "bhashasetu-ai",
        "health": "/api/health",
        "docs": "/docs"
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def foundation_health_view(request):
    return Response({
        "status": "ok",
        "service": "bhashasetu-ai"
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check_view(request):
    return Response({
        "status": "online",
        "version": "1.0.0",
        "rag_status": "active",
        "database": "sqlite"
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def speech_synthesize_view(request):
    data = request.data or {}
    text = data.get("text", "")
    if not text or not text.strip():
        return Response({"detail": "Empty text provided for speech synthesis."}, status=status.HTTP_400_BAD_REQUEST)
    
    target_language = data.get("language") or data.get("lang") or "Odia"
    supported_languages = ["Odia", "Hindi", "Santhali", "English"]
    if target_language not in supported_languages:
        return Response(
            {"detail": f"Unsupported language '{target_language}' for speech synthesis. Supported languages: {supported_languages}"},
            status=status.HTTP_422_UNPROCESSABLE_ENTITY
        )

    res = tts_service.synthesize(text, target_language)
    return Response(res)

@api_view(['POST'])
@permission_classes([AllowAny])
def pedagogy_explain_view(request):
    data = request.data or {}
    text = data.get("text", "")
    if not text or not text.strip():
        return Response({"detail": "Empty text provided for pedagogical explanation."}, status=status.HTTP_400_BAD_REQUEST)
    
    grade = int(data.get("grade", 3))
    if grade < 1 or grade > 12:
        return Response(
            {"detail": f"Invalid grade level '{grade}'. Primary/Secondary grades supported: 1 to 12."},
            status=status.HTTP_422_UNPROCESSABLE_ENTITY
        )

    subject = data.get("subject", "Science")
    language = data.get("language", "Odia")
    res = pedagogy_service.explain(text, grade, subject, language)
    return Response(res)

@api_view(['POST'])
@permission_classes([AllowAny])
def translate_text_view(request):
    data = request.data or {}
    text = data.get("text", "")
    if not text or not text.strip():
        return Response({"detail": "Empty text provided for translation."}, status=status.HTTP_400_BAD_REQUEST)

    src = data.get("source_language") or data.get("source_lang") or "English"
    tgt = data.get("target_language") or data.get("target_lang") or "Odia"

    supported_langs = ["Odia", "Hindi", "Santhali", "Bengali", "English", "Ho", "Mundari"]
    if tgt not in supported_langs:
        return Response(
            {"detail": f"Unsupported target language '{tgt}'. Supported: {supported_langs}"},
            status=status.HTTP_422_UNPROCESSABLE_ENTITY
        )

    result = translation_service.translate(text, src, tgt)
    return Response({
        "source_language": result["source_language"],
        "target_language": result["target_language"],
        "original_text": result["original_text"],
        "translated_text": result["translated_text"],
        "provider_mode": result["provider_mode"],
        "is_development_fallback": result["is_development_fallback"]
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def speech_transcribe_view(request):
    data = request.data or {}
    text = (data.get("text_override") or "").strip()

    if text:
        return Response({
            "transcript": text,
            "detected_language": "English",
            "confidence": 0.98,
            "provider_mode": "deepgram" if settings.STT_PROVIDER != "mock" else "mock"
        })

    res = stt_service.transcribe(b"")
    return Response(res)

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def deepgram_key_view(request):
    if request.method == 'GET':
        key = os.getenv("DEEPGRAM_API_KEY", "23dae82420be843b3b183028b35162dfca167b8c").strip()
        return Response({"key": key, "status": "active" if bool(key) else "missing"})
    else:
        data = request.data or {}
        key = (data.get("key") or "").strip()
        os.environ["DEEPGRAM_API_KEY"] = key
        return Response({"key": key, "status": "updated"})

@api_view(['POST'])
@permission_classes([AllowAny])
def translate_and_adapt_view(request):
    data = request.data or {}
    text = (data.get("text") or "").strip()
    if not text:
        return Response({"detail": "Empty text provided."}, status=status.HTTP_400_BAD_REQUEST)

    src = data.get("source_language") or data.get("source_lang") or "English"
    tgt = data.get("target_language") or data.get("target_lang") or "Odia"
    grade = data.get("grade", "Class 3")
    subject = data.get("subject", "Science")
    topic = data.get("topic", "Lesson")

    detected = translation_service.detect_language(text)
    trans_res = translation_service.translate(text, src, tgt)
    direct_trans = trans_res["translated_text"]
    ped_result = pedagogy_service.adapt(text, grade, subject, tgt)
    rag_res = rag_engine.query(text, grade, subject, tgt)

    try:
        LessonRecord.objects.create(
            title=topic or "Lesson",
            grade=grade,
            subject=subject,
            source_lang=src,
            target_lang=tgt
        )
    except Exception as e:
        print("Database save notice:", e)

    return Response({
        "source_text": text,
        "detected_lang": detected,
        "direct_translation": direct_trans,
        "pedagogical_adaptation": ped_result["pedagogical_adaptation"],
        "key_points": ped_result["key_points"],
        "rag_source": rag_res["source"],
        "audio_script": ped_result["pedagogical_adaptation"]
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def speech_to_text_view(request):
    file_obj = request.FILES.get("file")
    if not file_obj:
        return Response({"detail": "Empty audio file uploaded."}, status=status.HTTP_400_BAD_REQUEST)

    audio_bytes = file_obj.read()
    if not audio_bytes:
        return Response({"detail": "Empty audio file uploaded."}, status=status.HTTP_400_BAD_REQUEST)

    res = stt_service.transcribe(audio_bytes, content_type=file_obj.content_type or "audio/webm")
    return Response({
        "transcript": res["transcript"],
        "detected_language": res["detected_language"],
        "confidence": res["confidence"]
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def query_rag_view(request):
    data = request.data or {}
    query = data.get("query", "")
    grade = data.get("grade", "Class 3")
    subject = data.get("subject", "Science")
    lang = data.get("lang", "Odia")

    tutor_res = llm_service.tutor_respond(query=query, grade=grade, subject=subject, language_override=lang)
    rag_res = rag_engine.query(query, grade, subject, lang)
    
    answer = tutor_res.get("response") or rag_res.get("answer")

    return Response({
        "answer": answer,
        "source": rag_res.get("source", f"{grade} {subject}"),
        "confidence_score": tutor_res.get("confidence_score", 0.95),
        "detected_language": tutor_res.get("detected_language", lang),
        "key_points": tutor_res.get("key_points", []),
        "example": tutor_res.get("example", ""),
        "follow_up_question": tutor_res.get("follow_up_question", "")
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def upload_document_view(request):
    file_obj = request.FILES.get("file")
    filename = file_obj.name if file_obj else "Uploaded Document.pdf"
    grade = request.POST.get("grade", "Class 3")
    subject = request.POST.get("subject", "Science")
    lang = request.POST.get("lang", "Odia")

    text_content = ""
    if file_obj:
        content = file_obj.read()
        text_content = content.decode("utf-8", errors="ignore") or f"Textbook content from {filename}"
    else:
        text_content = f"Textbook content from {filename}"

    res = rag_engine.add_document(filename, text_content, grade, subject, lang)

    try:
        CurriculumDoc.objects.create(
            name=filename,
            grade=grade,
            subject=subject,
            lang=lang,
            status="Ready",
            num_chunks=res.get("num_chunks", 12)
        )
    except Exception as e:
        print("Database save notice:", e)

    return Response(res)

@api_view(['POST'])
@permission_classes([AllowAny])
def generate_quiz_view(request):
    data = request.data or {}
    topic = data.get("topic", "Water Cycle")
    grade = data.get("grade", "Class 3")
    subject = data.get("subject", "Science")
    target_lang = data.get("target_lang", "Odia")
    num_questions = int(data.get("num_questions", 3))

    res = quiz_service.generate(topic, grade, subject, target_lang, num_questions)
    return Response(res)

@api_view(['POST'])
@permission_classes([AllowAny])
def evaluate_quiz_view(request):
    data = request.data or {}
    quiz_id = data.get("quiz_id", "quiz_wc_001")
    raw_answers = data.get("answers", [])
    answers_dict = []
    for a in raw_answers:
        if isinstance(a, dict):
            answers_dict.append({"question_id": a.get("question_id"), "selected_key": a.get("selected_key")})

    res = quiz_service.evaluate(quiz_id, answers_dict)

    try:
        QuizResultRecord.objects.create(
            topic="Water Cycle",
            score=res.get("score", 0),
            total=res.get("total", 0),
            percentage=res.get("percentage", 0.0)
        )
    except Exception as e:
        print("Database save notice:", e)

    return Response(res)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_analytics_view(request):
    return Response({
        "total_lessons": 12,
        "total_students": 35,
        "avg_accuracy": 84.0,
        "language_breakdown": {"Odia": 60, "Hindi": 25, "English": 15},
        "recent_activity": [
            {
                "id": 1,
                "title": "Water Cycle lesson conducted for Class 3 Science",
                "target_lang": "Odia",
                "accuracy": 92,
                "date": "20 May 2025 - 10:30 AM"
            }
        ]
    })

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def lessons_view(request):
    if request.method == 'GET':
        lessons = LessonRecord.objects.all().order_by('-created_at')
        if not lessons.exists():
            defaults = [
                {"title": "Water Cycle", "subject": "Science", "grade": "Class 3", "source_lang": "English", "target_lang": "Odia"},
                {"title": "Plants and Their Parts", "subject": "Science", "grade": "Class 3", "source_lang": "English", "target_lang": "Odia"},
                {"title": "Animals Around Us", "subject": "Science", "grade": "Class 3", "source_lang": "English", "target_lang": "Odia"},
                {"title": "Our Environment", "subject": "Science", "grade": "Class 3", "source_lang": "English", "target_lang": "Odia"}
            ]
            for item in defaults:
                LessonRecord.objects.create(**item)
            lessons = LessonRecord.objects.all().order_by('-created_at')
        res = []
        for l in lessons:
            res.append({
                "id": l.id,
                "title": l.title,
                "topic": l.subject,
                "grade": l.grade,
                "subject": l.subject,
                "source": l.source_lang,
                "target": l.target_lang,
                "source_lang": l.source_lang,
                "target_lang": l.target_lang,
                "date": l.created_at.strftime("%d %b %Y") if l.created_at else "Today"
            })
        return Response(res)
    elif request.method == 'POST':
        data = request.data or {}
        title = data.get("topic") or data.get("title") or "Lesson"
        grade = data.get("grade", "Class 3")
        subject = data.get("subject", "Science")
        source_lang = data.get("source_lang") or data.get("source") or "English"
        target_lang = data.get("target_lang") or data.get("target") or "Odia"
        lesson = LessonRecord.objects.create(
            title=title,
            grade=grade,
            subject=subject,
            source_lang=source_lang,
            target_lang=target_lang
        )
        return Response({
            "id": lesson.id,
            "title": lesson.title,
            "topic": lesson.subject,
            "grade": lesson.grade,
            "subject": lesson.subject,
            "source": lesson.source_lang,
            "target": lesson.target_lang,
            "source_lang": lesson.source_lang,
            "target_lang": lesson.target_lang,
            "date": lesson.created_at.strftime("%d %b %Y") if lesson.created_at else "Today"
        }, status=status.HTTP_201_CREATED)

