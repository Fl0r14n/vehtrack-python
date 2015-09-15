from django.contrib import admin
from models import *
from django_mptt_admin.admin import DjangoMpttAdmin
from auth_server.models import AccountRole
from auth_server.admin import AdminAccount


@admin.register(User)
class AdminUser(AdminAccount):
    list_display = ('email', 'name', 'role', 'is_active', 'last_login', 'created', )
    list_filter = ('email', 'name', 'role', 'is_active', 'last_login', 'created', )
    search_fields = ('email', 'name', 'role', 'is_active', 'last_login', 'created', )
    exclude = ('is_admin', )
    fieldsets = (
        (None, {
            'fields': ('email', 'password', ),
        }),
        ('Personal Info', {
            'fields': ('name', 'role', 'fleets'),
        }),
        ('Other', {
            'classes': ('collapse', ),
            'fields': ('is_active', 'last_login', 'created', )
        }),
    )
    add_fieldsets = (
        (None, {
            'fields': ('email', 'password1', 'password2', 'is_active'),
        }),
        ('Personal Info', {
            'fields': ('name', 'role', 'fleets'),
        }),
    )


@admin.register(Fleet)
class AdminFleet(DjangoMpttAdmin):
    list_display = ('name', 'parent')
    list_filter = ('name',)
    search_fields = ('name',)
    mptt_level_indent = 20


@admin.register(Device)
class AdminDevice(AdminAccount):
    list_display = ('email', 'is_active', 'serial', 'type', 'description', 'phone', 'plate', 'vin', 'imsi', 'msisdn', 'last_login', 'created', )
    list_filter = ('email', 'is_active', 'serial', 'type', 'description', 'phone', 'plate', 'vin', 'imsi', 'msisdn', 'last_login', 'created', )
    search_fields = ('email', 'is_active', 'serial', 'type', 'description', 'phone', 'plate', 'vin', 'imsi', 'msisdn', 'last_login', 'created', )
    exclude = ('is_admin', )
    fieldsets = (
        (None, {
            'fields': ('email', 'password', 'serial', 'type', 'fleets', )
        }),
        ('Vehicle Info', {
            'fields': ('description', 'plate', 'vin', ),
        }),
        ('Advanced options', {
            'classes': ('collapse', ),
            'fields': ('phone', 'imei', 'imsi', 'msisdn', ),
        }),
        ('Other', {
            'classes': ('collapse', ),
            'fields': ('is_active', 'last_login', 'created', ),
        }),
    )
    add_fieldsets = (
        (None, {
            'fields': ('email', 'password1', 'password2', 'serial', 'type', 'fleets', 'is_active')
        }),
        ('Vehicle Info', {
            'fields': ('description', 'plate', 'vin', ),
        }),
        ('Advanced options', {
            'classes': ('collapse', ),
            'fields': ('phone', 'imei', 'imsi', 'msisdn', ),
        }),
    )

    def save_model(self, request, obj, form, change):
        obj.role = AccountRole.objects.get(name='DEVICE')
        obj.save()


@admin.register(Journey)
class AdminJourney(admin.ModelAdmin):
    list_display = ('start_latitude', 'start_longitude', 'start_timestamp', 'stop_latitude', 'stop_longitude',
                    'stop_timestamp', 'distance', 'average_speed', 'maximum_speed', 'duration', 'device')
    list_filter = ('start_timestamp', 'stop_timestamp', 'distance', 'average_speed', 'maximum_speed', 'duration', 'device', )
    search_fields = ('start_timestamp', 'stop_timestamp', 'distance', 'average_speed', 'maximum_speed', 'duration', 'device')


@admin.register(Position)
class AdminPosition(admin.ModelAdmin):
    list_display = ('latitude', 'longitude', 'timestamp', 'speed', 'device', 'journey')
    list_filter = ('timestamp', 'device',)
    search_fields = ('timestamp', 'device',)


@admin.register(Log)
class AdminLog(admin.ModelAdmin):
    list_display = ('timestamp', 'level', 'message', 'journey', 'device',)
    list_filter = ('timestamp', 'level', 'message',  'device',)
    search_fields = ('timestamp', 'level', 'message', 'device',)