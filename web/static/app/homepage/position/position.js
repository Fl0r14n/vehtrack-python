/* global angular */

'use strict';

angular.module('homepage.positions', ['utils', 'widget.options', 'widget.map']).config(function() {
});

angular.module('homepage.positions').factory('positionService', function (restResource) {
    var $resource = restResource.$resource;
    var url = restResource.endpoint('position');
    return {
        id: $resource(url + ':id/', {id: '@id'}),
        q: $resource(url, {
            limit: '@limit',
            offset: '@offset',
            device__serial: '@device_serial',
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
        getPositionsForDevice: function (deviceSerial, startTimestamp, stopTimestamp, callback) {
            this.q.get({
                device__serial: deviceSerial,
                timestamp__gte: startTimestamp,
                timestamp__lte: stopTimestamp
            }, function (data) {
                if (callback) {
                    callback(data);
                }
            });
        }
    };
});

angular.module('homepage.positions').controller('positionController', function($scope, config, messagingService, journeyService, positionService) {
    var self = this;
    self.options_url = config.get('static_url')+'app/widget/options/options.html';
    self.map_url = config.get('static_url')+'app/widget/map/map.html';
    $scope.domain = $scope.tabId;

    messagingService.sub($scope, $scope.domain, 'OPTIONS_ON_LOAD', function (event, options) {
        options.devices.show = true;
        options.journeys.show = true;
        options.startDate.show = true;
        options.stopDate.show = true;
    });

    messagingService.sub($scope, $scope.domain, 'OPTIONS_SUBMITTED', function (event, options) {
        if (angular.isDefined(options.devices.selected) && angular.isObject(options.devices.selected)) {

            //get journeys list
            journeyService.getJourneysForDevice(options.devices.selected.serial, options.startDate.dateString(), options.stopDate.dateString(), function (data) {
                options.journeys.list = data.objects;
            });

            if (angular.isDefined(options.journeys.selected) && angular.isObject(options.journeys.selected)) {
                var selectedJourney = options.journeys.selected;
                positionService.getPositionsforJourney(options.journeys.selected.id, function (data) {
                    var payload = data.objects;
                    if (payload.length > 0) {
                        messagingService.pub($scope.domain, 'MAP_INIT', {
                            center: {
                                latitude: payload[0].latitude,
                                longitude: payload[0].longitude
                            }
                        });
                        var markers = [
                            {
                                latitude: selectedJourney.start_latitude,
                                longitude: selectedJourney.start_longitude,
                                title: selectedJourney.start_timestamp + '<br/> dst: ' + selectedJourney.distance + 'm<br/> dur:' + selectedJourney.duration + 's',
                                icon: 'http://maps.google.com/mapfiles/kml/paddle/go.png'
                            },
                            {
                                latitude: selectedJourney.stop_latitude,
                                longitude: selectedJourney.stop_longitude,
                                title: selectedJourney.stop_timestamp + '<br/> avg: ' + selectedJourney.average_speed + 'km/h<br/> max: ' + selectedJourney.maximum_speed + 'km/h',
                                icon: 'http://maps.google.com/mapfiles/kml/paddle/stop.png'
                            }
                        ];
                        messagingService.pub($scope.domain, 'MAP_ADD_MARKERS', markers);
                        messagingService.pub($scope.domain, 'MAP_ADD_POLYLINE', payload);
                    }
                });
            } else {
                positionService.getPositionsForDevice(options.devices.selected.serial, options.startDate.dateString(), options.stopDate.dateString(), function (data) {
                    var payload = data.objects;
                    if (payload.length > 0) {
                        messagingService.pub($scope.domain, 'MAP_INIT', {
                            center: {
                                latitude: payload[0].latitude,
                                longitude: payload[0].longitude
                            }
                        });
                        messagingService.pub($scope.domain, 'MAP_ADD_POLYLINE', data.objects);
                    }
                });
            }
        }
    });
});