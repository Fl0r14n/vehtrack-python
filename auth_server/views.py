from django.http import HttpResponse, HttpResponseForbidden, HttpResponseNotAllowed
import json
from oauth2_provider.models import AccessToken
from django.utils import timezone

def oauth_check(view_function):
    def wrapper(request, *args, **kwargs):
        if 'HTTP_AUTHORIZATION' not in request.META:
            return HttpResponseForbidden()
        if 'Bearer' not in request.META.get('HTTP_AUTHORIZATION'):
            return HttpResponseForbidden('Missing Bearer from request.')
        token = request.META['HTTP_AUTHORIZATION'].split()[1]
        access_token = AccessToken.objects.filter(token=token).get()
        if access_token.expires < timezone.now():
            return HttpResponseForbidden('AccessToken has expired.')
        account = access_token.user
        kwargs['account'] = account
        return view_function(request, *args, **kwargs)
    return wrapper

def role_check(roles):
    def wrapper1(view_function):
        @oauth_check
        def wrapper2(request, *args, **kwargs):
            account = kwargs['account']
            if account.role.name not in roles:
                return HttpResponseNotAllowed('Insufficient rights')
            return view_function(request, *args, **kwargs)
        return wrapper2
    return wrapper1

@oauth_check
def self_account(request, *args, **kwargs):
    account = kwargs['account']
    return HttpResponse(json.dumps({
        'email': account.email,
        'is_active': account.is_active,
        'created': account.created.isoformat(),
        'is_admin': account.is_admin,
        'role': account.role.name,
        'last_login': account.last_login.isoformat(),
    }), content_type='application/json')



