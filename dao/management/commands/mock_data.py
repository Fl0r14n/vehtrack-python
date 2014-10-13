import logging
import random
import cStringIO
from datetime import datetime
from django.utils import timezone
import time
from math import sqrt, pow
import urllib
import urllib2
from pykml import parser
from django.core.management.base import BaseCommand

from dao.models import *


L = logging.getLogger(__name__)

WRITE_TO_DATABASE = True
GENERATE_ADMIN = True
GENERATE_FLEETS = True
GENERATE_USERS = True
GENERATE_DEVICES = True
GENERATE_JOURNEYS = True
ADMIN_EMAIL = 'admin'
DOMAIN = '@vehtrack.com'
ADMIN_PASSWORD = 'hackme'
TOTAL_USERS = 10
TOTAL_DEVICES = 100
TOTAL_FLEETS = TOTAL_USERS / 3
MIN_POSITIONS_JOURNEY = 100
MAX_POSITIONS_JOURNEY = 150
MAX_LOGS_JOURNEY = 5
START_DATE = '2014-02-01'
STOP_DATE = '2014-05-30'

cities = {
    'Timisoara': (45.760098, 21.238579),
    'Arad': (46.166704, 21.316663),
    'Oradea': (47.077137, 21.921791),
    'Cluj': (46.78196, 23.600639),
    'Iasi': (47.162641, 27.589706),
    'Brasov': (45.660127, 25.611137),
    'Constanta': (44.179496, 28.63993),
    'Bucuresti': (44.427283, 26.092773),
    'Craiova': (44.316234, 23.801681),
    'Sibiu': (45.791946, 24.142059),
}
start_date = timezone.make_aware(datetime.strptime(START_DATE, '%Y-%m-%d'), timezone.get_current_timezone())
stop_date = timezone.make_aware(datetime.strptime(STOP_DATE, '%Y-%m-%d'), timezone.get_current_timezone())


class Command(BaseCommand):
    def handle(self, *args, **options):
        fleets = None
        devices = None
        if GENERATE_ADMIN:
            self.generate_admin_user()
        if GENERATE_FLEETS:
            fleets = self.generate_fleets()
        if GENERATE_USERS:
            if fleets:
                self.generate_users_for_fleets(fleets)
            else:
                self.generate_users()
        if GENERATE_DEVICES:
            if fleets:
                devices = self.generate_devices_for_fleets(fleets)
            else:
                devices = self.generate_devices()
        if devices:
            for device in devices:
                if GENERATE_JOURNEYS:
                    self.journey = self.generate_journeys_for_device(device, start_date, stop_date)

    def generate_admin_user(self):
        L.info("Generating admin user========================================")
        admin = Account()
        admin.email = ADMIN_EMAIL + DOMAIN
        admin.password = ADMIN_PASSWORD
        admin.roles = ROLES.ADMIN
        if WRITE_TO_DATABASE:
            admin.save()
        L.debug('Admin: {}'.format(admin))
        return admin

    def generate_fleets(self):

        def _generate_fleet(root, depth=-1):
            sibling = 0
            # add child siblings
            while bool(random.getrandbits(1)):
                child = {
                    'data': {
                        'name': '{}_(d:{depth}_s:{sibling})'.format(root['data']['name'],
                                                                    sibling=sibling,
                                                                    depth=depth)},
                    'children': []}
                root['children'].append(child)
                sibling += 1
                #add childs to child
                while bool(random.getrandbits(1)):
                    _generate_fleet(child, depth=depth + 1)

        L.info("Generating fleets=============================================")
        fleets = []
        for group in range(TOTAL_FLEETS):
            fleet = {'data': {'name': 'fg:{group}'.format(group=group)},
                     'children': []}
            _generate_fleet(fleet, depth=1)
            fleets.append(fleet)
        L.debug('Fleets: {}'.format(fleets))
        if WRITE_TO_DATABASE:
            Fleet.load_bulk(fleets)
        return fleets

    def generate_users_for_fleets(self, fleets):

        def _generate_user_for_fleet(fleet, users, depth):
            L.debug('Fleet: {}'.format(fleet))
            user = User()
            user.name = 'user_{}'.format(len(users))
            user.email = user.name + DOMAIN
            user.password = 'pass_{}'.format(len(users))
            if depth == 0:
                # fleet admin
                user.roles = ROLES.FLEET_ADMIN
            else:
                user.roles = ROLES.USER
            if WRITE_TO_DATABASE:
                user.fleet = Fleet.objects.filter(name=fleet['data']['name']).distinct().get()
                user.save()
            L.debug('User: {}'.format(user))
            users.append(user)

        def _traverse_fleet_tree(childrens, users, depth):
            for children in childrens:
                _generate_user_for_fleet(children, users, depth)
                _traverse_fleet_tree(children['children'], users, depth + 1)

        users = []
        depth = 0
        _traverse_fleet_tree(fleets, users, depth)
        return users

    def generate_devices_for_fleets(self, fleets):

        def _generate_devices_for_fleet(fleet, devices):
            L.debug('Fleet: {}'.format(fleet))
            id = len(devices)
            device = Device()
            device.serial = 'serial_{}'.format(id)
            device.type = 'mk_{}'.format(id % 3)
            device.description = 'This is a mock device'
            device.email = 'device_{}{}'.format(id, DOMAIN)
            device.password = 'device_'.format(id)
            device.roles = ROLES.DEVICE
            if WRITE_TO_DATABASE:
                device.fleet = Fleet.objects.filter(name=fleet['data']['name']).distinct().get()
                device.save()
            L.debug('Device: {}'.format(device))
            devices.append(device)

        def _traverse_fleet_tree(nodes, devices, depth):
            for node in nodes:
                _generate_devices_for_fleet(node, devices)
                _traverse_fleet_tree(node['children'], devices, depth + 1)

        devices = []
        depth = 0
        _traverse_fleet_tree(fleets, devices, depth)
        return devices

    def generate_users(self):
        L.info("Generating users=============================================")
        users = []
        for i in range(TOTAL_USERS):
            user = User()
            user.name = 'user_{}'.format(i)
            user.email = user.name + DOMAIN
            user.password = 'pass_{}'.format(i)
            # except admin role
            user.roles = ROLES[random.randint(1, len(ROLES) - 1)]
            if WRITE_TO_DATABASE:
                user.save()
            L.debug('User: {}'.format(user))
            users.append(user)
        return users

    def generate_devices(self):
        L.info("Generating devices===========================================")
        devices = []
        for i in range(TOTAL_DEVICES):
            device = Device()
            device.serial = 'serial_{}'.format(i)
            device.type = 'mk_{}'.format(i % 3)
            device.description = 'This is a mock device'
            device.email = 'device_{}{}'.format(i, DOMAIN)
            device.password = 'device_'.format(i)
            device.roles = ROLES.DEVICE
            L.debug('Device: {}'.format(device))
            devices.append(device)
        if WRITE_TO_DATABASE:
            Device.objects.bulk_create(devices)
        return devices

    def generate_journeys_for_device(self, device, start_date, stop_date):
        L.info("Generating journeys for device " + device.serial + "====")
        start_point = cities.items()[random.randrange(len(cities))]
        journeys = []
        while start_date < stop_date:
            while True:
                end_point = cities.items()[random.randrange(len(cities))]
                if end_point is not start_point:
                    break
            journey = self._generate_journey(device, start_date, start_point[1], end_point[1])
            L.debug('Journey: {}'.format(journey))
            journeys.append(journey)
            start_point = end_point
            start_date = timezone.make_aware(
                datetime.utcfromtimestamp(to_timestamp(start_date) + (journey.duration + 360000) * 1000),
                timezone.get_current_timezone())
        return journeys

    def _generate_journey(self, device, start_date, start_point, stop_point):
        kml = YourNavigationOrg().get_kml(start_point, stop_point)
        if kml is None:
            return
        distance = float(kml.Document.distance)  # km
        travel_time = long(kml.Document.traveltime)  # sec
        if distance == 0 or travel_time == 0:
            return
        points = self._get_points_from_kml(kml)

        # remove some of the points if to many
        self._trim_points(points)

        #generate positions
        positions = []
        time_step = travel_time / len(points)
        timestamp = start_date
        last_point = start_point
        for point in points:
            position = Position()
            position.device = device
            position.latitude = point[0]
            position.longitude = point[1]
            position.timestamp = timestamp
            dst = self._calculate_distance(last_point, point)
            speed = dst * 3600 / time_step
            position.speed = speed
            timestamp = timezone.make_aware(datetime.utcfromtimestamp(to_timestamp(timestamp) + (time_step * 1000)),
                                            timezone.get_current_timezone())
            last_point = point
            positions.append(position)
        if WRITE_TO_DATABASE:
            Position.objects.bulk_create(positions)

        #generate journey
        journey = Journey()
        journey.device = device
        journey.start_timestamp = start_date
        journey.start_latitude = start_point[0]
        journey.start_longitude = start_point[1]
        journey.stop_timestamp = stop_date
        journey.stop_latitude = stop_point[0]
        journey.stop_longitude = stop_point[1]
        journey.duration = travel_time * 1000  #ms
        journey.distance = distance * 1000  #m
        journey.average_speed = distance / travel_time  #km/h
        journey.maximum_speed = journey.average_speed + 30  #+30km/h
        if WRITE_TO_DATABASE:
            journey.position_set = positions
            journey.log_set = self._generate_logs_for_journey(device)

        if WRITE_TO_DATABASE:
            journey.save()
        return journey

    def _get_points_from_kml(self, kml):
        points = []
        attribute = str(kml.Document.Folder.Placemark.LineString.coordinates)
        for line in cStringIO.StringIO(attribute):
            try:
                lng, lat = line.split(',')
                points.append((float(lat), float(lng)))
            except:
                pass
        return points

    def _trim_points(self, points):
        total_points = random.randint(MIN_POSITIONS_JOURNEY, MAX_POSITIONS_JOURNEY)
        if len(points) > total_points:
            remove_step = len(points) / total_points
            if remove_step > 0:
                for i, point in enumerate(points):
                    if i % remove_step > 0:
                        del point

    def _calculate_distance(self, lat, lon):
        return sqrt(pow((lat[0] - lon[0]) * 111.12, 2) + pow((lat[1] - lon[1]) * 100.7, 2))

    def _generate_logs_for_journey(self, device):
        L.info("Generating logs for device " + device.serial + "======")
        logs = []
        for i in range(random.randrange(MAX_LOGS_JOURNEY)):
            log = Log()
            log.device = device
            log.level = LEVEL.get_label(random.randrange(len(LEVEL)))[0]
            log.message = 'Message: {}'.format(LEVEL.get_label(log.level)[1])
            if WRITE_TO_DATABASE:
                log.save()
            logs.append(log)
        return logs


class YourNavigationOrg(object):
    def get_kml(self, start, stop):
        return self._execute(self._build_url(start, stop))

    @classmethod
    def _execute(cls, url_path):
        url_path = '{}?{}'.format(url_path['url'], url_path['params'])
        print(url_path)
        f = urllib2.urlopen(url_path)
        return parser.parse(f).getroot()

    @classmethod
    def _build_url(cls, start, stop):
        return {
            'url': 'http://www.yournavigation.org/api/dev/route.php',
            'params': urllib.urlencode({
                'flat': start[0],
                'flon': start[1],
                'tlat': stop[0],
                'tlon': stop[1],
                'v': 'motorcar',
                'fast': 1,
                'layer': 'mapnik',
                'instructions': 0,
            }),
        }


def to_timestamp(datetime):
    return time.mktime(datetime.utctimetuple())