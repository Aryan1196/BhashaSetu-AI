"""
BhashaSetu AI - Full End-to-End Integration Test
Tests the complete workflow from Teacher Dashboard through Quiz Results.
"""
import json
import sys
import os
import django

# Ensure root workspace is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.bhashasetu_backend.settings")
django.setup()

from django.test import Client

# Fix Windows console encoding for Odia/Unicode output
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

django_client = Client()
results = {}

def execute_test_step(step_num, description, method, endpoint, payload=None, expected_status=200):
    path = f"/api{endpoint}"
    print(f"\n{'='*60}")
    print(f"Step {step_num}: {description}")
    print(f"  {method} {path}")
    
    if method == "GET":
        r = django_client.get(path)
    else:
        r = django_client.post(path, data=json.dumps(payload) if payload else "", content_type="application/json")
        
    status_code = r.status_code
    data = r.json()
        
    status = "PASS" if status_code == expected_status else "FAIL"
    print(f"  Status: {status_code} [{status}]")
    
    if data and isinstance(data, dict):
        for key in list(data.keys())[:6]:
            val = str(data[key])[:100]
            print(f"    {key}: {val}")
        
        if "provider_mode" in data:
            print(f"  >> Provider Mode: {data['provider_mode']}")
        if "is_development_fallback" in data:
            print(f"  >> Development Fallback: {data['is_development_fallback']}")
    
    results[step_num] = {"status": status_code, "pass": status_code == expected_status, "data": data}
    return data

def run_all_steps():
    print("=" * 60)
    print("BhashaSetu AI - Complete E2E Integration Test (Django)")
    print("=" * 60)

    # Step 1: Health Check
    health = execute_test_step(1, "Backend Health Check", "GET", "/health")

    # Step 5: Speech-to-Text
    stt = execute_test_step(5, "Speech-to-Text (STT)", "POST", "/speech/transcribe", {
        "text_override": "Today we are going to learn about the water cycle.",
        "source_lang": "English"
    })
    transcript = stt.get("transcript", "") if stt else "Today we are going to learn about the water cycle."

    # Step 6: Language Detection (embedded)
    if stt:
        print(f"\n  >> Detected Language from STT: {stt.get('detected_language', 'N/A')}")
        print(f"  >> Confidence: {stt.get('confidence', 'N/A')}")

    # Step 7: Translation
    trans = execute_test_step(7, "Translation (English -> Odia)", "POST", "/translation/translate", {
        "text": transcript,
        "source_language": "English",
        "target_language": "Odia"
    })

    # Step 8: Pedagogical Engine
    ped = execute_test_step(8, "Pedagogical Adaptation (Class 3 Science)", "POST", "/pedagogy/explain", {
        "text": transcript,
        "grade": 3,
        "subject": "Science",
        "language": "Odia"
    })

    # Step 9: TTS - Teacher plays adapted explanation
    tts_text = ped.get("simple_explanation", "Test text for TTS") if ped else "Test text for TTS"
    tts = execute_test_step(9, "Text-to-Speech (TTS) - Play adapted explanation", "POST", "/speech/synthesize", {
        "text": tts_text,
        "language": "Odia"
    })

    # Step 10: Full pipeline translate (includes RAG)
    pipeline = execute_test_step(10, "Full Pipeline: STT + Translate + Pedagogy + RAG", "POST", "/v1/translate", {
        "text": transcript,
        "source_lang": "English",
        "target_lang": "Odia",
        "grade": "Class 3",
        "subject": "Science",
        "topic": "Water Cycle"
    })

    # Step 12-14: Student asks AI Tutor (RAG query + Pedagogy)
    rag = execute_test_step(12, "Student RAG Query: 'Why does water evaporate?'", "POST", "/rag/query", {
        "query": "Why does water evaporate?",
        "grade": "Class 3",
        "subject": "Science",
        "lang": "Odia"
    })

    rag_answer = rag.get("answer", "Water evaporates due to heat.") if rag else "Water evaporates due to heat."
    ped2 = execute_test_step(13, "Pedagogy Explanation for student answer", "POST", "/pedagogy/explain", {
        "text": rag_answer,
        "grade": 3,
        "subject": "Science",
        "language": "Odia"
    })

    # Step 15: Student TTS
    student_tts_text = ped2.get("simple_explanation", "Test text") if ped2 else "Test text"
    student_tts = execute_test_step(15, "Student TTS - Listen to answer", "POST", "/speech/synthesize", {
        "text": student_tts_text,
        "language": "Odia"
    })

    # Step 17: Quiz Generation
    quiz = execute_test_step(17, "Quiz Generation (3 questions)", "POST", "/quiz/generate", {
        "topic": "Water Cycle",
        "grade": "Class 3",
        "subject": "Science",
        "target_lang": "Odia",
        "num_questions": 3
    })

    # Step 18: Student answers
    quiz_id = quiz.get("quiz_id", "quiz_wc_001") if quiz else "quiz_wc_001"
    answers = [
        {"question_id": 1, "selected_key": "A"},
        {"question_id": 2, "selected_key": "B"},
        {"question_id": 3, "selected_key": "A"}
    ]

    # Step 19-20: Quiz Evaluation
    result = execute_test_step(19, "Quiz Evaluation (score calculation)", "POST", "/quiz/evaluate", {
        "quiz_id": quiz_id,
        "answers": answers
    })

    print("\n" + "=" * 60)
    print("E2E INTEGRATION TEST SUMMARY")
    print("=" * 60)

    step_names = {
        1: "Health Check",
        5: "Speech-to-Text",
        7: "Translation",
        8: "Pedagogical Adaptation",
        9: "TTS Synthesis",
        10: "Full Pipeline",
        12: "RAG Query",
        13: "Student Pedagogy",
        15: "Student TTS",
        17: "Quiz Generation",
        19: "Quiz Evaluation",
    }

    passed = 0
    for num in [1, 5, 7, 8, 9, 10, 12, 13, 15, 17, 19]:
        r = results.get(num, {})
        status = "PASS" if r.get("pass") else "FAIL"
        mock = ""
        data = r.get("data")
        if data and isinstance(data, dict):
            if data.get("is_development_fallback") or data.get("provider_mode") == "mock":
                mock = " [MOCK/DEV MODE]"
        if r.get("pass"):
            passed += 1
        print(f"  Step {num:2d}: {step_names[num]:30s} {status}{mock}")

    total = len(step_names)
    print(f"\n  Result: {passed}/{total} steps passed")

    if result:
        print(f"  Final Quiz Score: {result.get('score', '?')}/{result.get('total', '?')} ({result.get('percentage', '?')}%)")
        print(f"  Feedback: {result.get('feedback', 'N/A')}")
    else:
        print("  Final Quiz Score: Could not retrieve")

    if passed == total:
        print("\n  ALL STEPS PASSED!")
        sys.exit(0)
    else:
        print(f"\n  {total - passed} step(s) need attention.")
        sys.exit(1)

if __name__ == "__main__":
    run_all_steps()
