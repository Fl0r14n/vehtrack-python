import json
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.conf import settings
from django.http import HttpResponse
from django.core.serializers.json import DjangoJSONEncoder
from api.auth import AppAuthentication


def index(request):
    return render_to_response('index.html', {'DEBUG': settings.DEBUG}, RequestContext(request))

auth = AppAuthentication('-Vehtrack')


def login(request):
    response = auth.is_authenticated(request)
    if response is True:
        return render_json({'email': True})
    elif response is False:
        return render_json({'disabled': True}, 403)
    else:
        return response


def logout(request):
    return auth.logout()


def register(request):
    return render_json({}, 404)


def render_json(data_dict, status_code=200):
    if isinstance(data_dict, dict):
        data_dict = json.dumps(data_dict, cls=DjangoJSONEncoder)
    return HttpResponse(data_dict, content_type="application/json", status=status_code)
