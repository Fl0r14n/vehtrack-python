'use strict';

var controllers = angular.module('controller', ['service']);

controllers.controller('MainController', [function($scope) {

}]);

controllers.controller('LoginController', function($modal) {

    this.open = function(size) {
        var modalWindow = $modal.open({
            templateUrl: 'login_modal.html',
            size: size,
            controller: function($scope, $modalInstance) {
                $scope.login = function() {
                    //TODO login
                    //pass the user to close method
                    $modalInstance.close();
                };

                $scope.cancel = function() {
                    $modalInstance.dismiss('cancel');
                }
            }
        });

        modalWindow.result.then(function() {

        }, function() {
            //dismiss modal
        })
    };

});


controllers.controller('DeviceController', ['DeviceService', function(deviceService) {
    var self = this;
    deviceService.q.get({}, function(data) {
        self.devices = data.objects;
    });
}]);