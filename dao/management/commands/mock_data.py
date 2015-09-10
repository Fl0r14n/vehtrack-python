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
from auth_server.models import Account, AccountRole

L = logging.getLogger(__name__)

WRITE_TO_DATABASE = True
GENERATE_FLEETS = True
GENERATE_USERS = True
GENERATE_DEVICES = True
GENERATE_JOURNEYS = True
DOMAIN = '@vehtrack.com'
TOTAL_USERS = 10
TOTAL_DEVICES = 100
TOTAL_FLEETS = TOTAL_USERS / 3
MIN_POSITIONS_JOURNEY = 100
MAX_POSITIONS_JOURNEY = 150
MAX_LOGS_JOURNEY = 5
START_DATE = '2015-05-01'
STOP_DATE = '2015-12-30'

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
                    self.generate_journeys_for_device(device, start_date, stop_date)

    @classmethod
    def generate_fleets(cls):

        def _generate_fleet(parent, depth=-1, fleet_list=None):
            # add child siblings
            sibling = 0
            while bool(random.getrandbits(1)):
                child_name = '{}_(d:{depth}_s:{sibling})'.format(parent.name, sibling=sibling, depth=depth)
                L.info(child_name)
                child = Fleet.objects.create(name=child_name, parent=parent)

                if fleet_list:
                    fleet_list.append(child)

                sibling += 1
                # add children to child
                if bool(random.getrandbits(1)):
                    _generate_fleet(child, depth=depth + 1)

        L.info("Generating fleets=============================================")
        fleets = []
        for group in range(TOTAL_FLEETS):
            name = 'fg:{group}'.format(group=group)
            L.info(name)
            fleet = Fleet.objects.create(name=name)
            fleets.append(fleet)
            _generate_fleet(fleet, depth=1, fleet_list=fleets)

        return fleets

    @classmethod
    def generate_users_for_fleets(cls, fleets):
        L.info("Generating users for fleets=====================================")
        users = []
        for fleet in fleets:
            L.debug('Fleet: {}'.format(fleet))
            user_id = User.objects.count()
            user = User()
            user.name = 'user_{}'.format(user_id)
            user.email = user.name + DOMAIN
            user.set_password('pass_{}'.format(user_id))
            user.role = AccountRole.objects.get(name='FLEET_ADMIN' if fleet.is_root_node() else 'USER')
            user.save()
            user.fleets = [fleet, ]
            user.save()
            users.append(user)
        return users

    @classmethod
    def generate_devices_for_fleets(cls, fleets):
        L.info("Generating devices for fleets==================================")
        devices = []
        for fleet in fleets:
            L.debug('Fleet: {}'.format(fleet))
            device_id = Device.objects.count()
            device = Device()
            device.serial = 'serial_{}'.format(device_id)
            device.type = 'mk_{}'.format(device_id % 3)
            device.description = 'This is a mock device'
            device.email = 'device_{}{}'.format(device_id, DOMAIN)
            device.role = AccountRole.objects.get(name='DEVICE')
            device.set_password('device_'.format(device_id))
            device.save()
            device.fleets = [fleet, ]
            device.save()
            devices.append(device)
        return devices

    @classmethod
    def generate_users(cls):
        L.info("Generating users=============================================")
        users = []
        roles = AccountRole.objects.exclude(name='ADMIN')
        for i in range(TOTAL_USERS):
            user = User()
            user.name = 'user_{}'.format(i)
            user.email = user.name + DOMAIN
            # except admin role
            user.role = roles[random.randint(0, len(roles)-1)]
            user.set_password('pass_{}'.format(i))
            if WRITE_TO_DATABASE:
                user.save()
            L.debug('User: {}'.format(user))
            users.append(user)
        return users

    @classmethod
    def generate_devices(cls):
        L.info("Generating devices===========================================")
        devices = []
        for i in range(TOTAL_DEVICES):
            device = Device()
            device.serial = 'serial_{}'.format(i)
            device.type = 'mk_{}'.format(i % 3)
            device.description = 'This is a mock device'
            device.email = 'device_{}{}'.format(i, DOMAIN)
            device.role = AccountRole.objects.get(name='DEVICE')
            device.set_password('device_'.format(i))
            L.debug('Device: {}'.format(device))
            devices.append(device)
        if WRITE_TO_DATABASE:
            Device.objects.bulk_create(devices)
        return devices

    def generate_journeys_for_device(self, device, startj_date, stopj_date):
        # L.info("Generating journeys for device " + device.serial + "====")
        start_point = cities.items()[random.randrange(len(cities))]
        journeys = []
        while startj_date < stopj_date:
            while True:
                end_point = cities.items()[random.randrange(len(cities))]
                if end_point is not start_point:
                    break

            journey = self._generate_journey(device, startj_date, start_point[1], end_point[1])
            if journey:
                L.debug('Journey: {}'.format(journey))
                journeys.append(journey)
                start_point = end_point
                startj_date = timezone.make_aware(
                    datetime.utcfromtimestamp(to_timestamp(startj_date) + (journey.duration + 3600000)),
                    timezone.get_current_timezone())
        return journeys

    def _generate_journey(self, device, startj_date, start_point, stop_point):
        kml = YourNavigationOrg().get_kml(start_point, stop_point)
        if kml is None:
            return
        distance = float(kml.Document.distance)  # km
        travel_time = long(kml.Document.traveltime)  # sec
        L.info('Device: {} Distance: {} Time: {}'.format(device, distance, travel_time))
        if distance < 0.5 or travel_time == 0:
            return

        stop_date = timezone.make_aware(
            datetime.utcfromtimestamp(to_timestamp(startj_date) + (travel_time + 3600000)),
            timezone.get_current_timezone())

        # generate journey
        journey = Journey()
        journey.device = device
        journey.start_timestamp = startj_date
        journey.start_latitude = start_point[0]
        journey.start_longitude = start_point[1]
        journey.stop_timestamp = stop_date
        journey.stop_latitude = stop_point[0]
        journey.stop_longitude = stop_point[1]
        journey.duration = travel_time * 1000  # ms
        journey.distance = distance * 1000  # m
        journey.average_speed = distance / travel_time  # km/h
        journey.maximum_speed = journey.average_speed + 30  # +30km/h
        if WRITE_TO_DATABASE:
            journey.save()
            self._generate_points_for_journey(device, journey, kml, start_point, startj_date, travel_time)
            self._generate_logs_for_journey(device, journey)
        return journey

    @classmethod
    def _get_points_from_kml(cls, kml):
        points = []
        attribute = str(kml.Document.Folder.Placemark.LineString.coordinates)
        for line in cStringIO.StringIO(attribute):
            try:
                lng, lat = line.split(',')
                points.append((float(lat), float(lng)))
            except:
                pass
        return points

    @classmethod
    def _trim_points(cls, points):
        total_points = random.randint(MIN_POSITIONS_JOURNEY, MAX_POSITIONS_JOURNEY)
        if len(points) > total_points:
            remove_step = len(points) / total_points
            if remove_step > 0:
                for i, point in enumerate(points):
                    if i % remove_step > 0:
                        del point

    @classmethod
    def _calculate_distance(cls, lat, lon):
        return sqrt(pow((lat[0] - lon[0]) * 111.12, 2) + pow((lat[1] - lon[1]) * 100.7, 2))

    @classmethod
    def _generate_logs_for_journey(cls, device, journey):
        logs = []
        for i in range(random.randrange(MAX_LOGS_JOURNEY)):
            log = Log()
            log.device = device
            log.level = LEVEL.get_label(random.randrange(len(LEVEL)))[0]
            log.message = 'Message: {}'.format(LEVEL.get_label(log.level)[1])
            log.journey = journey
            logs.append(log)
        if WRITE_TO_DATABASE:
            Log.objects.bulk_create(logs)
        return logs

    def _generate_points_for_journey(self, device, journey, kml, start_point, startj_date, travel_time):
        points = self._get_points_from_kml(kml)
        # remove some of the points if to many
        self._trim_points(points)
        # generate positions
        positions = []
        time_step = travel_time / len(points)
        timestamp = startj_date
        last_point = start_point
        for point in points:
            position = Position()
            position.device = device
            position.journey = journey
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
        return positions

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


def to_timestamp(dt):
    return time.mktime(dt.utctimetuple())
