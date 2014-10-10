from django.contrib import admin
from models import *


class AdminDevice(admin.ModelAdmin):
    list_display = ('serial', 'type', 'name', 'description', 'phone', 'plate', 'vin', 'imsi', 'msisdn')
    list_filters = ('serial', 'type', 'name', 'description', 'phone', 'plate', 'vin', 'imsi', 'msisdn')
    search_fields = ('serial', 'type', 'name', 'description', 'phone', 'plate', 'vin', 'imsi', 'msisdn')


class AdminLog(admin.ModelAdmin):
    list_display = ('timestamp', 'level', 'message',)
    list_filter = ('timestamp', 'level', 'message',)
    search_fields = ('timestamp', 'level', 'message',)


class AdminPosition(admin.ModelAdmin):
    list_display = ('latitude', 'longitude', 'timestamp', 'speed',)
    list_filter = ('timestamp', 'speed',)
    search_fields = ('timestamp', 'speed',)


class AdminJourney(admin.ModelAdmin):
    list_display = ('start_latitude', 'start_longitude', 'start_timestamp', 'stop_latitude', 'stop_longitude',
                    'stop_timestamp', 'distance', 'average_speed', 'maximum_speed', 'duration')
    list_filter = ('start_timestamp', 'stop_timestamp', 'distance', 'average_speed', 'maximum_speed', 'duration')
    search_fields = ('start_timestamp', 'stop_timestamp', 'distance', 'average_speed', 'maximum_speed', 'duration')

admin.site.register(Device, AdminDevice)
admin.site.register(Log, AdminLog)
admin.site.register(Position, AdminPosition)
admin.site.register(Journey, AdminJourney)