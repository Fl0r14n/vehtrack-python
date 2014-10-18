'use strict';

var app = angular.module('app', ['dgAuth', 'ngRoute', 'ui.bootstrap', 'controller', 'service', 'filter', 'directive']);

app.config(['$routeProvider', '$logProvider', function($routeProvider, $logProvider) {
    $logProvider.debugEnabled(true);
    $routeProvider.when('/', {
        templateUrl: '/static/html/main.html',
        controller: 'MainController'
    }).otherwise({
        redirectTo: '/'
    });
}]);

app.config(['dgAuthServiceProvider', function(dgAuthServiceProvider) {
    //number of allowed login attempts
    dgAuthServiceProvider.setLimit(5);
    //custom header to avoid the browser form
    dgAuthServiceProvider.setHeader('WWW-Authenticate-Vehtrack');

    dgAuthServiceProvider.setConfig({
        login: {
            method: 'POST',
            url: '/api/v1/user/'
        },
        logout: {
            method: 'POST',
            url: '/signout'
        }
    });

//    dgAuthServiceProvider.callbacks.login.push('LoginController', [function ($scope) {
//        return {
//            successful: function (response) {
//                $scope.$broadcast('LOGIN_SUCCESS', response);
//            },
//            error: function (response) {
//                $scope.$broadcast('LOGIN_ERROR', response);
//            },
//            required: function (response) {
//                $scope.$broadcast('LOGIN_REQUIRED', response);
//            },
//            limit: function (response) {
//                $scope.$broadcast('LOGIN_LIMIT', response);
//            }
//        };
//    }]);
//
//    dgAuthServiceProvider.callbacks.logout.push([function () {
//        return {
//            successful: function (response) {
//                $scope.$broadcast('LOGOUT_SUCCESS', response);
//            },
//            error: function (response) {
//                $scope.$broadcast('LOGOUT_ERROR', response);
//            },
//            required: function (response) {
//                $scope.$broadcast('LOGOUT_REQUIRED', response);
//            },
//            limit: function (response) {
//                $scope.$broadcast('LOGOUT_LIMIT', response);
//            }
//        };
//    }]);
}]);

app.run(['dgAuthService', function(dgAuthService) {
    //start digest auth service
    dgAuthService.start();
}]);
