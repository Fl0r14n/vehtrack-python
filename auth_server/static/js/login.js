/* global angular */

'use strict';

angular.module('vehtrackLogin', ['ng-backstretch', 'utils']).controller('loginController', function($scope) {
    $scope.form = {
        username: '',
        password: ''
    }
});

angular.module('utils', []).directive('focus', function ($timeout) {    
    return function (scope, element, attrs) {
        $timeout(function () {                        
            element[0].focus();
        }, 30);
    };
});


