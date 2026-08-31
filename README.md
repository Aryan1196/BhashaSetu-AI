# ⚡ BhashaSetu AI (भाषासेतु AI)

**AI-Powered Vernacular Pedagogy and Real-Time Translation Tool for Mother Tongue-Based Primary Education**

> **Problem Statement ID**: SIH26042  
> **Organization**: Government of Jharkhand  
> **Theme**: Smart Education  

---

## 📌 Project Overview

BhashaSetu AI is an end-to-end full-stack educational technology platform engineered to bridge the linguistic gap in primary school classrooms across Jharkhand and India. The platform captures teacher speech, translates it into local mother-tongue languages (such as Odia, Santhali, Ho, Mundari, Hindi, etc.), adapts the explanations according to primary school grade levels (Class 1-5), grounds AI responses in official state curriculum textbooks using RAG (Retrieval-Augmented Generation), and automatically generates concept assessments.

---

## 🏛️ System Architecture & Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS (Government EdTech aesthetic)
- **Backend**: Python 3.10+, Django, Django REST Framework, Django Channels (ASGI WebSockets)
- **Speech Engine**: Deepgram Nova-2 Live WebSocket Streaming Speech-to-Text & Edge-TTS Neural Speech Synthesis
- **AI Abstraction Layer**: Modular interfaces for LLM, Translation, Speech-to-Text, and Text-to-Speech
- **RAG Engine**: Vector store retriever (ChromaDB / FAISS) with textbook PDF document chunking
- **Database**: Django ORM with SQLite (`bhashasetu.db`) and PostgreSQL support

---

## 📁 Repository Structure

```
BhashaSetu-AI/
├── frontend/               # React + TypeScript + Vite UI
├── backend/                # Django REST & Channels Application & AI Service Layer
├── rag/                    # Vector store, document processing & RAG engine
├── data/                   # State textbooks & vector DB storage
├── docs/                   # System Architecture & API Specifications
├── .env.example            # Environment configuration template
├── README.md               # Documentation
└── docker-compose.yml      # Orchestration config
```

---

## 🚀 Quick Start (Local Development)

### 1. Backend Setup (Django)

```bash
# Navigate to root and create virtual environment
python -m venv venv
venv\Scripts\activate  # Linux/Mac: source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Run migrations
python backend/manage.py migrate

# Start Django development server
python backend/manage.py runserver 8000
```
Backend API will be live at: `http://localhost:8000/api/health`

### 2. Frontend Setup (React TypeScript)

```bash
cd frontend
npm install
npm run dev
```
Frontend Web UI will be live at: `http://localhost:5173/`

---

## 📄 License
Government of Jharkhand - Smart Education Hackathon Project.
