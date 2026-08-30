import os

class Settings:
    PROJECT_NAME: str = "BhashaSetu AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./bhashasetu.db")
    
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "mock")
    STT_PROVIDER: str = os.getenv("STT_PROVIDER", "mock")
    TTS_PROVIDER: str = os.getenv("TTS_PROVIDER", "mock")
    TRANSLATION_PROVIDER: str = os.getenv("TRANSLATION_PROVIDER", "mock")
    
    CHROMA_PERSIST_DIR: str = os.getenv("CHROMA_PERSIST_DIR", "./data/chroma_db")

settings = Settings()
