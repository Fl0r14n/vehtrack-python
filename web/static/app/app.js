/* global angular */

'use strict';

angular.module('vehtrack', ['utils', 'homepage']).config(function($resourceProvider, restResourceProvider, $locationProvider) {
    $resourceProvider.defaults.stripTrailingSlashes = false;
    restResourceProvider.setApiPath('api/v1/');
    //html5 mode + base tag in index.html
    $locationProvider.html5Mode(true).hashPrefix('!');
});

angular.module('vehtrack').run(function($rootScope, config) {
    //get static url from django in ng-app with ng-init
    $rootScope.$watch('config', function() {
        config.set('static_url', $rootScope.config.static_url);        
        config.set('http_host', $rootScope.config.http_host);
        config.set('client_id', $rootScope.config.client_id);
        config.set('auth_path', $rootScope.config.auth_path);
        config.set('profile_uri', $rootScope.config.profile_uri);
        config.set('revoke_token_path', $rootScope.config.revoke_token_path);
        config.set('logout_path', $rootScope.config.logout_path);
    });
});