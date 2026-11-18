from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import HttpResponse
from django.shortcuts import render
from django.urls import include, path, re_path
from django.views.generic import TemplateView


def spa_index(request):
    index_file = settings.BASE_DIR / "frontend" / "build" / "index.html"
    if index_file.exists():
        return HttpResponse(index_file.read_text(encoding="utf-8"))
    return render(request, "Home.html")


urlpatterns = [
    path("admin/", admin.site.urls),
    path("djangoapp/", include("djangoapp.urls")),
    path("about", TemplateView.as_view(template_name="About.html"), name="about"),
    path("contact", TemplateView.as_view(template_name="Contact.html"), name="contact"),
    re_path(r"^(?:login|register|dealers|dealer/\d+|postreview/\d+)/?$", spa_index),
    path("", spa_index, name="home"),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) + static("/frontend/", document_root=settings.BASE_DIR / "frontend" / "build")
