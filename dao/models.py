from django.db import models
from utils.choice import Choices
from mptt.models import MPTTModel, TreeForeignKey
import validators
from auth_server.models import Account


def to_string(self):
    d = vars(self)
    result = '{'
    for k in sorted(d.iterkeys()):
        if not k.startswith('_'):
            result += '({} : {}), '.format(k, d[k])
    return result + '}\n'


class Fleet(MPTTModel):
    name = models.CharField(max_length=64, validators=[validators.UsernameValidator])
    parent = TreeForeignKey('self', null=True, blank=True, related_name='children', db_index=True)

    class Meta:
        db_table = 'fleets'

    class MPTTMeta:
        order_insertion_by = ['name']

    def __str__(self):
        return self.name

    @classmethod
    def get_fleet(cls, user):
        role = user.role
        if role:
            if role.name == 'ADMIN':
                #return all the root nodes wo children
                return Fleet.get_root_nodes()
            elif role.name == 'FLEET_ADMIN':
                #return the node + children
                parent = user.fleet
                return parent.get_tree(parent)
            elif role.name == 'USER':
                #has only one fleet
                return user.fleet
        return None


class User(Account):
    name = models.CharField(max_length=64, validators=[validators.UsernameValidator])
    #photo =

    fleets = models.ManyToManyField('Fleet')

    class Meta:
        db_table = 'users'
        ordering = ['name']

    def __str__(self):
        return to_string(self)

    @classmethod
    def get_fleets(cls, fleet_name):
        fleet = Fleet.objects.get(name=fleet_name)
        return User.objects.filter(fleet__in=fleet.get_descendants())


class Device(Account):
    serial = models.CharField(max_length=30, unique=True, db_index=True)
    type = models.CharField(max_length=30)  #equipment type
    description = models.CharField(max_length=256, default='', blank=True)
    phone = models.CharField(max_length=12, default='', blank=True, validators=[validators.PhoneValidator])
    plate = models.CharField(max_length=30, default='', blank=True) #plate number
    vin = models.CharField(max_length=17, default='', blank=True, validators=[validators.VINValidator])
    imei = models.CharField(max_length=15, default='', blank=True, validators=[validators.IMEIValidator])
    imsi = models.CharField(max_length=15, default='', blank=True, validators=[validators.IMSIValidator])
    msisdn = models.CharField(max_length=14, default='', blank=True, validators=[validators.MSISDNValidator])

    fleets = models.ManyToManyField('Fleet')

    class Meta:
        db_table = 'devices'
        ordering = ['serial']

    def __str__(self):
        return to_string(self)

    @classmethod
    def get_fleets(cls, fleet_name):
        fleet = Fleet.objects.get(name=fleet_name)
        return Device.objects.filter(fleet__in=fleet.get_descendants())


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
        ordering = ['-start_timestamp']

    def __str__(self):
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
        ordering = ['-timestamp']

    def __str__(self):
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

    def __str__(self):
        return to_string(self)
