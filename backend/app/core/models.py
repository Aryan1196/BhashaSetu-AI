from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from backend.app.core.database import Base

class LessonRecord(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    grade = Column(String, default="Class 3")
    subject = Column(String, default="Science")
    source_lang = Column(String, default="English")
    target_lang = Column(String, default="Odia")
    created_at = Column(DateTime, default=datetime.utcnow)

class CurriculumDoc(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    grade = Column(String, default="Class 3")
    subject = Column(String, default="Science")
    lang = Column(String, default="Odia")
    status = Column(String, default="Ready")
    num_chunks = Column(Integer, default=12)
    created_at = Column(DateTime, default=datetime.utcnow)

class QuizResultRecord(Base):
    __tablename__ = "quiz_results"

    id = Column(Integer, primary_key=True, index=True)
    topic = Column(String, default="Water Cycle")
    score = Column(Integer, default=3)
    total = Column(Integer, default=3)
    percentage = Column(Float, default=100.0)
    created_at = Column(DateTime, default=datetime.utcnow)
