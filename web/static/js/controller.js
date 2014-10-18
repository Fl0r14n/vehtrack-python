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

                this.isFailedLogin = false;
                this.isFailedAttempts = false;

                $scope.submit = function (user) {
                    dgAuthService.setCredentials(user.username, user.password);
                    dgAuthService.signin();
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };

                $scope.$on('LOGIN_SUCCESS', function(event, data) {
                    console.log('LOGIN_SUCCESS');
                    console.log(event);
                    console.log(data);
                    $modalInstance.close();
                });

                $scope.$on('LOGIN_ERROR', function(event, data) {
                    console.log('LOGIN_ERROR');
                    console.log(event);
                    console.log(data);
                    this.isFailedAttempts = true;
                });

                $scope.$on('LOGIN_LIMIT', function(event, data) {
                    console.log('LOGIN_LIMIT');
                    console.log(event);
                    console.log(data);
                    this.isFailedAttempts = true;
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