# BhashaSetu AI - API Contracts Specification

**Version**: 1.0.0  
**Base URL**: `http://localhost:8000/api/v1`

---

## 1. Translation & Pedagogy Endpoints

### `POST /api/v1/translate`
Processes teacher speech/text, performs language detection, direct translation, grade-aware pedagogical simplification, and RAG document grounding.

**Request Body**:
```json
{
  "text": "Today we are going to learn about the water cycle.",
  "source_lang": "English",
  "target_lang": "Odia",
  "grade": "Class 3",
  "subject": "Science",
  "topic": "Water Cycle"
}
```

**Response Body (200 OK)**:
```json
{
  "source_text": "Today we are going to learn about the water cycle.",
  "detected_lang": "English",
  "direct_translation": "ଆଜି ଆମେ ପାଣି ଚକ୍ର ବିଷୟରେ ଶିଖିବାକୁ ଯାଉଛୁ ।",
  "pedagogical_adaptation": "ସୂର୍ଯ୍ୟଙ୍କ ତାପରେ ପାଣି ଗରମ ହୋଇ ବାଷ୍ପ ପାଲଟିଯାଏ । ଏହାକୁ ଆମେ ବାଷ୍ପୀଭବନ ବୋଲି କୁହାଯାଏ ।",
  "key_points": [
    "Sun heats water and changes it into water vapour.",
    "Evaporation forms clouds which result in rain."
  ],
  "rag_source": "Class 3 Science - Water Cycle (Page 2)",
  "audio_script": "ସୂର୍ଯ୍ୟଙ୍କ ତାପରେ ପାଣି ଗରମ ହୋଇ ବାଷ୍ପ ପାଲଟିଯାଏ ।"
}
```

---

## 2. Speech Processing Endpoints

### `POST /api/v1/speech/stt`
Converts input audio stream into text and detects spoken language.

**Request**: Multipart form data with `file` (WAV/MP3/WEBM).

**Response Body (200 OK)**:
```json
{
  "transcript": "Today we are going to learn about the water cycle.",
  "detected_language": "English",
  "confidence": 0.98
}
```

---

## 3. Curriculum RAG Endpoints

### `POST /api/v1/rag/upload`
Uploads a state textbook PDF document for RAG vector indexing.

**Request**: Multipart form data with `file`, `grade`, `subject`, `lang`.

**Response Body (200 OK)**:
```json
{
  "document_id": "doc_class3_sci_water",
  "name": "Class 3 Science Water Cycle.pdf",
  "grade": "Class 3",
  "subject": "Science",
  "lang": "Odia",
  "status": "Ready",
  "num_chunks": 14
}
```

### `POST /api/v1/rag/query`
Queries the vector database for textbook grounding.

**Request Body**:
```json
{
  "query": "ପାଣି କାହିଁକି ବାଷ୍ପୀଭବନ ହୁଏ ?",
  "grade": "Class 3",
  "subject": "Science",
  "lang": "Odia"
}
```

**Response Body (200 OK)**:
```json
{
  "answer": "ସୂର୍ଯ୍ୟଙ୍କ ତାପ ଯୋଗୁଁ ପାଣି ଗରମ ହୁଏ । ଗରମ ହେଲେ ପାଣି ଛୋଟ ଛୋଟ ବାଷ୍ପରେ ପରିଣତ ହୋଇ ଉପରକୁ ଉଠିଯାଏ ।",
  "source": "Class 3 Science - Water Cycle (Page 2)",
  "confidence_score": 0.94
}
```

---

## 4. Quiz Generation & Evaluation

### `POST /api/v1/quiz/generate`
Generates grade-appropriate vernacular assessment quizzes.

**Request Body**:
```json
{
  "topic": "Water Cycle",
  "grade": "Class 3",
  "subject": "Science",
  "target_lang": "Odia",
  "num_questions": 3
}
```

**Response Body (200 OK)**:
```json
{
  "quiz_id": "quiz_wc_001",
  "topic": "Water Cycle",
  "questions": [
    {
      "id": 1,
      "question": "ପାଣି କାହିଁକି ବାଷ୍ପୀଭବନ ହୁଏ ?",
      "translation": "Why does water evaporate?",
      "options": [
        { "key": "A", "text": "ସୂର୍ଯ୍ୟଙ୍କ ତାପଯୋଗୁଁ" },
        { "key": "B", "text": "ଥଣ୍ଡା ପବନ ଯୋଗୁଁ" },
        { "key": "C", "text": "ଗଛ ପାଇଁ" },
        { "key": "D", "text": "ରାତି ହେଲେ" }
      ]
    }
  ]
}
```

### `POST /api/v1/quiz/evaluate`
Evaluates student quiz submissions.

**Request Body**:
```json
{
  "quiz_id": "quiz_wc_001",
  "answers": [
    { "question_id": 1, "selected_key": "A" }
  ]
}
```

**Response Body (200 OK)**:
```json
{
  "score": 3,
  "total": 3,
  "percentage": 100.0,
  "feedback": "Great Job! 🎉 Excellent! Keep learning!"
}
```

---

## 5. Analytics & Health Endpoints

### `GET /api/v1/analytics/summary`
Returns dashboard statistics for teachers.

### `GET /api/v1/health`
Health check endpoint.
