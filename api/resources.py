from tastypie.resources import ModelResource
from tastypie import fields
from dao.models import User, Device, Fleet, Journey, Position, Log
from tastypie.paginator import Paginator
from auth import OAuth20Authentication, VehtrackAuthorization
from tastypie.constants import ALL, ALL_WITH_RELATIONS

authentication = OAuth20Authentication()
authorization = VehtrackAuthorization()

class FleetResource(ModelResource):
    # not exposed as endpoint but needed for filtering

    class Meta:
        queryset = Fleet.objects.all()
        resource_name = 'fleet'
        paginator_class = Paginator
        filtering = {
            'id': ALL
        }
        authentication = authentication


class UserResource(ModelResource):
    email = fields.CharField('email', readonly=True,)
    fleets = fields.ToManyField(FleetResource, 'fleets', null=True)
    role = fields.CharField('role', readonly=True)

    class Meta:
        queryset = User.objects.all()
        resource_name = 'user'
        paginator_class = Paginator
        filtering = {
            'fleets': ALL_WITH_RELATIONS
        }
        excludes = ['password', 'is_admin']
        authentication = authentication
        authorization = authorization

    def dehydrate_fleets(self, bundle):

        def build_fleet_tree(children, recursive=True):
            data = []
            for child in children:
                child_o = {
                    'id': child.id,
                    'label': child.name,
                    'children': build_fleet_tree(child.get_children()) if recursive else []
                }
                data.append(child_o)
            return data

        role = bundle.request.user.role
        role = role.name if role else ''

        fleet_tree = build_fleet_tree(bundle.obj.fleets.all(),
                                      recursive=role in ('ADMIN', 'FLEET_ADMIN'))
        return fleet_tree

    def hydrate_fleets(self, bundle):
        del bundle.data['fleets']
        return bundle

    def save_m2m(self, bundle):
        # saving fleet structure not supported yet
        pass

    def dehydrate_role(self, bundle):
        return bundle.obj.role.name


class DeviceResource(ModelResource):
    fleets = fields.ToManyField(FleetResource, 'fleets', null=True)
    email = fields.CharField('email', readonly=True, )
    type = fields.CharField('type', readonly=True, )
    serial = fields.CharField('serial', readonly=True, )
    is_active = fields.CharField('is_active', readonly=True, )

    class Meta:
        queryset = Device.objects.all()
        resource_name = 'device'
        paginator_class = Paginator
        excludes = ['password', 'is_admin', 'last_login', 'imei', 'imsi', 'msisdn', 'phone', ]
        filtering = {
            'serial': ALL,
            'fleets': ALL_WITH_RELATIONS
        }
        authentication = authentication
        authorization = authorization

    def dehydrate(self, bundle):
        # does not work from excludes
        del bundle.data['fleets']
        return bundle

    def save_m2m(self, bundle):
        # do not hydrate fleets cuz of no endpoint but we need it for filtering
        pass


class JourneyResource(ModelResource):

    device = fields.ForeignKey(DeviceResource, 'device')

    class Meta:
        queryset = Journey.objects.all()
        resource_name = 'journey'
        paginator_class = Paginator
        authentication = authentication
        authorization = authorization
        always_return_data = True
        filtering = {
            'id': ALL,
            'device': ALL_WITH_RELATIONS,
            'start_timestamp': ['gte'],
            'stop_timestamp': ['lte'],
        }


class PositionResource(ModelResource):

    device = fields.ForeignKey(DeviceResource, 'device')
    journey = fields.ForeignKey(JourneyResource, 'journey', null=True)

    class Meta:
        queryset = Position.objects.all()
        resource_name = 'position'
        paginator_class = Paginator
        authentication = authentication
        authorization = authorization
        filtering = {
            'device': ALL_WITH_RELATIONS,
            'journey': ALL_WITH_RELATIONS,
            'timestamp': ['gte', 'lte'],
        }


class LogResource(ModelResource):

    device = fields.ForeignKey(DeviceResource, 'device')
    journey = fields.ForeignKey(JourneyResource, 'journey', null=True)

    class Meta:
        queryset = Log.objects.all()
        resource_name = 'log'
        paginator_class = Paginator
        authentication = authentication
        authorization = authorization
        filtering = {
            'device': ALL_WITH_RELATIONS,
            'journey': ALL_WITH_RELATIONS,
            'timestamp': ['gte', 'lte'],
        }

