from django.conf.urls import patterns, include, url
#from django.contrib import admin

from api.urls import urlpaterns as api_patterns
from web.urls import urlpaterns as web_patterns

#admin.autodiscover()

urlpatterns = patterns('',
    #url(r'^admin/', include(admin.site.urls)),
)

urlpatterns += api_patterns
urlpatterns += web_patterns