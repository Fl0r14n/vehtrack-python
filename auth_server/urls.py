from django.conf.urls import include, url

from views import self_account

urlpatterns = [
    url('^accounts/', include('django.contrib.auth.urls', namespace='django_auth')),
    url(r'^o/', include('oauth2_provider.urls', namespace='oauth2_provider')),
    url('^accounts/me/$', self_account, name='self_account')
]
