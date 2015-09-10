/* global angular */

'use strict';

angular.module('homepage.journeys', ['utils', 'widget.options', 'widget.table']).config(function() {
});

angular.module('homepage.journeys').factory('journeyService', function (restResource) {
    var $resource = restResource.$resource;
    var url = restResource.endpoint('journey');
    return {
        id: $resource(url + ':id/', {id: '@id'}),
        q: $resource(url, {
            limit: '@limit',
            offset: '@offset',
            device__serial: '@device_serial',
            start_timestamp__gte: '@start_timestamp',
            stop_timestamp__lte: '@stop_timestamp'
        }, {'get': {method: 'GET'}}),
        getJourneysForDevice: function (deviceSerial, startTimestamp, stopTimestamp, callback) {
            this.q.get({
                device__serial: deviceSerial,
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
            return getJourneysForDevice(deviceId, startTimestamp, stopTimestamp, callback);
        }
    };
});

angular.module('homepage.journeys').controller('journeyController', function($scope, config, messagingService, journeyService) {
    var self = this;
    self.options_url = config.get('static_url')+'app/widget/options/options.html';
    self.table_url = config.get('static_url')+'app/widget/table/table.html';
    $scope.domain = $scope.tabId;


    $scope.showPositions =  function (journey) {
        var tab = {
            id: 'positions_journey_' + journey.id,
            name: 'Positions for journey',
            active: true,
            include: config.get('static_url')+'app/homepage/position/position.html'
        };
        self._newDetailTab(tab, journey);
    };

    $scope.showLogs = function (journey) {
        var tab = {
            id: 'logs_journey_' + journey.id,
            name: 'Logs for Journey',
            active: true,
            include: config.get('static_url')+'app/homepage/log/log.html'
        };
        self._newDetailTab(tab, journey);
    };

    self._newDetailTab = function(tab, journey) {
        messagingService.pub(messagingService.DEFAULT_DOMAIN, 'TAB_ADD', tab);
        messagingService.pub(messagingService.DEFAULT_DOMAIN, 'TAB_SELECT', tab);
        messagingService.sub($scope, tab.id, 'OPTIONS_ON_LOAD', function(event, options) {
            options.devices.readonly = true;
            if(angular.isDefined(self.options)) {
                options.devices.selected = self.options.devices.selected;
            }
            options.journeys.readonly = true;
            options.journeys.selected = journey;
            options.startDate.readonly = true;
            options.startDate.date = new Date(journey.start_timestamp);
            options.stopDate.readonly = true;
            options.stopDate.date = new Date(journey.stop_timestamp);
            options.submit.show = false;
            messagingService.pub(tab.id, 'OPTIONS_SUBMITTED', options);
        });
    };


    messagingService.sub($scope, $scope.domain, 'OPTIONS_ON_LOAD', function (event, options) {
        self.options = options;
        options.devices.show = true;
        options.journeys.show = false;
        options.startDate.show = true;
        options.stopDate.show = true;
    });

    messagingService.sub($scope, $scope.domain, 'TABLE_ON_LOAD', function (event, table) {
        self.journeyTable = table;
        table.columnDefs = [
            { name: 'start_latitude', displayName: 'Start Latitude', width: 150 },
            { name: 'start_longitude', displayName: 'Start Longitude', width: 150 },
            { name: 'start_timestamp', displayName: 'Start Timestamp', width: 150 },

            { name: 'stop_latitude', displayName: 'Stop Latitude', width: 150 },
            { name: 'stop_longitude', displayName: 'Stop Longitude', width: 150 },
            { name: 'stop_timestamp', displayName: 'Stop Timestamp', width: 150 },

            { name: 'distance', displayName: 'Distance', width: 100 },
            { name: 'average_speed', displayName: 'Average Speed', width: 150 },
            { name: 'maximum_speed', displayName: 'Maximum Speed', width: 150 },
            { name: 'duration', displayName: 'Duration', width: 100 },

            { name: 'id', displayName: '', width: 100, enableFiltering: false, cellTemplate: '<button class="btn primary glyphicon glyphicon-eye-open" ng-click="grid.appScope.showPositions(row.entity)"></button><button class="btn primary glyphicon glyphicon-exclamation-sign" ng-click="grid.appScope.showLogs(row.entity)"></button>'}
        ];
    });

    messagingService.sub($scope, $scope.domain, 'OPTIONS_SUBMITTED', function (event, options) {
        journeyService.getJourneysForDevice(options.devices.selected.serial, options.startDate.dateString(), options.stopDate.dateString(), function (data) {
            if(angular.isDefined(self.journeyTable)) {
                self.journeyTable.data = data.objects;
            }
        });
    });
}); 