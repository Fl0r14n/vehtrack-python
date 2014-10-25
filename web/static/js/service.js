'use strict';

var services = angular.module('service', ['ngResource']);

services.api = '/api/v1/';

services.endpoint = function (resource) {
    return services.api + resource + '/';
};

services.schema = function (endpoint) {
    return services.endpoint(endpoint) + 'schema/';
};

services.factory('AccountService', function ($resource) {
    var url = services.endpoint('account');
    return {
        id: $resource(url + ':id/', {id: '@id'}),
        q: $resource(url, {
            limit: '@limit',
            offset: '@offset'
        }, {'get': {method: 'GET'}})
    }
});

services.factory('UserService', function ($resource) {
    var url = services.endpoint('user');
    return {
        id: $resource(url + ':id/', {id: '@id'}),
        q: $resource(url, {
            limit: '@limit',
            offset: '@offset',
            fleet__id: '@fleet_id'
        }, {'get': {method: 'GET'}}),
        getUserDetail: function (email, callback) {
            this.id.get({
                id: email
            }, function (data) {
                if (callback) {
                    callback(data);
                }
            });
        }
    }
});

services.factory('FleetService', function ($resource) {
    var url = services.endpoint('fleet');
    return {
        id: $resource(url + ':id/', {id: '@id'}),
        q: $resource(url, {
            name: '@name'
        }, {'get': {method: 'GET'}})
    }
});

services.factory('DeviceService', function ($resource) {
    var url = services.endpoint('device');
    return {
        id: $resource(url + ':id/', {id: '@id'}),
        q: $resource(url, {
            limit: '@limit',
            offset: '@offset',
            fleet__id: '@fleet_id'
        }, {'get': {method: 'GET'}}),
        getDevicesForFleet: function (fleetId, callback) {
            this.q.get({
                fleet__id: fleetId
            }, function (data) {
                if (callback) {
                    callback(data);
                }
            });
        }
    }
});

services.factory('JourneyService', function ($resource) {
    var url = services.endpoint('journey');
    return {
        id: $resource(url + ':id/', {id: '@id'}),
        q: $resource(url, {
            limit: '@limit',
            offset: '@offset',
            device__id: '@device_id',
            start_timestamp__gte: '@start_timestamp',
            stop_timestamp__lte: '@stop_timestamp'
        }, {'get': {method: 'GET'}}),
        getJourneysForDevice: function (deviceId, startTimestamp, stopTimestamp, callback) {
            this.q.get({
                device__id: deviceId,
                start_timestamp__gte: startTimestamp,
                stop_timestamp__lte: stopTimestamp
            }, function (data) {
                if (callback) {
                    callback(data);
                }
            });
        },
        lastWeekJourneysForDevice: function (deviceId, callback) {
            var stopTimestamp = Date.now(); //ms
            var startTimestamp = stopTimestamp - 604800000; //ms
            return self.getJourneysForDevice(deviceId, startTimestamp, stopTimestamp, callback);
        }
    }
});

services.factory('PositionService', function ($resource) {
    var url = services.endpoint('position');
    return {
        id: $resource(url + ':id/', {id: '@id'}),
        q: $resource(url, {
            limit: '@limit',
            offset: '@offset',
            device__id: '@device_id',
            journey__id: '@journey_id',
            timestamp__gte: '@start_timestamp',
            timestamp__lte: '@stop_timestamp'
        }, {'get': {method: 'GET'}}),
        getPositionsforJourney: function (journeyId, callback) {
            this.q.get({
                journey__id: journeyId
            }, function (data) {
                if (callback) {
                    callback(data);
                }
            });
        },
        getPositionsForDevice: function (deviceId, startTimestamp, stopTimestamp, callback) {
            this.q.get({
                device__id: deviceId,
                timestamp__gte: startTimestamp,
                timestamp__lte: stopTimestamp
            }, function (data) {
                if (callback) {
                    callback(data);
                }
            });
        }
    }
})
;

services.factory('LogService', function ($resource) {
    var url = services.endpoint('log');
    return {
        id: $resource(url + ':id/', {id: '@id'}),
        q: $resource(url, {
            limit: '@limit',
            offset: '@offset',
            device__id: '@device_id',
            journey__id: '@journey_id',
            timestamp__gte: '@start_timestamp',
            timestamp__lte: '@stop_timestamp',
            level: '@level'
        }, {'get': {method: 'GET'}}),
        getLogsForJourney: function (journeyId, callback) {
            this.q.get({
                journey__id: journeyId
            }, function (data) {
                if (callback) {
                    callback(data);
                }
            });
        },
        getLogsForDevice: function (deviceId, startTimestamp, stopTimestamp, callback) {
            this.q.get({
                device__id: deviceId,
                timestamp__gte: startTimestamp,
                timestamp__lte: stopTimestamp
            }, function (data) {
                if (callback) {
                    callback(data);
                }
            });
        }
    }
});
