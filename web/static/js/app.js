'use strict';

var app = angular.module('app', ['controller', 'service', 'filter', 'directive', 'dgAuth', 'ngRoute', 'ui.bootstrap']);

app.config(['$routeProvider', '$logProvider', function($routeProvider, $logProvider) {
    $logProvider.debugEnabled(true);
    $routeProvider.when('/', {
        templateUrl: '/static/html/main.html',
        controller: 'MainController'
    }).otherwise({
        redirectTo: '/'
    });
}]);

app.loginCallbacks = [];
app.logoutCallbacks = [];

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

    dgAuthServiceProvider.callbacks.login = app.loginCallbacks;
    dgAuthServiceProvider.callbacks.logout = app.logoutCallbacks;
}]);

app.run(['dgAuthService', '$rootScope', function(dgAuthService, $rootScope) {

    app.loginCallbacks.push(function () {
        return {
            successful: function (response) {
                $rootScope.$broadcast('LOGIN_SUCCESS', response);
            },
            error: function (response) {
                $rootScope.$broadcast('LOGIN_ERROR', response);
            },
            required: function (response) {
                $rootScope.$broadcast('LOGIN_REQUIRED', response);
            },
            limit: function (response) {
                $rootScope.$broadcast('LOGIN_LIMIT', response);
            }
        };
    });

    app.logoutCallbacks.push(function () {
        return {
            successful: function (response) {
                $rootScope.$broadcast('LOGOUT_SUCCESS', response);
            },
            error: function (response) {
                $rootScope.$broadcast('LOGOUT_ERROR', response);
            },
            required: function (response) {
                $rootScope.$broadcast('LOGOUT_REQUIRED', response);
            },
            limit: function (response) {
                $rootScope.$broadcast('LOGOUT_LIMIT', response);
            }
        };
    });

    //start digest auth service
    dgAuthService.start();
}]);
