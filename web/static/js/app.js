'use strict';

var app = angular.module('app', [
    //internal
    'controller', 'service', 'filter', 'directive',
    //external
    'dgAuth',
    'ngRoute',
    'ui.bootstrap',
    'ui.grid', 'ui.grid.cellNav', 'ui.grid.edit', 'ui.grid.resizeColumns', 'ui.grid.pinning', 'ui.grid.selection'
]);

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

app.run(['dgAuthService', '$rootScope', '$timeout', '$log', 'MessagingService',  function(dgAuthService, $rootScope, $timeout, $log, msgbus) {

    app.loginCallbacks.push(function () {
        return {
            successful: function (response) {
                $log.debug('LOGIN_SUCCESSFUL');
                msgbus.pub('LOGIN_SUCCESSFUL', response)
            },
            error: function (response) {
                $log.debug('LOGIN_ERROR');
                msgbus.pub('LOGIN_ERROR', response);
            },
            required: function (response) {
                $log.debug('LOGIN_REQUIRED');
                msgbus.pub('LOGIN_REQUIRED', response);
            },
            limit: function (response) {
                $log.debug('LOGIN_LIMIT');
                msgbus.pub('LOGIN_LIMIT', response);
            }
        };
    });

    app.logoutCallbacks.push(function () {
        return {
            successful: function (response) {
                $log.debug('LOGOUT_SUCCESSFUL');
                msgbus.pub('LOGOUT_SUCCESSFUL', response);
            },
            error: function (response) {
                $log.debug('LOGOUT_ERROR');
                msgbus.pub('LOGOUT_ERROR', response);
            },
            required: function (response) {
                $log.debug('LOGOUT_REQUIRED');
                msgbus.pub('LOGOUT_REQUIRED', response);
            },
            limit: function (response) {
                $log.debug('LOGOUT_LIMIT');
                msgbus.pub('LOGOUT_LIMIT', response);
            }
        };
    });

    //start digest auth service
    $timeout(function() {
        //start late to allow the login controller to load
        dgAuthService.start();
    }, 2000);
}]);
