import os

class Settings:
    PROJECT_NAME: str = "BhashaSetu AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    # Database & Vector Store
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./bhashasetu.db")
    VECTOR_DB_PATH: str = os.getenv("VECTOR_DB_PATH", "./data/chroma_db")
    
    # API Keys (Loaded from env)
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")
    TRANSLATION_API_KEY: str = os.getenv("TRANSLATION_API_KEY", "")
    SPEECH_API_KEY: str = os.getenv("SPEECH_API_KEY", "")
    
    # Provider choices
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "mock")
    STT_PROVIDER: str = os.getenv("STT_PROVIDER", "mock")
    TTS_PROVIDER: str = os.getenv("TTS_PROVIDER", "mock")
    TRANSLATION_PROVIDER: str = os.getenv("TRANSLATION_PROVIDER", "mock")

settings = Settings()
