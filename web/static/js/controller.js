'use strict';

var controllers = angular.module('controller', ['service']);

controllers.controller('MainController', [function ($scope) {

}]);

controllers.controller('LoginController', ['$modal', 'dgAuthService', function ($modal, dgAuthService) {

    //open modal window function
    this.open = function (size) {
        var modalWindow = $modal.open({
            templateUrl: 'login_modal.html',
            size: size,
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

                $scope.$on('LOGIN_SUCCESS', function(event, data) {
                    $scope.isFailedLogin = false;
                    $scope.isLimitLogin = false;
                    $modalInstance.close();
                });

                $scope.$on('LOGIN_ERROR', function(event, data) {
                    $scope.isFailedLogin = true;
                });

                $scope.$on('LOGIN_LIMIT', function(event, data) {
                    $scope.isLimitLogin = true;
                });

                //-----------------------------------------------------------

                $scope.logout = function() {
                    dgAuthService.signout();
                };

                $scope.$on('LOGOUT_SUCCESS', function(event, data) {
                    $modalInstance.close();
                });

                $scope.$on('LOGOUT_ERROR', function(event, data) {

                });

                $scope.$on('LOGOUT_LIMIT', function(event, data) {

                });

            }
        });

        modalWindow.result.then(function (obj) {
            //on close
        }, function () {
            //on dismiss
        })
    };
}]);


controllers.controller('DeviceController', ['DeviceService', function (deviceService) {
    var self = this;
    deviceService.q.get({}, function (data) {
        self.devices = data.objects;
    });
}]);