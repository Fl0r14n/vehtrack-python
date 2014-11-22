'use strict';

var controllers = angular.module('controller', ['service']);

controllers.controller('HeaderController', ['$scope', function ($scope) {

}]);

controllers.controller('FooterController', ['$scope', function ($scope) {

}]);

controllers.controller('MainController', ['$scope', 'MessagingService', function ($scope, msgbus) {
    $scope.user = null;
    $scope.domain = msgbus.DEFAULT_DOMAIN;

    msgbus.sub($scope, $scope.domain, 'LOGIN_SUCCESSFUL', function (event, data) {
        $scope.user = data.data;
    });

    msgbus.sub($scope, $scope.domain, 'LOGOUT_SUCCESSFUL', function (event, data) {
        $scope.user = null;
    });
}]);

//-------------------------------------------------------------------------

controllers.controller('LoginController', ['$scope', '$modal', 'dgAuthService', 'MessagingService', function ($scope, $modal, dgAuthService, msgbus) {

    var self = this;

    //open modal window function
    self.login = function (size) {
        var modalWindow = $modal.open({
            templateUrl: 'login_modal.html',
            size: size,
            resolve: {
                //object of functions that will be passed to modal controller as args
            },
            controller: function ($scope, $modalInstance) {
                $scope.domain = msgbus.DEFAULT_DOMAIN;
                $scope.isFailedLogin = false;
                $scope.isLimitLogin = false;

                $scope.login = function (user) {
                    dgAuthService.setCredentials(user.email, user.password);
                    dgAuthService.signin();
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };

                msgbus.sub($scope, $scope.domain, 'LOGIN_SUCCESSFUL', function (event, data) {
                    $scope.isFailedLogin = false;
                    $scope.isLimitLogin = false;
                    $modalInstance.close();
                });

                msgbus.sub($scope, $scope.domain, 'LOGIN_ERROR', function (event, data) {
                    $scope.isFailedLogin = true;
                });

                msgbus.sub($scope, $scope.domain, 'LOGIN_LIMIT', function (event, data) {
                    $scope.isLimitLogin = true;
                });
            }
        });

        modalWindow.result.then(function (obj) {
            //on close do something
        }, function () {
            //on dismiss do something
        })
    };

    self.logout = function () {
        dgAuthService.signout();
    };

    self.setLoginVisible = function () {
        self.showLogin = true;
        self.loginName = null;
    };
    self.setLoginVisible();

    msgbus.sub($scope, $scope.domain, 'LOGIN_SUCCESSFUL', function (event, data) {
        self.showLogin = false;
        self.loginName = data.data.name;
    });

    msgbus.sub($scope, $scope.domain, 'LOGIN_REQUIRED', function (event, data) {
        self.setLoginVisible();
    });

    msgbus.sub($scope, $scope.domain, 'LOGOUT_SUCCESSFUL', function (event, data) {
        self.setLoginVisible();
    });

    msgbus.sub($scope, $scope.domain, 'LOGOUT_ERROR', function (event, data) {
        self.setLoginVisible();
    });
}]);

controllers.controller('NavbarController', ['$scope', 'MessagingService', 'DeviceService', function ($scope, msgbus, deviceService) {
    var self = this;
    self.devices = null;
    self.getDevices = function (user, callback) {
        if (user != null) {
            var fleets = $scope.user.fleets;

            var fleetIds = [];
            for (var i = 0; i < fleets.length; i++) {
                fleetIds.push(fleets[i].id);
            }
            deviceService.getDevicesForFleet(fleetIds, function (data) {
                self.devices = data.objects;
                if (callback) {
                    callback(self.devices);
                    callback(self.devices);
                }
            });
        }
    };

    self.lastDayJourneysTab = function (device) {
        var tabId = 'lastDayJourneys_' + device.email;
        self._journeyTab(tabId, 'Last Day Journeys for ' + device.serial);
        self._submit_JourneyQuery(tabId, device, 86400000);
    };

    //TODO should be this week
    self.lastWeekJourneysTab = function (device) {
        var tabId = 'lastWeekJourneys_' + device.email;
        self._journeyTab(tabId, 'Last Week Journeys for ' + device.serial);
        self._submit_JourneyQuery(tabId, device, 604800000);
    };

    //TODO should be this month
    self.lastMonthJourneysTab = function (device) {
        var tabId = 'lastMonthJourneys_' + device.email;
        self._journeyTab(tabId, 'Last Month Journeys for ' + device.serial);
        self._submit_JourneyQuery(tabId, device, 2419200000);
    };

    //TODO should be past 3 months
    self.last3MonthJourneysTab = function (device) {
        var tabId = 'last3MonthJourneys_' + device.email;
        self._journeyTab(tabId, 'Last 3 Month Journeys for ' + device.serial);
        self._submit_JourneyQuery(tabId, device, 7257600000);
    };

    self.journeysTab = function (user) {
        var tabId = 'journey-tab';
        self.getDevices(user);
        self._journeyTab(tabId, 'Journeys');
        self._setDefaultOptions(tabId);
    };

    self.positionsTab = function (user) {
        var tabId = 'position-tab';
        self.getDevices(user);
        var tab = {
            id: tabId,
            name: 'Positions',
            active: true,
            include: '/static/html/tabs/position.html'
        };
        self._newTab(tab);
        self._setDefaultOptions(tabId);
    };

    self.logsTab = function (user) {
        var tabId = 'log-tab';
        self.getDevices(user);
        var tab = {
            id: tabId,
            name: 'Logs',
            active: true,
            include: '/static/html/tabs/log.html'
        };
        self._newTab(tab);
        self._setDefaultOptions(tabId);
    };

    self.profileTab = function (user) {
        var tabId = 'profile-tab';
        var tab = {
            id: tabId,
            name: 'Profile',
            active: true,
            include: '/static/html/tabs/user.html'
        };
        self._newTab(tab);
    };

    self.usersTab = function (user) {
        var tabId = 'user-tab';
        var tab = {
            id: tabId,
            name: 'Users',
            active: true,
            include: '/static/html/tabs/user.html'
        };
        self._newTab(tab);
    };

    self.devicesTab = function (user) {
        var tabId = 'device-tab';
        var tab = {
            id: tabId,
            name: 'Devices',
            active: true,
            include: '/static/html/tabs/device.html'
        };
        self._newTab(tab);
    };

    self.fleetsTab = function (user) {
        var tabId = 'fleet-tab';
        var tab = {
            id: tabId,
            name: 'Fleets',
            active: true,
            include: '/static/html/tabs/fleet.html'
        };
        self._newTab(tab);
    };

    //----------------------------------------------------------

    self._journeyTab = function (id, name, period) {
        var tab = {
            id: id,
            name: name,
            active: true,
            include: '/static/html/tabs/journey.html'
        };
        self._newTab(tab);
    };

    self._newTab = function (tab) {
        msgbus.pub($scope.domain, 'TAB_ADD', tab);
        msgbus.pub($scope.domain, 'TAB_SELECT', tab);
    };

    self._submit_JourneyQuery = function (tabId, device, period) {
        msgbus.sub($scope, tabId, 'OPTIONS_ON_LOAD', function () {
            msgbus.pub(tabId, 'OPTIONS_INIT', {
                devices: {
                    selected: device,
                    readonly: true
                },
                startDate: {
                    readonly: true,
                    date: Date.now() - period
                },
                stopDate: {
                    readonly: true
                }
            });
            msgbus.pub(tabId, 'OPTIONS_SUBMIT')
        });
    };

    self._setDefaultOptions = function (tabId) {
        msgbus.sub($scope, tabId, 'OPTIONS_ON_LOAD', function () {
            msgbus.pub(tabId, 'OPTIONS_INIT', {
                devices: {
                    list: self.devices
                },
                journeys: {
                    //it will be filled when search is executed
                    readonly: true
                },
                startDate: {
                    date: Date.now() - 86400000
                }
            });
        });
    }
}]);

controllers.controller('OptionsController', ['$scope', 'MessagingService', 'dateFilter', function ($scope, msgbus, dateFilter) {
    var self = this;

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

    self.submit = function () {
        msgbus.pub($scope.domain, 'OPTIONS_SUBMITTED', {
            devices: {
                show: self.devices.show,
                readonly: self.devices.readonly,
                selected: self.devices.selected
            },
            journeys: {
                show: self.journeys.show,
                readonly: self.journeys.readonly,
                selected: self.journeys.selected
            },
            startDate: {
                show: self.startDate.show,
                readonly: self.startDate.readonly,
                date: self.startDate.date,
                dateString: self.startDate.dateString
            },
            stopDate: {
                show: self.stopDate.show,
                readonly: self.stopDate.readonly,
                date: self.stopDate.date,
                dateString: self.stopDate.dateString
            }
        });
    };

    msgbus.sub($scope, $scope.domain, 'OPTIONS_SUBMIT', function () {
        self.submit();
    });

    msgbus.sub($scope, $scope.domain, 'OPTIONS_INIT', function (event, data) {
        //devices
        if (!angular.isUndefined(data.devices)) {
            if (!angular.isUndefined(data.devices.show)) {
                self.devices.show = data.devices.show;
            }
            if (!angular.isUndefined(data.devices.readonly)) {
                self.devices.readonly = data.devices.readonly;
            }
            if (!angular.isUndefined(data.devices.list)) {
                self.devices.list = data.devices.list;
            }
            if (!angular.isUndefined(data.devices.selected)) {
                self.devices.selected = data.devices.selected;
            }
        }
        if (!angular.isUndefined(data.journeys)) {
            //journeys
            if (!angular.isUndefined(data.journeys.show)) {
                self.journeys.show = data.journeys.show;
            }
            if (!angular.isUndefined(data.journeys.readonly)) {
                self.journeys.readonly = data.journeys.readonly;
            }
            if (!angular.isUndefined(data.journeys.list)) {
                self.journeys.list = data.journeys.list;
            }
            if (!angular.isUndefined(data.journeys.selected)) {
                self.journeys.selected = data.journeys.selected;
            }
        }
        //start date
        if (!angular.isUndefined(data.startDate)) {
            if (!angular.isUndefined(data.startDate.show)) {
                self.startDate.show = data.startDate.show;
            }
            if (!angular.isUndefined(data.startDate.readonly)) {
                self.startDate.readonly = data.startDate.readonly;
            }
            if (!angular.isUndefined(data.startDate.date)) {
                self.startDate.date = data.startDate.date;
            }
        }
        //stop date
        if (!angular.isUndefined(data.stopDate)) {
            if (!angular.isUndefined(data.stopDate.show)) {
                self.stopDate.show = data.stopDate.show;
            }
            if (!angular.isUndefined(data.stopDate.readonly)) {
                self.stopDate.readonly = data.stopDate.readonly;
            }
            if (!angular.isUndefined(data.stopDate.date)) {
                self.stopDate.date = data.stopDate.date;
            }
        }
    });

    msgbus.pub($scope.domain, 'OPTIONS_ON_LOAD', {});
}]);

controllers.controller('TableController', ['$scope', 'MessagingService', '$http', function ($scope, msgbus, $http) {
    var self = this;

    self.table = {
        data: [],
        enableColumnResizing: true,
        enableCellEdit: false,
        enableFiltering: true,
        enableGridMenu: true,
        enableRowSelection: true,
        enableSelectAll: true,
        multiSelect: true,
        externalScope: {},
        columnDefs: [],
        getRowId: function (row) {
            return row.id;
        },
        addColumnDefinition: function (name, displayName, width, editable, template, relatedField) {
            this.columnDefs.push({
                name: name,
                displayName: displayName,
                width: width,
                enableCellEdit: editable,
                cellTemplate: template,
                field: relatedField
            })
        },
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        },
        exporterPdfDefaultStyle: {fontSize: 9},
        exporterPdfTableStyle: {margin: [30, 30, 30, 30]},
        exporterPdfTableHeaderStyle: {fontSize: 10, bold: true, italics: true, color: 'red'},
        //exporterPdfHeader: "My Header",
        exporterPdfHeaderStyle: { fontSize: 22, bold: true },
        exporterPdfOrientation: 'landscape',
        exporterPdfPageSize: 'A4'
        //exporterPdfMaxGridWidth: 500
    };

    msgbus.sub($scope, $scope.domain, 'TABLE_INIT', function (event, data) {
        if (!angular.isUndefined(data.data)) {
            self.table.data = data.data;
        }
        if (!angular.isUndefined(data.columnDefs)) {
            self.table.columnDefs = data.columnDefs;
        }
        if (!angular.isUndefined(data.externalScope)) {
            self.table.externalScope = data.externalScope;
        }
        if (!angular.isUndefined(data.enableColumnResizing)) {
            self.table.enableColumnResizing = data.enableColumnResizing;
        }
        if (!angular.isUndefined(data.enableFiltering)) {
            self.table.enableFiltering = data.enableFiltering;
        }
    });

    msgbus.pub($scope.domain, 'TABLE_ON_LOAD', {});
}]);

controllers.controller('MapController', ['$scope', 'MessagingService', function ($scope, msgbus) {
    var self = this;
    self.map = {
        center: {
            latitude: 34.04924594193164,
            longitude: -118.24104309082031
        },
        zoom: 13,
        options: {
            streetViewControl: true,
            panControl: false,
            maxZoom: 20,
            minZoom: 3
        }
    };
    //to show the weather this is a bug
    self.show = false;

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
                onClick: function () {
                    this.show = !this.show;
                },
                latitude: markersArray[i].latitude,
                longitude: markersArray[i].longitude,
                title: markersArray[i].title,
                icon: markersArray[i].icon,
                events: markersArray[i].events
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

    msgbus.sub($scope, $scope.domain, 'MAP_INIT', function (event, data) {
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

    msgbus.sub($scope, $scope.domain, 'MAP_ADD_MARKERS', function (event, data) {
        self.addMarkers(data);
    });

    msgbus.sub($scope, $scope.domain, 'MAP_ADD_POLYLINE', function (event, data) {
        self.addPolyline(data)
    });
}]);

//-----------------------------------------------------------------------

controllers.controller('UserController', ['$scope', 'MessagingService', 'UserService', function ($scope, msgbus, userService) {
    var self = this;
    $scope.domain = $scope.tabId;
}]);

controllers.controller('FleetController', ['$scope', 'MessagingService', 'FleetService', function ($scope, msgbus, fleetService) {
    var self = this;
    $scope.domain = $scope.tabId;
}]);

controllers.controller('DeviceController', ['$scope', 'MessagingService', 'DeviceService', function ($scope, msgbus, deviceService) {
    var self = this;
    $scope.domain = $scope.tabId;
}]);

controllers.controller('JourneyController', ['$scope', 'MessagingService', 'JourneyService', function ($scope, msgbus, journeyService) {
    var self = this;
    $scope.domain = $scope.tabId;
    msgbus.sub($scope, $scope.domain, 'OPTIONS_ON_LOAD', function () {
        msgbus.pub($scope.domain, 'OPTIONS_INIT', {
            devices: {
                show: true
            },
            journeys: {
                show: false
            },
            startDate: {
                show: true
            },
            stopDate: {
                show: true
            }
        });
    });
    msgbus.sub($scope, $scope.domain, 'TABLE_ON_LOAD', function () {
        msgbus.pub($scope.domain, 'TABLE_INIT', {
            externalScope: {
                showPositions: function (journeyId) {
                    var tab = {
                        id: 'positions_journey_' + journeyId,
                        name: 'Positions for journey',
                        active: true,
                        include: '/static/html/tabs/position.html'
                    };
                    msgbus.pub(msgbus.DEFAULT_DOMAIN, 'TAB_ADD', tab);
                    msgbus.pub(msgbus.DEFAULT_DOMAIN, 'TAB_SELECT', tab);
                },
                showLogs: function (journeyId) {
                    var tab = {
                        id: 'logs_journey_' + journeyId,
                        name: 'Logs for Journey',
                        active: true,
                        include: '/static/html/tabs/log.html'
                    };
                    msgbus.pub(msgbus.DEFAULT_DOMAIN, 'TAB_ADD', tab);
                    msgbus.pub(msgbus.DEFAULT_DOMAIN, 'TAB_SELECT', tab);
                }
            },
            columnDefs: [
                { name: 'start_latitude', displayName: 'Start Latitude', width: 150 },
                { name: 'start_longitude', displayName: 'Start Longitude', width: 150 },
                { name: 'start_timestamp', displayName: 'Start Timestamp', width: 150 },

                { name: 'stop_latitude', displayName: 'Stop Latitude', width: 150 },
                { name: 'stop_longitude', displayName: 'Stop Longitude', width: 150 },
                { name: 'stop_timestamp', displayName: 'Stop Timestamp', width: 150 },

                { name: 'distance', displayName: 'Distance', width: 100 },
                { name: 'average_speed', displayName: 'Average Speed', width: 150 },
                { name: 'maximum_speed', displayName: 'Maximum Speed', width: 150 },
                { name: 'duration', displayName: 'Duration', width: 100 },

                { name: 'id', displayName: '', width: 100, enableFiltering: false, cellTemplate: '<button class="btn primary glyphicon glyphicon-eye-open" ng-click="getExternalScopes().showPositions({{COL_FIELD}})"></button><button class="btn primary glyphicon glyphicon-exclamation-sign" ng-click="getExternalScopes().showLogs({{COL_FIELD}})"></button>'}
            ]
        });
    })
    ;

    msgbus.sub($scope, $scope.domain, 'OPTIONS_SUBMITTED', function (event, data) {
        journeyService.getJourneysForDevice(data.devices.selected.serial, data.startDate.dateString(), data.stopDate.dateString(), function (data) {
            msgbus.pub($scope.domain, 'TABLE_INIT', {
                data: data.objects
            });
        });
    });
}])
;

controllers.controller('PositionController', ['$scope', 'MessagingService', 'PositionService', 'JourneyService', function ($scope, msgbus, positionService, journeyService) {
    var self = this;
    $scope.domain = $scope.tabId;
    msgbus.sub($scope, $scope.domain, 'OPTIONS_ON_LOAD', function () {
        msgbus.pub($scope.domain, 'OPTIONS_INIT', {
            devices: {
                show: true
            },
            journeys: {
                show: true
            },
            startDate: {
                show: true
            },
            stopDate: {
                show: true
            }
        });
    });
    msgbus.sub($scope, $scope.domain, 'OPTIONS_SUBMITTED', function (event, data) {
        //get journeys list
        journeyService.getJourneysForDevice(data.devices.selected.serial, data.startDate.dateString(), data.stopDate.dateString(), function (data) {
            msgbus.pub($scope.domain, 'OPTIONS_INIT', {
                journeys: {
                    readonly: false,
                    list: data.objects
                }
            });
        });

        if (!angular.isDefined(data.journeys.selected)) {
            positionService.getPositionsForDevice(data.devices.selected.serial, data.startDate.dateString(), data.stopDate.dateString(), function (data) {
                var payload = data.objects;
                if (payload.length > 0) {
                    //TODO set center map and zoom fit
                    msgbus.pub($scope.domain, 'MAP_INIT', {
                        center: {
                            latitude: payload[0].latitude,
                            longitude: payload[0].longitude
                        }
                    });
                    msgbus.pub($scope.domain, 'MAP_ADD_POLYLINE', data.objects);
                }
            });
        } else {
            var selectedJourney = data.journeys.selected;
            positionService.getPositionsforJourney(data.journeys.selected.id, function (data) {
                var payload = data.objects;
                if (payload.length > 0) {
                    //TODO set center map and zoom fit
                    msgbus.pub($scope.domain, 'MAP_INIT', {
                        center: {
                            latitude: payload[0].latitude,
                            longitude: payload[0].longitude
                        }
                    });
                    var markers = [
                        {
                            latitude: selectedJourney.start_latitude,
                            longitude: selectedJourney.start_longitude,
                            title: selectedJourney.start_timestamp + '<br/> dst: ' + selectedJourney.distance + 'm<br/> dur:' + selectedJourney.duration + 's'
                            //TODO start icon
                        },
                        {
                            latitude: selectedJourney.stop_latitude,
                            longitude: selectedJourney.stop_longitude,
                            title: selectedJourney.stop_timestamp + '<br/> avg: ' + selectedJourney.average_speed + 'km/h<br/> max: ' + selectedJourney.maximum_speed + 'km/h'
                            //TODO stop icon
                        }
                    ];
                    msgbus.pub($scope.domain, 'MAP_ADD_MARKERS', markers);
                    msgbus.pub($scope.domain, 'MAP_ADD_POLYLINE', payload);
                }
            });
        }
    });
}]);

controllers.controller('LogController', ['$scope', 'MessagingService', 'LogService', 'JourneyService', function ($scope, msgbus, logService, journeyService) {
    var self = this;
    $scope.domain = $scope.tabId;
    msgbus.sub($scope, $scope.domain, 'OPTIONS_ON_LOAD', function () {
        msgbus.pub($scope.domain, 'OPTIONS_INIT', {
            devices: {
                show: true
            },
            journeys: {
                show: true
            },
            startDate: {
                show: true
            },
            stopDate: {
                show: true
            }
        });
    });
    msgbus.sub($scope, $scope.domain, 'TABLE_ON_LOAD', function () {
        msgbus.pub($scope.domain, 'TABLE_INIT', {
            columnDefs: [
                { name: 'timestamp', displayName: 'Timestamp', width: 200 },
                { name: 'level', displayName: 'Level', width: 100 },
                { name: 'message', displayName: 'Message', width: 300 },
            ]
        });
    });
    msgbus.sub($scope, $scope.domain, 'OPTIONS_SUBMITTED', function (event, data) {
        journeyService.getJourneysForDevice(data.devices.selected.serial, data.startDate.dateString(), data.stopDate.dateString(), function (data) {
            msgbus.pub($scope.domain, 'OPTIONS_INIT', {
                journeys: {
                    readonly: false,
                    list: data.objects
                }
            });
        });
        if (!angular.isDefined(data.journeys.selected)) {
            logService.getLogsForDevice(data.devices.selected.serial, data.startDate.dateString(), data.stopDate.dateString(), function (data) {
                msgbus.pub($scope.domain, 'TABLE_INIT', {
                    data: data.objects
                });
            });
        } else {
            logService.getLogsForJourney(data.journeys.selected.id, function (data) {
                msgbus.pub($scope.domain, 'TABLE_INIT', {
                    data: data.objects
                });
            });
        }
    });
}]);