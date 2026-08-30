from typing import List, Dict, Any
from backend.app.services.ai_interfaces import BaseQuizProvider

QUIZ_DATABASE = {
    "Water Cycle": {
        "Odia": [
            {
                "id": 1,
                "question": "ପାଣି କାହିଁକି ବାଷ୍ପୀଭବନ ହୁଏ ?",
                "translation": "Why does water evaporate?",
                "options": [
                    {"key": "A", "text": "ସୂର୍ଯ୍ୟଙ୍କ ତାପଯୋଗୁଁ"},
                    {"key": "B", "text": "ଥଣ୍ଡା ପବନ ଯୋଗୁଁ"},
                    {"key": "C", "text": "ଗଛ ପାଇଁ"},
                    {"key": "D", "text": "ରାତି ହେଲେ"}
                ],
                "correct": "A"
            },
            {
                "id": 2,
                "question": "ବାଷ୍ପ ଉପରକୁ ଉଠି କ’ଣ ତିଆରି କରେ ?",
                "translation": "What does water vapour form when it rises up?",
                "options": [
                    {"key": "A", "text": "ପବନ"},
                    {"key": "B", "text": "ମେଘ"},
                    {"key": "C", "text": "ମାଟି"},
                    {"key": "D", "text": "ନଈ"}
                ],
                "correct": "B"
            },
            {
                "id": 3,
                "question": "ମେଘ ଥଣ୍ଡା ହେଲେ କ’ଣ ହୁଏ ?",
                "translation": "What happens when clouds cool down?",
                "options": [
                    {"key": "A", "text": "ବର୍ଷା ହୁଏ"},
                    {"key": "B", "text": "ଖରା ହୁଏ"},
                    {"key": "C", "text": "ରାତି ହୁଏ"},
                    {"key": "D", "text": "ପବନ ବନ୍ଦ ହୁଏ"}
                ],
                "correct": "A"
            }
        ]
    }
}

class QuizService(BaseQuizProvider):
    def generate(self, topic: str, grade: str, subject: str, target_lang: str, num_questions: int) -> Dict[str, Any]:
        topic_key = topic if topic in QUIZ_DATABASE else "Water Cycle"
        lang_key = target_lang if target_lang in QUIZ_DATABASE[topic_key] else "Odia"

        questions = QUIZ_DATABASE[topic_key][lang_key][:num_questions]

        # Return sanitized question list (omitting direct correct key field)
        public_questions = []
        for q in questions:
            public_questions.append({
                "id": q["id"],
                "question": q["question"],
                "translation": q["translation"],
                "options": q["options"]
            })

        return {
            "quiz_id": f"quiz_{topic_key.lower().replace(' ', '_')}_001",
            "topic": topic,
            "questions": public_questions
        }

    def evaluate(self, quiz_id: str, user_answers: List[Dict[str, Any]]) -> Dict[str, Any]:
        total = len(user_answers)
        correct_count = 0

        # Solution lookup
        answer_key = {1: "A", 2: "B", 3: "A"}

        for ans in user_answers:
            qid = ans.get("question_id")
            selected = ans.get("selected_key")
            if answer_key.get(qid) == selected:
                correct_count += 1

        pct = (correct_count / total * 100.0) if total > 0 else 100.0
        feedback = "Great Job! 🎉 Excellent! Keep learning!" if pct >= 80 else "Good effort! Keep practicing!"

        return {
            "score": correct_count,
            "total": total,
            "percentage": round(pct, 1),
            "feedback": feedback
        }

quiz_service = QuizService()
