import logging
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.api.endpoints import router as api_router
from backend.app.core.database import engine, Base

# Structured Logging Configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s"
)
logger = logging.getLogger("bhashasetu-backend")

# Create DB tables
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database initialized successfully.")
except Exception as e:
    logger.error(f"Database initialization warning: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Logging Middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = round((time.time() - start_time) * 1000, 2)
    logger.info(f"{request.method} {request.url.path} | Status: {response.status_code} | Duration: {duration}ms")
    return response

# Foundation Health endpoint
@app.get("/api/health")
def foundation_health():
    return {
        "status": "ok",
        "service": "bhashasetu-ai"
    }

# App root route
@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "status": "ok",
        "service": "bhashasetu-ai",
        "health": "/api/health",
        "docs": "/docs"
    }

# Mount API Router under both /api and /api/v1 for maximum compatibility
app.include_router(api_router, prefix="/api")
app.include_router(api_router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)


import io
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from deep_translator import GoogleTranslator
from gTTS import gTTS

app = FastAPI(title="English to Odia Translator & TTS API")

# Define the request body schema
class TranslationRequest(BaseModel):
    text: str

# Define response schema for text-only translations
class TranslationResponse(BaseModel):
    original_text: str
    translated_text: str


@app.post("/translate", response_model=TranslationResponse)
def translate_text(request: TranslationRequest):
    """
    Translates English text to Odia and returns JSON.
    """
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text input cannot be empty.")
    
    translated = GoogleTranslator(source="en", target="or").translate(request.text)
    
    return TranslationResponse(
        original_text=request.text,
        translated_text=translated
    )


@app.post("/translate-to-voice")
def translate_and_speak(request: TranslationRequest):
    """
    Translates English text to Odia and returns an MP3 audio stream.
    """
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text input cannot be empty.")
    
    # 1. Translate
    translated_text = GoogleTranslator(source="en", target="or").translate(request.text)
    
    # 2. Convert translated Odia text to audio stream in memory
    tts = gTTS(text=translated_text, lang="or")
    audio_bytes = io.BytesIO()
    tts.write_to_fp(audio_bytes)
    audio_bytes.seek(0)
    
    # 3. Stream MP3 response back to client
    return StreamingResponse(
        audio_bytes, 
        media_type="audio/mpeg",
        headers={"Content-Disposition": "inline; filename=odia_audio.mp3"}
    )