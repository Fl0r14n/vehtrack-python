from django.contrib import admin
from models import *
from django_mptt_admin.admin import DjangoMpttAdmin

class AdminUser(admin.ModelAdmin):
    list_display = ('email', 'name', 'role', 'is_active', 'last_login', 'created', )
    list_filter = ('email', 'name', 'role', 'is_active', 'last_login', 'created', )
    search_fields = ('email', 'name', 'role', 'is_active', 'last_login', 'created', )
    exclude = ('is_admin', )
    readonly_fields = ('password', )

class AdminFleet(DjangoMpttAdmin):
    list_display = ('name', 'parent')
    list_filter = ('name',)
    search_fields = ('name',)
    mptt_level_indent = 20

class AdminDevice(admin.ModelAdmin):
    list_display = ('email', 'is_active', 'serial', 'type', 'description', 'phone', 'plate', 'vin', 'imsi', 'msisdn', 'last_login', 'created', )
    list_filter = ('email', 'is_active', 'serial', 'type', 'description', 'phone', 'plate', 'vin', 'imsi', 'msisdn', 'last_login', 'created', )
    search_fields = ('email', 'is_active', 'serial', 'type', 'description', 'phone', 'plate', 'vin', 'imsi', 'msisdn', 'last_login', 'created', )
    exclude = ('is_admin', )
    readonly_fields = ('password', )


class AdminJourney(admin.ModelAdmin):
    list_display = ('start_latitude', 'start_longitude', 'start_timestamp', 'stop_latitude', 'stop_longitude',
                    'stop_timestamp', 'distance', 'average_speed', 'maximum_speed', 'duration', 'device')
    list_filter = ('start_timestamp', 'stop_timestamp', 'distance', 'average_speed', 'maximum_speed', 'duration', 'device', )
    search_fields = ('start_timestamp', 'stop_timestamp', 'distance', 'average_speed', 'maximum_speed', 'duration', 'device')


class AdminPosition(admin.ModelAdmin):
    list_display = ('latitude', 'longitude', 'timestamp', 'speed', 'device', 'journey')
    list_filter = ('timestamp', 'device',)
    search_fields = ('timestamp', 'device',)


class AdminLog(admin.ModelAdmin):
    list_display = ('timestamp', 'level', 'message', 'journey', 'device',)
    list_filter = ('timestamp', 'level', 'message',  'device',)
    search_fields = ('timestamp', 'level', 'message', 'device',)

admin.site.register(Fleet, AdminFleet)
admin.site.register(User, AdminUser)
admin.site.register(Device, AdminDevice)
admin.site.register(Journey, AdminJourney)
admin.site.register(Position, AdminPosition)
admin.site.register(Log, AdminLog)