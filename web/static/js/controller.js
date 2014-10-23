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
            deviceService.q.get({}, function (data) {
                self.devices = data.objects;
            });
        }
    });
}]);