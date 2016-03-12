/* global angular */

'use strict';

angular.module('homepage.users', ['utils']).config(function() {
});

angular.module('homepage.users').factory('userService', function (restResource, config) {
    var $resource = restResource.$resource;
    var url = restResource.endpoint('user');
    return {
        id: $resource(url + ':email/', {email: '@email'}, {
            //also define update method
            'update': { method:'PUT' }
        }),
        q: $resource(url, {
            limit: '@limit',
            offset: '@offset',
            fleet__id: '@fleet_id'
        }, {'get': {method: 'GET'}}),
        getUserDetail: function (email, callback) {
            this.id.get({
                email: email,
                limit: config.get('user_page_limit')
            }, function (data) {
                if (callback) {
                    callback(data);
                }
            });
        },
        getUsersForFleet: function(fleetId, callback) {
            this.q.get({
                fleets__id: fleetId,
                limit: config.get('user_page_limit')
            }, function(data) {
                if(callback) {
                    callback(data);
                }
            });
        }
    };
});

angular.module('homepage.users').controller('userController', function($scope) {
    var self = this;
}); 