'use strict';

var app = angular.module('app', ['controller', 'service', 'filter', 'directive', 'dgAuth', 'ngRoute', 'ui.bootstrap']);

app.config(['$logProvider', function($logProvider) {
    $logProvider.debugEnabled(true);
}]);

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: '/static/html/main.html',
        controller: 'MainController'
    }).otherwise({
        redirectTo: '/'
    });
}]);

app.config(['$resourceProvider', function($resourceProvider) {
    //!do not remove tailing / from urls
    $resourceProvider.defaults.stripTrailingSlashes = false;
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
            url: '/login/'
        },
        logout: {
            method: 'POST',
            url: '/logout/'
        }
    });

    dgAuthServiceProvider.callbacks.login = app.loginCallbacks;
    dgAuthServiceProvider.callbacks.logout = app.logoutCallbacks;
}]);

app.run(['dgAuthService', '$rootScope', '$timeout', '$log',  function(dgAuthService, $rootScope, $timeout, $log) {

    app.loginCallbacks.push(function () {
        return {
            successful: function (response) {
                $log.debug('LOGIN_SUCCESSFUL');
                $rootScope.$broadcast('LOGIN_SUCCESSFUL', response);
            },
            error: function (response) {
                $log.debug('LOGIN_ERROR');
                $rootScope.$broadcast('LOGIN_ERROR', response);
            },
            required: function (response) {
                $log.debug('LOGIN_REQUIRED');
                $rootScope.$broadcast('LOGIN_REQUIRED', response);
            },
            limit: function (response) {
                $log.debug('LOGIN_LIMIT');
                $rootScope.$broadcast('LOGIN_LIMIT', response);
            }
        };
    });

    app.logoutCallbacks.push(function () {
        return {
            successful: function (response) {
                $log.debug('LOGOUT_SUCCESSFUL');
                $rootScope.$broadcast('LOGOUT_SUCCESSFUL', response);
            },
            error: function (response) {
                $log.debug('LOGOUT_ERROR');
                $rootScope.$broadcast('LOGOUT_ERROR', response);
            },
            required: function (response) {
                $log.debug('LOGOUT_REQUIRED');
                $rootScope.$broadcast('LOGOUT_REQUIRED', response);
            },
            limit: function (response) {
                $log.debug('LOGOUT_LIMIT');
                $rootScope.$broadcast('LOGOUT_LIMIT', response);
            }
        };
    });

    //start digest auth service
    $timeout(function() {
        //start late to allow the login controller to load
        dgAuthService.start();
    }, 2000);
}]);
