'use strict';

var services = angular.module('service', ['ngResource']);

services.api = '/api/v1/';

services.endpoint = function(resource) {
    return services.api+resource+'/';
};

services.schema = function(endpoint) {
    return services.endpoint(endpoint)+'schema/';
};

services.factory('Account', function($resource) {
    var url = services.endpoint('account');
    return {
        id: $resource(url+':id/', {id:'@id'}),
        q: $resource(url, {
            limit: '@limit',
            offset: '@offset'
        }, {'get': {method:'GET'}})
    }
});

services.factory('User', function($resource) {
    var url = services.endpoint('user');
    return {
        id: $resource(url+':id/', {id:'@id'}),
        q: $resource(url, {
            limit: '@limit',
            offset: '@offset',
            fleet__id: '@fleet_id'
        }, {'get': {method:'GET'}})
    }
});

services.factory('Device', function($resource) {
    var url = services.endpoint('device');
    return {
        id: $resource(url+':id/', {id:'@id'}),
        q: $resource(url, {
            limit: '@limit',
            offset: '@offset',
            fleet__id: '@fleet_id'
        }, {'get': {method:'GET'}})
    }
});

services.factory('Fleet', function($resource) {
    var url = services.endpoint('fleet');
    return {
        id: $resource(url+':id/', {id:'@id'}),
        q: $resource(url, {
            limit: '@limit',
            offset: '@offset'
        }, {'get': {method:'GET'}})
    }
});

services.factory('Journey', function($resource) {
    var url = services.endpoint('journey');
    return {
        id: $resource(url+':id/', {id:'@id'}),
        q: $resource(url, {
            limit: '@limit',
            offset: '@offset',
            device__id: '@device_id',
            start_timestamp__gte: '@start_timestamp',
            stop_timestamp__lte: '@stop_timestamp'
        }, {'get': {method:'GET'}})
    }
});

services.factory('Position', function($resource) {
    var url = services.endpoint('position');
    return {
        id: $resource(url+':id/', {id:'@id'}),
        q: $resource(url, {
            limit: '@limit',
            offset: '@offset',
            device__id: '@device_id',
            journey_id: '@journey_id',
            timestamp__gte: '@start_timestamp',
            timestamp__lte: '@stop_timestamp'
        }, {'get': {method:'GET'}})
    }
});

services.factory('Log', function($resource) {
    var url = services.endpoint('log');
    return {
        id: $resource(url+':id/', {id:'@id'}),
        q: $resource(url, {
            limit: '@limit',
            offset: '@offset',
            device__id: '@device_id',
            journey_id: '@journey_id',
            timestamp__gte: '@start_timestamp',
            timestamp__lte: '@stop_timestamp',
            level: '@level'
        }, {'get': {method:'GET'}})
    }
});
