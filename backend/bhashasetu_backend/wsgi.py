import os
import sys

root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.bhashasetu_backend.settings')

from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()
