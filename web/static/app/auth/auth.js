/* global angular */

'use strict';

angular.module('auth', ['utils', 'oauth']).config(function() {
});

angular.module('auth').controller('authController', function($scope, config, $http, messagingService) {
    var self = this;
    self.template = config.get('static_url') + 'app/auth/oauth_button.html';
    self.site_url = config.get('http_host');
    self.redirect_uri = config.get('http_host');
    self.client_id = config.get('client_id');
    self.authorize_path = config.get('auth_path');
    self.profile_uri = config.get('profile_uri');
    self.revoke_token_path = config.get('revoke_token_path');
    self.logout_path = config.get('logout_path');

    function setToken(token) {
        if(!token) {
            delete $http.defaults.headers.common.Authorization;
            delete self.access_token;
        } else {
            self.access_token = token.access_token;
            $http.defaults.headers.common.Authorization = 'Bearer ' + self.access_token;
        }
    }

    $scope.$on('oauth:authorized', function(event, token) {
        setToken(token)
    });

    $scope.$on('oauth:loggedOut', function(event, token) {
        $http.get(self.logout_path);
        setToken(null);
        messagingService.pub(messagingService.DEFAULT_DOMAIN,'logout', event);
    });

    $scope.$on('oauth:expired', function(event) {
        setToken(null);
    });

    $scope.$on('oauth:profile', function(event, profile) {
        messagingService.pub(messagingService.DEFAULT_DOMAIN,'login', profile);
    });
});





