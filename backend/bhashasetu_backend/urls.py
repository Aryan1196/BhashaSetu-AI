from django.contrib import admin
from django.urls import path, include, re_path
from backend.app.views import root_view

urlpatterns = [
    path('', root_view, name='root'),
    path('admin/', admin.site.urls),
    re_path(r'^api/v1/', include('backend.app.urls')),
    re_path(r'^api/', include('backend.app.urls')),
]
