from django.conf.urls import include, patterns, url
from views import self_account

urlpatterns = patterns(
    '',
    url('^accounts/', include('django.contrib.auth.urls', namespace='django_auth')),
    url(r'^o/', include('oauth2_provider.urls', namespace='oauth2_provider')),
    url('^accounts/me/$', self_account, name='self_account')
)
