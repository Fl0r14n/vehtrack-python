/* global angular */

'use strict';

angular.module('widget.map', ['utils', 'uiGmapgoogle-maps']).config(function (uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyAtdQ7J2vsDwdw3xnIPapseiggP2wHsVb4',
        //v: 'exp',
        v: '3.17',
        libraries: 'weather,geometry,visualization,places',
        sensor: 'false',
        language: 'en'
    });
});

angular.module('widget.map').controller('mapController', function ($scope, messagingService) {

    var self = this;
    self.map = {
        center: {
            latitude: 34.04924594193164,
            longitude: -118.24104309082031
        },
        pan: true,
        zoom: 13,
        options: {
            streetViewControl: true,
            //panControl: false,
            maxZoom: 20,
            minZoom: 3,
            rotateControl: true,
            scaleControl: true
        }
    };
    //to show the weather this is a bug
    self.weather = false;

    self.markers = [];
    self.polylines = [];

    self.guid = function () {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    };

    self.addMarkers = function (markersArray) {
        var _markers = [];
        for (var i = 0; i < markersArray.length; i++) {
            _markers.push({
                id: self.guid(),
                show: false,
                onClick: function (self) {
                    self.show = !self.show;
                },
                latitude: markersArray[i].latitude,
                longitude: markersArray[i].longitude,
                title: markersArray[i].title,
                icon: markersArray[i].icon,
                events: markersArray[i].events,
                options: markersArray[i].options
            });
        }
        self.markers = self.markers.concat(_markers);
    };

    self.addPolyline = function (coordsArray) {
        self.polylines.push({
            id: self.guid(),
            path: coordsArray,
            stroke: {
                color: '#6060FB',
                weight: 3
            },
            editable: false,
            draggable: false,
            geodesic: true,
            visible: true
        });
    };

    messagingService.sub($scope, $scope.domain, 'MAP_INIT', function (event, data) {
        //clear stuff first
        self.markers = [];
        self.polylines = [];
        if (!angular.isUndefined(data.center)) {
            self.map.center = data.center;
        }
        if (!angular.isUndefined(data.zoom)) {
            self.map.zoom = data.zoom;
        }
        if (!angular.isUndefined(data.options)) {
            self.map.options = data.options;
        }
    });

    messagingService.sub($scope, $scope.domain, 'MAP_ADD_MARKERS', function (event, data) {
        self.addMarkers(data);
    });

    messagingService.sub($scope, $scope.domain, 'MAP_ADD_POLYLINE', function (event, data) {
        self.addPolyline(data);
    });
});