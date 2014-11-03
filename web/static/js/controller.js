'use strict';

var controllers = angular.module('controller', ['service']);

controllers.controller('HeaderController', ['$scope', function ($scope) {

}]);

controllers.controller('FooterController', ['$scope', function ($scope) {

}]);

controllers.controller('MainController', ['$scope', 'MessagingService', function ($scope, msgbus) {
    $scope.user = null;

    msgbus.sub($scope, msgbus.DEFAULT_DOMAIN, 'LOGIN_SUCCESSFUL', function (event, data) {
        $scope.user = data.data;
    });

    msgbus.sub($scope, msgbus.DEFAULT_DOMAIN, 'LOGOUT_SUCCESSFUL', function (event, data) {
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
                $scope.isFailedLogin = false;
                $scope.isLimitLogin = false;

                $scope.login = function (user) {
                    dgAuthService.setCredentials(user.email, user.password);
                    dgAuthService.signin();
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };

                msgbus.sub($scope, msgbus.DEFAULT_DOMAIN, 'LOGIN_SUCCESSFUL', function (event, data) {
                    $scope.isFailedLogin = false;
                    $scope.isLimitLogin = false;
                    $modalInstance.close();
                });

                msgbus.sub($scope, msgbus.DEFAULT_DOMAIN, 'LOGIN_ERROR', function (event, data) {
                    $scope.isFailedLogin = true;
                });

                msgbus.sub($scope, msgbus.DEFAULT_DOMAIN, 'LOGIN_LIMIT', function (event, data) {
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

    msgbus.sub($scope, msgbus.DEFAULT_DOMAIN, 'LOGIN_SUCCESSFUL', function (event, data) {
        self.showLogin = false;
        self.loginName = data.data.name;
    });

    msgbus.sub($scope, msgbus.DEFAULT_DOMAIN, 'LOGIN_REQUIRED', function (event, data) {
        self.setLoginVisible();
    });

    msgbus.sub($scope, msgbus.DEFAULT_DOMAIN, 'LOGOUT_SUCCESSFUL', function (event, data) {
        self.setLoginVisible();
    });

    msgbus.sub($scope, msgbus.DEFAULT_DOMAIN, 'LOGOUT_ERROR', function (event, data) {
        self.setLoginVisible();
    });
}]);

controllers.controller('NavbarController', ['$scope', 'MessagingService', 'DeviceService', function ($scope, msgbus, deviceService) {
    var self = this;
    self.devices = null;
    self.getDevices = function () {
        if ($scope.user != null) {
            var fleets = $scope.user.fleets;

            var fleetIds = [];
            for (var i = 0; i < fleets.length; i++) {
                fleetIds.push(fleets[i].id);
            }
            deviceService.getDevicesForFleet(fleetIds, function (data) {
                self.devices = data.objects;
            });
        }
    };

    self._newJourneyTab = function (id, name, period) {
        var tab = {
            id: id,
            name: name,
            active: true,
            include: '/static/html/tabs/journey.html'
        };
        self._newTab(tab);

    };

    self._submit_JourneyQuery = function(tabId, device, period) {
        msgbus.sub($scope, tabId, 'OPTIONS_ON_LOAD', function () {
            msgbus.pub(tabId, 'OPTIONS_INIT', {
                devices: {
                    selected: device.email,
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

    self._newTab = function (tab) {
        msgbus.pub($scope.domain, 'TAB_ADD', tab);
        msgbus.pub($scope.domain, 'TAB_SELECT', tab);
    };

    self.lastDayJourneys = function (device) {
        var tabId = 'lastDayJourneys_' + device.email;
        self._newJourneyTab(tabId, 'Last Day Journeys for ' + device.serial);
        self._submit_JourneyQuery(tabId, device, 86400000);
    };

    self.lastWeekJourneys = function (device) {
        var tabId = 'lastWeekJourneys_' + device.email;
        self._newJourneyTab(tabId, 'Last Week Journeys for ' + device.serial);
        self._submit_JourneyQuery(tabId, device, 604800000);
    };

    self.lastMonthJourneys = function (device) {
        var tabId = 'lastMonthJourneys_' + device.email;
        self._newJourneyTab(tabId, 'Last Month Journeys for ' + device.serial);
        self._submit_JourneyQuery(tabId, device, 18748800000);
    };

    self.last3MonthJourneys = function (device) {
        var tabId = 'last3MonthJourneys_' + device.email;
        self._newJourneyTab(tabId, 'Last 3 Month Journeys for ' + device.serial);
        self._submit_JourneyQuery(tabId, device, 56246400000);
    };

    self.journeys = function (user) {
        self._newJourneyTab('journey-tab', 'Journeys');
    };

    self.positions = function (user) {
        var tab = {
            id: 'position-tab',
            name: 'Positions',
            active: true,
            include: '/static/html/tabs/position.html'
        };
        self._newTab(tab);
    };

    self.logs = function (user) {
        var tab = {
            id: 'log-tab',
            name: 'Logs',
            active: true,
            include: '/static/html/tabs/log.html'
        };
        self._newTab(tab);
    };

    self.profile = function (user) {
        var tab = {
            id: 'profile-tab',
            name: 'Profile',
            active: true,
            include: '/static/html/tabs/user.html'
        };
        self._newTab(tab);
    };

    self.users = function (user) {
        var tab = {
            id: 'user-tab',
            name: 'Users',
            active: true,
            include: '/static/html/tabs/user.html'
        };
        self._newTab(tab);
    };

    self.devices = function (user) {
        var tab = {
            id: 'device-tab',
            name: 'Devices',
            active: true,
            include: '/static/html/tabs/device.html'
        };
        self._newTab(tab);
    };

    self.fleets = function (user) {
        var tab = {
            id: 'fleet-tab',
            name: 'Fleets',
            active: true,
            include: '/static/html/tabs/fleet.html'
        };
        self._newTab(tab);
    };
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
        dateString: function() {
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
        dateString: function() {
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
        getRowId: function (row) {
            return row.id;
        },
        columnDefs: [],
        addColumnDefinition: function (name, displayName, width, editable, template, relatedField) {
            this.columnDefs.push({
                name: name,
                displayName: displayName,
                width: width,
                enableCellEdit: editable,
                cellTemplate: template,
                field: relatedField
            })
        }
    };

    msgbus.sub($scope, $scope.domain, 'TABLE_INIT', function (event, data) {
        if(!angular.isUndefined(data.data)) {
            self.table.data = data.data;
        }
        if(!angular.isUndefined(data.columnDefs)) {
            self.table.columnDefs = data.columnDefs;
        }
        if(!angular.isUndefined(data.enableColumnResizing)) {
            self.table.enableColumnResizing = data.enableColumnResizing;
        }
        if(!angular.isUndefined(data.enableFiltering)) {
            self.table.enableFiltering = data.enableFiltering;
        }
    });

    msgbus.pub($scope.domain, 'TABLE_ON_LOAD', {});

    //Test----------------------------------------------------------------------------------------------
    /*
    self.table.columnDefs = [
        { name: 'id', width: 50 },
        { name: 'name', width: 100 },
        { name: 'age', width: 100, enableCellEdit: true, cellTemplate: '<div class="ui-grid-cell-contents"><span>Age:{{COL_FIELD}}</span></div>'   },
        { name: 'address.street', width: 150, enableCellEdit: true, cellTemplate: '<div class="ui-grid-cell-contents"><span>Street:{{COL_FIELD}}</span></div>'   },
        { name: 'address.city', width: 150, enableCellEdit: true, cellTemplate: '<div class="ui-grid-cell-contents"><span>City:{{COL_FIELD}}</span></div>'  },
        { name: 'address.state', width: 50, enableCellEdit: true, cellTemplate: '<div class="ui-grid-cell-contents"><span>State:{{COL_FIELD}}</span></div>'  },
        { name: 'address.zip', width: 50, enableCellEdit: true, cellTemplate: '<div class="ui-grid-cell-contents"><span>Zip:{{COL_FIELD}}</span></div>'  },
        { name: 'company', width: 100, enableCellEdit: true, cellTemplate: '<div class="ui-grid-cell-contents"><span>Company:{{COL_FIELD}}</span></div>'  },
        { name: 'email', width: 100, enableCellEdit: true, cellTemplate: '<div class="ui-grid-cell-contents"><span>Email:{{COL_FIELD}}</span></div>'  },
        { name: 'phone', width: 200, enableCellEdit: true, cellTemplate: '<div class="ui-grid-cell-contents"><span>Phone:{{COL_FIELD}}</span></div>'  },
        { name: 'about', width: 300, enableCellEdit: true, cellTemplate: '<div class="ui-grid-cell-contents"><span>AAbout:{{COL_FIELD}}</span></div>'  },
        { name: 'friends[0].name', displayName: '1st friend', width: 150, enableCellEdit: true, cellTemplate: '<div class="ui-grid-cell-contents"><span>Friend0:{{COL_FIELD}}</span></div>'  },
        { name: 'friends[1].name', displayName: '2nd friend', width: 150, enableCellEdit: true, cellTemplate: '<div class="ui-grid-cell-contents"><span>Friend1:{{COL_FIELD}}</span></div>'  },
        { name: 'friends[2].name', displayName: '3rd friend', width: 150, enableCellEdit: true, cellTemplate: '<div class="ui-grid-cell-contents"><span>Friend2:{{COL_FIELD}}</span></div>'  },
        { name: 'agetemplate', field: 'age', width: 100, cellTemplate: '<div class="ui-grid-cell-contents"><span>Age 2:{{COL_FIELD}}</span></div>' }
    ];

    $http.get('/static/data.json').success(function (data) {
        var i = 0;
        data.forEach(function (row) {
            row.name = row.name + ' iter ' + i;
            row.id = i;
            i++;
            self.table.data.push(row);
        })
    })
    */
}]);

controllers.controller('MapController', ['$scope', 'MessagingService', function ($scope, msgbus) {
    var self = this;
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
            columnDefs: [
                { name: 'id', width: 50 },

                { name: 'start_latitude', displayName: 'Start Latitude', width: 150 },
                { name: 'start_longitude', displayName: 'Start Longitude', width: 150 },
                { name: 'start_timestamp', displayName: 'Start Timestamp', width: 150 },

                { name: 'stop_latitude', displayName: 'Stop Latitude', width: 150 },
                { name: 'stop_longitude', displayName: 'Stop Longitude', width: 150 },
                { name: 'stop_timestamp', displayName: 'Stop Timestamp', width: 150 },

                { name: 'distance', displayName: 'Distance', width: 100 },
                { name: 'average_speed', displayName: 'Average Speed', width: 150 },
                { name: 'maximum_speed', displayName: 'Maximum Speed', width: 150 },
                { name: 'duration', displayName: 'Duration', width: 100 }
            ]
        });
    });

    msgbus.sub($scope, $scope.domain, 'OPTIONS_SUBMITTED', function (event, data) {
        journeyService.getJourneysForDevice(data.devices.selected, data.startDate.dateString(), data.stopDate.dateString(), function(data) {
            msgbus.pub($scope.domain, 'TABLE_INIT', {
                data: data.objects
            });
        });
    });
}]);

controllers.controller('PositionController', ['$scope', 'MessagingService', 'PositionService', function ($scope, msgbus, positionService) {
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
}]);

controllers.controller('LogController', ['$scope', 'MessagingService', 'LogService', function ($scope, msgbus, logService) {
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
                { name: 'id', width: 50 },

                { name: 'timestamp', displayName: 'Timestamp', width: 150 },
                { name: 'level', displayName: 'Level', width: 150 },
                { name: 'message', displayName: 'Message', width: 150 },
            ]
        });
    });
}]);