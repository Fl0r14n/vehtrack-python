'use strict';

var controllers = angular.module('controller', ['service']);

controllers.controller('MainController', [function ($scope) {

}]);

controllers.controller('LoginController', ['$scope', '$modal', 'dgAuthService', function ($scope, $modal, dgAuthService) {

    var self = this;

    //open modal window function
    self.login = function (size) {
        var modalWindow = $modal.open({
            templateUrl: 'login_modal.html',
            size: size,
            resolve: {
                //object of functions that will be passed to modal controller as args
            },
            controller: function ($scope, $modalInstance) {
                $scope.isFailedLogin = false;
                $scope.isLimitLogin = false;

                $scope.login = function (user) {
                    dgAuthService.setCredentials(user.email, user.password);
                    dgAuthService.signin();
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };

                $scope.$on('LOGIN_SUCCESSFUL', function (event, data) {
                    $scope.isFailedLogin = false;
                    $scope.isLimitLogin = false;
                    $modalInstance.close();
                });

                $scope.$on('LOGIN_ERROR', function (event, data) {
                    $scope.isFailedLogin = true;
                });

                $scope.$on('LOGIN_LIMIT', function (event, data) {
                    $scope.isLimitLogin = true;
                });
            }
        });

        modalWindow.result.then(function (obj) {
            //on close do something
        }, function () {
            //on dismiss do something
        })
    };

    self.logout = function () {
        dgAuthService.signout();
    };

    self.showLogin = true;

    $scope.$on('LOGIN_SUCCESSFUL', function (event, data) {
        self.showLogin = false;
    });

    $scope.$on('LOGIN_REQUIRED', function (event, data) {
        self.showLogin = true;
    });

    $scope.$on('LOGOUT_SUCCESSFUL', function (event, data) {
        self.showLogin = true;
    });

    $scope.$on('LOGOUT_ERROR', function (event, data) {
        self.showLogin = true;
    });
}]);


controllers.controller('DeviceController', ['$scope', 'DeviceService', function ($scope, deviceService) {
    var self = this;
    self.init = false;
    self.devices = null;

    $scope.$on('LOGIN_SUCCESSFUL', function (event, data) {
        if (!self.init) {
            self.init = true;
            //TODO get for fleet
            deviceService.q.get({}, function (data) {
                self.devices = data.objects;
            });
        }
    });

    self.getDevicesForFleet = function(fleetId, active, callback) {
        active = typeof active !== 'undefined' ? active : true;
        deviceService.q.get({
            fleet__id: fleetId,
            active: active
        }, function(data) {
           if(callback) {
               callback(data);
           }
        });
    };
}]);

controllers.controller('JourneyController', ['$scope', '$filter', 'JourneyService', function($scope, $filter, journeyService) {
    var self = this;
    self.init = false;
    self.journeys = null;

    $scope.$on('LOGIN_SUCCESSFUL', function(event, data) {
        if(!self.init) {
            self.init = true;
            //get last week journeys for device
            var deviceId = null;
            self.lastWeekJourneysForDevice(deviceId, function(data) {
                self.journeys = data.objects;
            });
        }
    });

    self.getJourneysForDevice = function(deviceId, startTimestamp, stopTimestamp, callback) {
        journeyService.q.get({
            device__id: deviceId,
            start_timestamp__gte: startTimestamp,
            stop_timestamp__lte: stopTimestamp
        }, function(data) {
            if(callback) {
                callback(data);
            }
        });
    };

    self.lastWeekJourneysForDevice = function(deviceId, callback) {
        var stopTimestamp = Date.now(); //ms
        var startTimestamp = stopTimestamp -  604800000; //ms
        return self.getJourneysForDevice(deviceId, startTimestamp, stopTimestamp, callback);
    };
}]);