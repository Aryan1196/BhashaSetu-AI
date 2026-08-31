# BhashaSetu AI - Pedagogical Adaptation Prompt Engineering Strategy

**Project**: BhashaSetu AI (SIH26042 - Government of Jharkhand)  
**Module**: Pedagogical Adaptation Engine  

---

## 1. Distinguishing Translation vs. Pedagogy

- **Translation**: Converts literal text from a source language to a target vernacular (e.g., English → Odia) preserving word structure.
- **Pedagogy**: Transforms educational concepts to be age-appropriate for primary school learners (Class 1 to 5). It simplifies sentence structures, introduces familiar everyday analogies, highlights key learning points, and presents engaging questions.

---

## 2. LLM System Prompt Construction

When delegating to an LLM provider (OpenAI / Groq / Ollama / Indic-LLM), the following system prompt instructions are enforced:

```markdown
You are BhashaSetu AI's Primary Pedagogy Specialist for the Government of Jharkhand Smart Education Initiative.

Your task is to take an educational explanation and adapt it for a Class {grade} primary school student learning in {language}.

EXPLICIT CONSTRAINTS & RULES:
1. AGE-APPROPRIATE VOCABULARY: Use simple, clear vocabulary suitable for a Class {grade} primary school student.
2. SIMPLIFY TERMINOLOGY: Avoid unnecessarily complex jargon without losing essential meaning.
3. PRESERVE FACTUAL INTEGRITY: Preserve exact factual meaning. Do NOT invent unverified facts.
4. CURRICULUM GROUNDING: Remain strictly aligned with the supplied textbook curriculum context.
5. VERNACULAR OUTPUT: Respond entirely in {language} (script: {script_name}).
6. CURRICULUM VS GENERAL DISTINCTION: Clearly distinguish between facts verified from the curriculum context and general explanations.

OUTPUT STRUCTURE (JSON format):
{
  "simple_explanation": "<Age-appropriate explanation in target language>",
  "key_points": ["<Key Point 1>", "<Key Point 2>"],
  "example": "<Real-world primary level example>",
  "learner_question": "<Engaging comprehension question for Class {grade}>"
}
```

---

## 3. Grade-Level Guidelines (Class 1 - 5)

| Grade | Sentence Structure | Concept Complexity | Vocabulary Constraint |
| :--- | :--- | :--- | :--- |
| **Class 1-2** | Ultra-short (3-5 words) | Single step visual concepts | Basic everyday objects (Sun, Water, Cloud) |
| **Class 3** | Short (6-10 words) | Two-step cause & effect (Heat → Evaporation) | Primary science terms with vernacular analogies |
| **Class 4-5** | Moderate (10-15 words) | Multi-stage cycles (Evaporation, Condensation) | Foundational scientific terms with clear definitions |

---

## 4. API Specification (`POST /api/pedagogy/explain`)

- **Endpoint**: `POST /api/pedagogy/explain`
- **Payload**:
  ```json
  {
    "text": "The sun heats water and causes evaporation.",
    "grade": 3,
    "subject": "Science",
    "language": "Odia"
  }
  ```
- **Response**:
  ```json
  {
    "simple_explanation": "ସୂର୍ଯ୍ୟଙ୍କ ତାପରେ ପାଣି ଗରମ ହୋଇ ବାଷ୍ପ ପାଲଟିଯାଏ । ଏହାକୁ ଆମେ ବାଷ୍ପୀଭବନ ବୋଲି କୁହାଯାଏ ।",
    "key_points": [
      "ସୂର୍ଯ୍ୟଙ୍କ ତାପ ଯୋଗୁଁ ପାଣି ଗରମ ହୁଏ ।",
      "ଗରମ ହେଲେ ପାଣି ବାଷ୍ପ ହୋଇ ଉପରକୁ ଉଠିଯାଏ ।"
    ],
    "example": "ଗରମ ଚା’ କପରୁ ଉପରକୁ ଉଠୁଥିବା ଧୂଆଁ ପରି ପାଣି ବାଷ୍ପ ହୁଏ ।",
    "learner_question": "ଖରାରେ ପାଣି ଥାଳି ରଖିଲେ ପାଣି କୁଆଡ଼େ ଯାଏ ?",
    "grade": 3,
    "subject": "Science",
    "language": "Odia",
    "provider_mode": "mock",
    "is_development_fallback": true
  }
  ```
