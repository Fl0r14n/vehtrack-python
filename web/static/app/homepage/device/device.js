/* global angular */

'use strict';

angular.module('homepage.devices', ['utils']).config(function() {
});

angular.module('homepage.devices').factory('deviceService', function (restResource, config) {
    var $resource = restResource.$resource;
    var url = restResource.endpoint('device');
    return {
        id: $resource(url + ':email/', {email: '@email'}, {
            //also define update method
            'update': { method:'PUT' }
        }),
        q: $resource(url, {
            limit: '@limit',
            offset: '@offset',
            fleets__id: '@fleet_id'
        }, {'get': {method: 'GET'}}),
        getDevicesForFleet: function (fleetIds, callback) {
            this.q.get({
                fleets__id__in: fleetIds,
                limit: config.get('device_page_limit')
            }, function (data) {
                if (callback) {
                    callback(data);
                }
            });
        }
    };
});

angular.module('homepage.devices').controller('deviceController', function($scope) {
    var self = this;
}); 