/* global angular */

'use strict';

angular.module('homepage.logs', ['utils', 'widget.options', 'widget.table']).config(function() {
});

angular.module('homepage.logs').factory('logService', function (restResource, config) {
    var $resource = restResource.$resource;
    var url = restResource.endpoint('log');
    return {
        id: $resource(url + ':id/', {id: '@id'}),
        q: $resource(url, {
            limit: '@limit',
            offset: '@offset',
            device__serial: '@device_serial',
            journey__id: '@journey_id',
            timestamp__gte: '@start_timestamp',
            timestamp__lte: '@stop_timestamp',
            level: '@level'
        }, {'get': {method: 'GET'}}),
        getLogsForJourney: function (journeyId, callback) {
            this.q.get({
                journey__id: journeyId,
                limit: config.get('log_page_limit')
            }, function (data) {
                if (callback) {
                    callback(data);
                }
            });
        },
        getLogsForDevice: function (deviceSerial, startTimestamp, stopTimestamp, callback) {
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

angular.module('homepage.logs').controller('logController', function($scope, config, messagingService, journeyService, logService) {
    var self = this;
    self.options_url = config.get('static_url')+'app/widget/options/options.html';
    self.table_url = config.get('static_url')+'app/widget/table/table.html';
    $scope.domain = $scope.tabId;

    messagingService.sub($scope, $scope.domain, 'OPTIONS_ON_LOAD', function (event, options) {
        options.devices.show = true;
        options.journeys.show = true;
        options.startDate.show = true;
        options.stopDate.show = true;
    });

    messagingService.sub($scope, $scope.domain, 'TABLE_ON_LOAD', function (event, table) {
        self.logTable = table;
        self.logTable.columnDefs = [
            { name: 'timestamp', displayName: 'Timestamp', width: 200 },
            { name: 'level', displayName: 'Level', width: 100 },
            { name: 'message', displayName: 'Message', width: 300 }
        ];
    });

    messagingService.sub($scope, $scope.domain, 'OPTIONS_SUBMITTED', function (event, options) {
        journeyService.getJourneysForDevice(options.devices.selected.serial, options.startDate.dateString(), options.stopDate.dateString(), function (data) {
                options.journeys.list = data.objects;
        });
        if (angular.isDefined(options.journeys.selected) && angular.isObject(options.journeys.selected)) {
            logService.getLogsForJourney(options.journeys.selected.id, function (data) {
                if(angular.isDefined(self.logTable)) {
                    self.logTable.data = data.objects;
                }
            });
        } else {
            logService.getLogsForDevice(options.devices.selected.serial, options.startDate.dateString(), options.stopDate.dateString(), function (data) {
                if(angular.isDefined(self.logTable)) {
                    self.logTable.data = data.objects;
                }
            });
        }
    });
}); 
