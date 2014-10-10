from tastypie.resources import ModelResource
from tastypie import fields
from dao.models import Account, User, Device, Fleet, Journey, Position, Log
from tastypie.paginator import Paginator
from auth import AppAuthentication, AppAuthorization


class AccountResource(ModelResource):

    class Meta:
        queryset = Account.objects.all()
        resource_name = 'account'
        authentication = AppAuthentication()
        authorization = AppAuthorization()


class UserResource(ModelResource):
    email = fields.CharField(readonly=True, )

    class Meta:
        queryset = User.objects.all()
        resource_name = 'user'
        paginator_class = Paginator
        authentication = AppAuthentication()
        authorization = AppAuthorization()


class DeviceResource(ModelResource):

    class Meta:
        queryset = Device.objects.all()
        resource_name = 'device'
        paginator_class = Paginator
        authentication = AppAuthentication()
        authorization = AppAuthorization()


class FleetResource(ModelResource):

    class Meta:
        queryset = Fleet.objects.all()
        resource_name = 'fleet'
        paginator_class = Paginator
        authentication = AppAuthentication()
        authorization = AppAuthorization()


class JourneyResource(ModelResource):

    class Meta:
        queryset = Journey.objects.all()
        resource_name = 'journey'
        paginator_class = Paginator
        authentication = AppAuthentication()
        authorization = AppAuthorization()
        filtering = {
            'start_timestamp': ['gte'],
            'stop_timestamp': ['lte'],
        }


class PositionResource(ModelResource):

    class Meta:
        queryset = Position.objects.all()
        resource_name = 'position'
        paginator_class = Paginator
        authentication = AppAuthentication()
        authorization = AppAuthorization()
        filtering = {
            'timestamp': ['gte', 'lte'],
        }


class LogResource(ModelResource):

    class Meta:
        queryset = Log.objects.all()
        resource_name = 'log'
        paginator_class = Paginator
        authentication = AppAuthentication()
        authorization = AppAuthorization()
        filtering = {
            'timestamp': ['gte', 'lte'],
        }