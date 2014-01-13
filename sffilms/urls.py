from django.conf.urls import patterns, include, url
from django.conf import settings
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.conf.urls.static import static

from django.contrib import admin
admin.autodiscover()

from sffilms import views

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'sffilms.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^admin/', include(admin.site.urls)),
    url(r'^films/', views.home, name='home')
) + static("/static/", document_root=settings.MEDIA_ROOT)
urlpatterns += staticfiles_urlpatterns()
