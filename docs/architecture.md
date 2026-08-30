# BhashaSetu AI - System Architecture & Technical Specification

**Project**: SIH26042 — AI-Powered Vernacular Pedagogy and Real-Time Translation Tool for Mother Tongue-Based Primary Education  
**Organization**: Government of Jharkhand  
**Theme**: Smart Education  

---

## 1. Executive Overview

BhashaSetu AI is an end-to-end full-stack educational technology platform engineered to bridge the linguistic gap in primary school classrooms across Jharkhand and India. The platform captures teacher speech, translates it into local mother-tongue languages (such as Odia, Santhali, Ho, Mundari, Hindi, etc.), adapts the explanations according to primary school grade levels (Class 1-5), grounds AI responses in official state curriculum textbooks using RAG (Retrieval-Augmented Generation), and automatically generates concept assessments.

---

## 2. High-Level System Architecture

```
                                +-----------------------------------+
                                |     React + Vite + TypeScript     |
                                |     Frontend (Government UI)      |
                                +-----------------+-----------------+
                                                  |
                                                  | REST API (JSON / Multipart)
                                                  v
                                +-----------------+-----------------+
                                |         FastAPI Backend           |
                                |      (Python / Uvicorn)           |
                                +--------+----------------+---------+
                                         |                |
                +------------------------+                +-----------------------+
                |                                                                 |
                v                                                                 v
  +-------------+-------------+                                     +-------------+-------------+
  |    Modular AI Services    |                                     |    RAG & Vector Store     |
  | - Speech-to-Text (STT)    |                                     | - ChromaDB / FAISS        |
  | - Language Detection      |                                     | - SentenceTransformers /  |
  | - Vernacular Translation  |                                     |   Local Vector Retriever  |
  | - Grade-Aware Pedagogy    |                                     | - PDF Document Chunker    |
  | - Text-to-Speech (TTS)    |                                     +--------------+--------------+
  | - Quiz Generator/Evaluator|                                                    |
  +-------------+-------------+                                                    v
                |                                                   +--------------+--------------+
                v                                                   | State Textbook Documents    |
  +-------------+-------------+                                     | (Class 3 Science PDFs)      |
  | External & Local Provider |                                     +-----------------------------+
  | - OpenAI / Ollama / Groq  |
  | - IndicTrans / NLLB       |
  | - Web Speech / Edge-TTS   |
  +---------------------------+
```

---

## 3. Layered Architectural Separation

1. **UI Layer (`frontend/`)**: React 18 with TypeScript, Vite, Tailwind CSS. Strictly decoupled from AI logic; all state updates and AI actions consume backend endpoints via `src/api/client.ts`.
2. **API Layer (`backend/app/api/`)**: FastAPI routing layer providing clean Pydantic request/response payload validation.
3. **Business & Pedagogy Logic (`backend/app/services/`)**: Grade-specific prompt templates, pedagogical simplification engines, and quiz scoring algorithms.
4. **AI Service Abstraction (`backend/app/services/ai_interfaces.py`)**: Abstract interfaces (`STTProvider`, `TranslationProvider`, `LLMProvider`, `TTSProvider`) allowing zero-downtime swapping of AI engines (e.g. switching from OpenAI to local Ollama or HuggingFace IndicTrans).
5. **RAG Vector Layer (`rag/`)**: ChromaDB vector store with chunking, embedding generation, and textbook document grounding.
6. **Database Layer (`backend/app/core/database.py`)**: SQLAlchemy repository pattern providing SQLite support for local development with full migration compatibility for PostgreSQL.

---

## 4. Key Workflows

### Core Flow: Teacher Live Translation & Pedagogical Adaptation
1. Teacher speaks into microphone or uploads audio in Source Language (e.g., English).
2. STT service transcribes audio and identifies language.
3. Translation service translates source transcript to Target Vernacular (e.g., Odia / Santhali).
4. Pedagogy service rewrites explanation to Class-3 primary school level with analogies.
5. RAG engine checks state textbook embeddings for page citations.
6. TTS service generates audio playback stream for students.
7. Quiz generator automatically creates 3 multi-choice evaluation questions in the target language.

---

## 5. Security & Government Design Principles

- **Colors**: Deep Navy (`#0F172A`), Professional Blue (`#1E40AF`), Teal (`#0D9488`), Green (`#15803D`), Clean Slate (`#F8FAFC`).
- **Typography**: Inter (Body) & Outfit (Headings).
- **Design Ethics**: No neon gradients, no excessive animations, clean cards, high contrast, government EdTech aesthetic.
