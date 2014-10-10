from django.db import models
from treebeard import mp_tree
from utils.choice import Choices
import validators


def to_string(self):
    d = vars(self)
    result = '{'
    for k in sorted(d.iterkeys()):
        if not k.startswith('_'):
            result += '({} : {}), '.format(k, d[k])
    return result + '}\n'

ROLES = Choices(
    ADMIN=(0, 'ADMIN'),
    FLEET_ADMIN=(1, 'FLEET_ADMIN'),
    USER=(2, 'USER'),
    DEVICE=(4, 'DEVICE'),
)


class Account(models.Model):
    email = models.EmailField(max_length=40, primary_key=True)
    password = models.CharField(max_length=128)
    active = models.BooleanField(default=True)
    created = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(auto_now=True)
    roles = models.CharField(max_length=1, choices=ROLES)

    class Meta:
        db_table = 'accounts'
        ordering = ['-last_login', 'active', 'email', 'created']


class User(Account):
    name = models.CharField(max_length=64, validators=[validators.UsernameValidator])

    fleet = models.ForeignKey('Fleet')

    class Meta:
        db_table = 'users'
        ordering = ['name']

    def __unicode__(self):
        return to_string(self)

    def get_fleets(self, fleet_name):
        fleet = Fleet.objects.get(name=fleet_name)
        return User.objects.filter(fleet__in=fleet.get_descendants())


class Device(Account):
    serial = models.CharField(max_length=30)
    type = models.CharField(max_length=30)  #equipment type
    description = models.CharField(max_length=256, default='', blank=True)
    phone = models.CharField(max_length=12, default='', blank=True, validators=[validators.PhoneValidator])
    plate = models.CharField(max_length=30, default='', blank=True) #plate number
    vin = models.CharField(max_length=17, default='', blank=True, validators=[validators.VINValidator])
    imei = models.CharField(max_length=15, default='', blank=True, validators=[validators.IMEIValidator])
    imsi = models.CharField(max_length=15, default='', blank=True, validators=[validators.IMSIValidator])
    msisdn = models.CharField(max_length=14, default='', blank=True, validators=[validators.MSISDNValidator])

    fleet = models.ForeignKey('Fleet')

    class Meta:
        db_table = 'devices'
        ordering = ['serial']

    def __unicode__(self):
        return to_string(self)

    def get_fleets(self, fleet_name):
        fleet = Fleet.objects.get(name=fleet_name)
        return Device.objects.filter(fleet__in=fleet.get_descendants())


class Fleet(mp_tree.MP_Node):
    name = models.CharField(max_length=64, validators=[validators.UsernameValidator])

    class Meta:
        db_table = 'fleets'
        ordering = ['name']


class Journey(models.Model):
    start_latitude = models.FloatField() #gg.ggggg
    start_longitude = models.FloatField() #gg.ggggg
    start_timestamp = models.DateTimeField() #ms
    stop_latitude = models.FloatField() #gg.ggggg
    stop_longitude = models.FloatField() #gg.ggggg
    stop_timestamp = models.DateTimeField() #ms
    distance = models.BigIntegerField() #m
    average_speed = models.FloatField() #km/h
    maximum_speed = models.FloatField() #km/h
    duration = models.BigIntegerField() #ms

    device = models.ForeignKey(Device)

    class Meta:
        db_table = 'journeys'
        ordering = ['start_timestamp']

    def __unicode__(self):
        return to_string(self)


class Position(models.Model):
    latitude = models.FloatField() #gg.ggggg
    longitude = models.FloatField() #gg.ggggg
    timestamp = models.DateTimeField() #ms
    speed = models.FloatField()

    journey = models.ForeignKey(Journey, null=True)
    device = models.ForeignKey(Device)

    class Meta:
        db_table = 'positions'
        ordering = ['timestamp']

    def __unicode__(self):
        return to_string(self)


LEVEL = Choices(
    ERROR=(0, 'ERROR'),
    WARN=(1, 'WARN'),
    INFO=(2, 'INFO'),
    DEBUG=(3, 'DEBUG'),
)


class Log(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True) #ms
    level = models.CharField(max_length=1, choices=LEVEL, default=LEVEL.DEBUG)
    message = models.TextField(max_length=2048, default='', blank=True)

    journey = models.ForeignKey(Journey, null=True)
    device = models.ForeignKey(Device)

    class Meta:
        db_table = 'logs'
        ordering = ['-timestamp']

    def __unicode__(self):
        return to_string(self)
