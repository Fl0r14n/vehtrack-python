from django.http import HttpResponse, HttpResponseBadRequest, JsonResponse
from django.views.generic import View
from django.views.decorators.csrf import csrf_exempt
from auth_server.views import role_check
from django.utils.decorators import method_decorator
from dao.models import Device, User, Fleet
import json

class FleetView(View):

    def post(self, request, *args, **kwargs):
        # add fleet
        j_request = json.loads(request.body)
        if set(('parent', 'name')) <= set(j_request):
            try:
                fleet = Fleet.objects.get(id=j_request['parent'])
                child_fleet = fleet.children.create(name=j_request['name'])
                return JsonResponse({
                    'id': child_fleet.id,
                    'label': child_fleet.name
                }, status=201)
            except Fleet.DoesNotExist:
                return HttpResponse(status=410)
        return HttpResponseBadRequest()

    def put(self, request, id, *args, **kwargs):
        # edit fleet
        try:
            fleet = Fleet.objects.get(id=id)
            j_request = json.loads(request.body)
            if 'label' in j_request:
                fleet.name = j_request['label']
                fleet.save()
                return HttpResponse(status=204)
        except Fleet.DoesNotExist:
            return HttpResponse(status=410)
        return HttpResponseBadRequest()

    def delete(self, request, id, *args, **kwargs):
        # remove fleet
        try:
            fleet = Fleet.objects.get(id=id)
            fleet.delete()
            return HttpResponse(status=204)
        except Fleet.DoesNotExist:
            return HttpResponse(status=410)
        return HttpResponseBadRequest()

    @method_decorator(csrf_exempt)
    @method_decorator(role_check(('FLEET_ADMIN', 'ADMIN')))
    def dispatch(self, *args, **kwargs):
        return super(FleetView, self).dispatch(*args, **kwargs)

class FleetUserView(View):

    def post(self, request, id, *args, **kwargs):
        # add user to fleet
        try:
            fleet = Fleet.objects.get(id=id)
            if 'email' in kwargs:
                User.objects.get(email=kwargs['email']).fleets.add(fleet)
                return HttpResponse(status=201)
        except Fleet.DoesNotExist, User.DoesNotExist:
            return HttpResponse(status=410)
        return HttpResponseBadRequest()

    def delete(self, request, id, email, *args, **kwargs):
        # remove user from fleet
        try:
            fleet = Fleet.objects.get(id=id)
            User.objects.get(email=email).fleets.remove(fleet)
            return HttpResponse(status=204)
        except Fleet.DoesNotExist, User.DoesNotExist:
            return HttpResponse(status=410)

    @method_decorator(csrf_exempt)
    @method_decorator(role_check(('FLEET_ADMIN', 'ADMIN')))
    def dispatch(self, *args, **kwargs):
        return super(FleetUserView, self).dispatch(*args, **kwargs)

class FleetDeviceView(View):

    def post(self, request, id, *args, **kwargs):
        # add device to fleet
        try:
            fleet = Fleet.objects.get(id=id)
            if 'email' in kwargs:
                Device.objects.get(email=kwargs['email']).fleets.add(fleet)
                return HttpResponse(status=201)
        except Fleet.DoesNotExist, Device.DoesNotExist:
            return HttpResponse(status=410)
        return HttpResponseBadRequest()

    def delete(self, request, id, email, *args, **kwargs):
        # remove device from fleet
        try:
            fleet = Fleet.objects.get(id=id)
            Device.objects.get(email=email).fleets.remove(fleet)
            return HttpResponse(status=204)
        except Fleet.DoesNotExist, Device.DoesNotExist:
            return HttpResponse(status=410)

    @method_decorator(csrf_exempt)
    @method_decorator(role_check(('FLEET_ADMIN', 'ADMIN')))
    def dispatch(self, *args, **kwargs):
        return super(FleetDeviceView, self).dispatch(*args, **kwargs)
