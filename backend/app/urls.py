from django.urls import path, re_path
from backend.app import views

urlpatterns = [
    re_path(r'^$', views.root_view, name='api_root'),
    re_path(r'^health/?$', views.health_check_view, name='health'),
    re_path(r'^foundation/health/?$', views.foundation_health_view, name='foundation_health'),
    re_path(r'^speech/synthesize/?$', views.speech_synthesize_view, name='speech_synthesize'),
    re_path(r'^pedagogy/explain/?$', views.pedagogy_explain_view, name='pedagogy_explain'),
    re_path(r'^translation/translate/?$', views.translate_text_view, name='translate_text'),
    re_path(r'^speech/transcribe/?$', views.speech_transcribe_view, name='speech_transcribe'),
    re_path(r'^speech/deepgram-key/?$', views.deepgram_key_view, name='deepgram_key'),
    re_path(r'^speech/stt/?$', views.speech_to_text_view, name='speech_stt'),
    re_path(r'^ai/respond/?$', views.ai_respond_view, name='ai_respond'),
    re_path(r'^ai/tutor/?$', views.ai_tutor_view, name='ai_tutor'),
    re_path(r'^ai/llm-key/?$', views.llm_key_view, name='llm_key'),
    re_path(r'^v1/ai/respond/?$', views.ai_respond_view, name='ai_respond_v1'),
    re_path(r'^v1/ai/tutor/?$', views.ai_tutor_view, name='ai_tutor_v1'),
    re_path(r'^translate/?$', views.translate_and_adapt_view, name='translate_and_adapt'),
    re_path(r'^v1/translate/?$', views.translate_and_adapt_view, name='translate_and_adapt_v1'),
    re_path(r'^rag/query/?$', views.query_rag_view, name='query_rag'),
    re_path(r'^rag/upload/?$', views.upload_document_view, name='upload_document'),
    re_path(r'^quiz/generate/?$', views.generate_quiz_view, name='generate_quiz'),
    re_path(r'^quiz/evaluate/?$', views.evaluate_quiz_view, name='evaluate_quiz'),
    re_path(r'^analytics/summary/?$', views.get_analytics_view, name='analytics_summary'),
]
