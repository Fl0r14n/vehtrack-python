/* global angular */

'use strict';

angular.module('homepage.navbar', ['utils', 'ui.bootstrap', 'homepage.devices']).config(function() {
});

angular.module('homepage.navbar').controller('navbarController', function($scope, config, messagingService) {
    var self = this;

    self.toogleManager = function() {
        if(self.toogleManagerVal === self.toogleManagerVals[0]) {
            self.toogleManagerVal = self.toogleManagerVals[1];
        } else {
            self.toogleManagerVal = self.toogleManagerVals[0];
        }
        messagingService.pub(messagingService.DEFAULT_DOMAIN, 'TOOGLE_MANAGER', self.toogleManagerVal === self.toogleManagerVals[0]);
    };
    self.toogleManagerVals = ['fa-chevron-up', 'fa-chevron-down'];
    self.toogleManagerVal = self.toogleManagerVals[0];

    self.devices = {};

    self.isDisabledMenuItems = function() {
        return angular.isUndefined(self.devices.list) ||  self.devices.list.length < 1;
    };

    self.journeysTab = function () {
        var tab = {
            id: 'journey-tab',
            name: 'Journeys',
            active: true,
            include: config.get('static_url')+'app/homepage/journey/journey.html'
        };
        self._newTab(tab);
    };

    self.positionsTab = function () {
        var tab = {
            id: 'position-tab',
            name: 'Positions',
            active: true,
            include: config.get('static_url')+'app/homepage/position/position.html'
        };
        self._newTab(tab);
    };

    self.logsTab = function () {
        var tab = {
            id: 'log-tab',
            name: 'Logs',
            active: true,
            include: config.get('static_url')+'app/homepage/log/log.html'
        };
        self._newTab(tab);
    };

    self._newTab = function(tab) {
        messagingService.pub(messagingService.DEFAULT_DOMAIN, 'TAB_ADD', tab);
        messagingService.pub(messagingService.DEFAULT_DOMAIN, 'TAB_SELECT', tab);
        messagingService.sub($scope, tab.id, 'OPTIONS_ON_LOAD', function(event, options) {
            options.devices.list = self.devices.list;
            options.devices.selected = self.devices.selected;
        });
    };

    messagingService.sub($scope, messagingService.DEFAULT_DOMAIN, 'devices', function(event, devices) {
        self.devices.list = devices;
    });

    messagingService.sub($scope, messagingService.DEFAULT_DOMAIN, 'device_selected', function(event, selected) {
        self.devices.selected = selected;
    });

    messagingService.sub($scope, messagingService.DEFAULT_DOMAIN, 'logout', function(event, profile) {
        self.devices = {};
    });
});