from django.urls import re_path
from backend.app.consumers import LiveSTTConsumer

websocket_urlpatterns = [
    re_path(r'^api/speech/live-stt/?$', LiveSTTConsumer.as_asgi()),
    re_path(r'^api/v1/speech/live-stt/?$', LiveSTTConsumer.as_asgi()),
]
