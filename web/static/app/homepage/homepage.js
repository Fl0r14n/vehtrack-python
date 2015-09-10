/* global angular */

'use strict';

angular.module('homepage', [
    'utils',
    'homepage.devices',
    'homepage.fleets',
    'homepage.footer',
    'homepage.header',
    'homepage.journeys',
    'homepage.logs',
    'homepage.positions',
    'homepage.users'
]).config(function () {
});

angular.module('homepage').controller('homepageController', function ($scope, config, messagingService, userService) {
    var self = this;
    $scope.domain = messagingService.DEFAULT_DOMAIN;
    self.header_url = config.get('static_url')+'app/homepage/header/header.html';
    self.footer_url = config.get('static_url')+'app/homepage/footer/footer.html';
    self.fleet_url = config.get('static_url')+'app/homepage/fleet/fleet.html';


    messagingService.sub($scope, messagingService.DEFAULT_DOMAIN, 'login', function(event, profile) {
        userService.getUserDetail(profile.email, function(user) {
            $scope.user = user;
            messagingService.pub('','user', user);
        });
    });

    messagingService.sub($scope, messagingService.DEFAULT_DOMAIN, 'logout', function(event, profile) {
        $scope.user = undefined;
    });
});
