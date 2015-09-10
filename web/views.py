from django.conf import settings
from django.core.urlresolvers import reverse
from django.shortcuts import render_to_response
from django.template import RequestContext
from oauth2_provider.models import Application

def index(request):
    app = Application.objects.get(name='vehtrack')
    http_host = 'http{}://{}'.format('s' if request.is_secure() else '', request.META['HTTP_HOST'])
    return render_to_response('index.html', {
                              'DEBUG': settings.DEBUG,
                              'http_host': http_host,
                              'client_id': app.client_id if app else None,
                              'auth_path': reverse('oauth2_provider:authorize'),
                              'logout_path': reverse('django_auth:logout'),
                              'revoke_token_path': reverse('oauth2_provider:revoke-token'),
                              'profile_uri': '{}{}'.format(http_host, reverse('self_account')),
                              }, RequestContext(request))
