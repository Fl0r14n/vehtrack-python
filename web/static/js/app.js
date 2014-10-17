'use strict';

var app = angular.module('app',['ngRoute', 'ui.bootstrap', 'controller', 'service', 'filter', 'directive']);

app.config(['$routeProvider', '$logProvider', function($routeProvider, $logProvider) {
    $logProvider.debugEnabled(true);
    $routeProvider.when('/', {
        templateUrl: '/static/html/main.html',
        controller: 'MainController'
    }).otherwise({
        redirectTo: '/'
    });
}]);
