from django.conf.urls import patterns, include, url
from tastypie.api import Api
from resources import *

v1_api = Api(api_name='v1')
v1_api.register(AccountResource())
v1_api.register(UserResource())
v1_api.register(DeviceResource())
v1_api.register(FleetResource())
v1_api.register(JourneyResource())
v1_api.register(PositionResource())
v1_api.register(LogResource())

urlpaterns = patterns('',
    url(r'^api/', include(v1_api.urls)),
)