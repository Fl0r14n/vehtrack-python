'use strict';

var controllers = angular.module('controller', ['service']);

controllers.controller('MainController', function($scope) {

});

controllers.controller('DeviceController', ['DeviceService', function(deviceService) {
    var self = this;
    deviceService.q.get({}, function(data) {
        self.devices = data.objects;
    });
}]);