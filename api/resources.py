from django.conf import settings
from tastypie.resources import ModelResource
from tastypie import fields
from dao.models import Account, User, Device, Fleet, Journey, Position, Log
from tastypie.paginator import Paginator
from auth import AppAuthentication, AppAuthorization

authentication = AppAuthentication(settings.DIGEST_AUTH_CUSTOM_HEADER)
authorization = AppAuthorization()


class AccountResource(ModelResource):

    class Meta:
        queryset = Account.objects.all()
        resource_name = 'account'
        authentication = authentication
        authorization = authorization
        excludes = ['password']


class UserResource(ModelResource):
    email = fields.CharField(readonly=True, )

    class Meta:
        queryset = User.objects.all()
        resource_name = 'user'
        paginator_class = Paginator
        excludes = ['password']
        authentication = authentication
        authorization = authorization


class DeviceResource(ModelResource):

    class Meta:
        queryset = Device.objects.all()
        resource_name = 'device'
        paginator_class = Paginator
        authentication = authentication
        authorization = authorization


class FleetResource(ModelResource):

    class Meta:
        queryset = Fleet.objects.all()
        resource_name = 'fleet'
        paginator_class = Paginator
        authentication = authentication
        authorization = authorization


class JourneyResource(ModelResource):

    class Meta:
        queryset = Journey.objects.all()
        resource_name = 'journey'
        paginator_class = Paginator
        authentication = authentication
        authorization = authorization
        filtering = {
            'start_timestamp': ['gte'],
            'stop_timestamp': ['lte'],
        }


class PositionResource(ModelResource):

    class Meta:
        queryset = Position.objects.all()
        resource_name = 'position'
        paginator_class = Paginator
        authentication = authentication
        authorization = authorization
        filtering = {
            'timestamp': ['gte', 'lte'],
        }


class LogResource(ModelResource):

    class Meta:
        queryset = Log.objects.all()
        resource_name = 'log'
        paginator_class = Paginator
        authentication = authentication
        authorization = authorization
        filtering = {
            'timestamp': ['gte', 'lte'],
        }