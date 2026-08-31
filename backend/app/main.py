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
