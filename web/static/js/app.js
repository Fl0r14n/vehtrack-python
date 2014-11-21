'use strict';

var app = angular.module('app', [
    //internal
    'controller', 'service', 'filter', 'directive',
    //external
    'ngRoute',
    'ngTouch',
    'ngAnimate',
    'dgAuth',
    'ui.bootstrap',
    'uiGmapgoogle-maps',
    'ui.grid', 'ui.grid.cellNav', 'ui.grid.edit', 'ui.grid.resizeColumns', 'ui.grid.pinning', 'ui.grid.selection',
    'ui.grid.exporter', 'ui.grid.moveColumns'
]);

app.config(['$logProvider', function ($logProvider) {
    $logProvider.debugEnabled(true);
}]);

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: '/static/html/main.html',
        controller: 'MainController'
    }).otherwise({
        redirectTo: '/'
    });
}]);

app.config(['$resourceProvider', function ($resourceProvider) {
    //!do not remove tailing / from urls
    $resourceProvider.defaults.stripTrailingSlashes = false;
}]);

app.config(['uiGmapGoogleMapApiProvider', function (uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyDaGxMxpzdfIC3evAwuxd_E2Y7H0H_EMw0',
        v: '3.17',
        libraries: 'weather,geometry,visualization'
    });
}]);


app.loginCallbacks = [];
app.logoutCallbacks = [];

app.config(['dgAuthServiceProvider', function (dgAuthServiceProvider) {
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

app.run(['$timeout', '$log', 'MessagingService', 'dgAuthService', function ($timeout, $log, msgbus, dgAuthService) {

    app.loginCallbacks.push(function () {
        return {
            successful: function (response) {
                $log.debug('LOGIN_SUCCESSFUL');
                msgbus.pub(msgbus.DEFAULT_DOMAIN, 'LOGIN_SUCCESSFUL', response)
            },
            error: function (response) {
                $log.debug('LOGIN_ERROR');
                msgbus.pub(msgbus.DEFAULT_DOMAIN, 'LOGIN_ERROR', response);
            },
            required: function (response) {
                $log.debug('LOGIN_REQUIRED');
                msgbus.pub(msgbus.DEFAULT_DOMAIN, 'LOGIN_REQUIRED', response);
            },
            limit: function (response) {
                $log.debug('LOGIN_LIMIT');
                msgbus.pub(msgbus.DEFAULT_DOMAIN, 'LOGIN_LIMIT', response);
            }
        };
    });

    app.logoutCallbacks.push(function () {
        return {
            successful: function (response) {
                $log.debug('LOGOUT_SUCCESSFUL');
                msgbus.pub(msgbus.DEFAULT_DOMAIN, 'LOGOUT_SUCCESSFUL', response);
            },
            error: function (response) {
                $log.debug('LOGOUT_ERROR');
                msgbus.pub(msgbus.DEFAULT_DOMAIN, 'LOGOUT_ERROR', response);
            },
            required: function (response) {
                $log.debug('LOGOUT_REQUIRED');
                msgbus.pub(msgbus.DEFAULT_DOMAIN, 'LOGOUT_REQUIRED', response);
            },
            limit: function (response) {
                $log.debug('LOGOUT_LIMIT');
                msgbus.pub(msgbus.DEFAULT_DOMAIN, 'LOGOUT_LIMIT', response);
            }
        };
    });

    //start digest auth service
    $timeout(function () {
        //start late to allow the login controller to load
        dgAuthService.start();
    }, 2000);
}]);
