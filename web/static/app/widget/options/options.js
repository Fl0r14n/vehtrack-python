/* global angular */

'use strict';

angular.module('widget.options', ['utils', 'ui.bootstrap']).config(function() {
});

angular.module('widget.options').controller('optionController', function($scope, dateFilter, messagingService) {
    var self = this;

    self.isCollapsed = false;

    self.devices = {
        show: false,
        readonly: false,
        list: [],
        selected: undefined
    };

    self.journeys = {
        show: false,
        readonly: false,
        list: [],
        selected: undefined
    };

    self.startDate = {
        show: false,
        readonly: false,
        date: Date.now() - 86400000,
        opened: false,
        toogle: function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            this.opened = !this.opened;
        },
        dateString: function () {
            return dateFilter(this.date, 'yyyy-MM-ddThh:mm:ss');
        }
    };

    self.stopDate = {
        show: false,
        readonly: false,
        date: Date.now(),
        opened: false,
        toogle: function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            this.opened = !this.opened;
        },
        dateString: function () {
            return dateFilter(this.date, 'yyyy-MM-ddThh:mm:ss');
        }
    };

    self.submit = {
        show: true,
        trigger: function() {
            messagingService.pub($scope.domain, 'OPTIONS_SUBMITTED', {
                devices: self.devices,
                journeys: self.journeys,
                startDate: self.startDate,
                stopDate: self.stopDate
            });
        }
    };

    messagingService.pub($scope.domain, 'OPTIONS_ON_LOAD', {
        devices: self.devices,
        journeys: self.journeys,
        startDate: self.startDate,
        stopDate: self.stopDate,
        submit: self.submit
    });
});