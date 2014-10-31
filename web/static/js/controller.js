'use strict';

var controllers = angular.module('controller', ['service']);

controllers.controller('HeaderController', ['$scope', function ($scope) {

}]);

controllers.controller('FooterController', ['$scope', function ($scope) {

}]);

controllers.controller('MainController', ['$scope', 'MessagingService', function ($scope, msgbus) {
    $scope.user = null;

    msgbus.sub($scope, 'LOGIN_SUCCESSFUL', function (event, data) {
        $scope.user = data.data;
    });

    msgbus.sub($scope, 'LOGOUT_SUCCESSFUL', function (event, data) {
        $scope.user = null;
    });
}]);

//-------------------------------------------------------------------------

controllers.controller('LoginController', ['$scope', '$modal', 'dgAuthService', function ($scope, $modal, dgAuthService) {

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

                $scope.$on('LOGIN_SUCCESSFUL', function (event, data) {
                    $scope.isFailedLogin = false;
                    $scope.isLimitLogin = false;
                    $modalInstance.close();
                });

                $scope.$on('LOGIN_ERROR', function (event, data) {
                    $scope.isFailedLogin = true;
                });

                $scope.$on('LOGIN_LIMIT', function (event, data) {
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

    $scope.$on('LOGIN_SUCCESSFUL', function (event, data) {
        self.showLogin = false;
        self.loginName = data.data.name;
    });

    $scope.$on('LOGIN_REQUIRED', function (event, data) {
        self.setLoginVisible();
    });

    $scope.$on('LOGOUT_SUCCESSFUL', function (event, data) {
        self.setLoginVisible();
    });

    $scope.$on('LOGOUT_ERROR', function (event, data) {
        self.setLoginVisible();
    });
}]);

controllers.controller('NavbarController', ['$scope', 'DeviceService', function ($scope, deviceService) {
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

    self.lastDayJourneys = function (deviceId) {
        console.log(deviceId);
    };

    self.lastWeekJourneys = function (deviceId) {

    };

    self.lastMonthJourneys = function (deviceId) {

    };

    self.last3MonthJourneys = function (deviceId) {

    };

}]);

controllers.controller('OptionsController', ['$scope', function ($scope) {
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
        }
    };

    self.submit = function () {
        //TODO
    }
}]);

controllers.controller('TableController', ['$scope', '$http', function ($scope, $http) {
    var self = this;

    self.model = {
        data: [],
        enableColumnResizing: true,
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


    //Test
    self.model.columnDefs = [
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
        var i=0;
        data.forEach(function (row) {
            row.name = row.name+ ' iter '+i;
            row.id = i;
            i++;
            self.model.data.push(row);
        })
    })

}]);

//-----------------------------------------------------------------------

controllers.controller('UserController', ['$scope', 'UserService', function ($scope, userService) {
    var self = this;

}]);

controllers.controller('FleetController', ['$scope', 'FleetService', function ($scope, fleetService) {
    var self = this;

}]);

controllers.controller('DeviceController', ['$scope', 'DeviceService', function ($scope, deviceService) {
    var self = this;

}]);

controllers.controller('JourneyController', ['$scope', '$filter', 'JourneyService', function ($scope, $filter, journeyService) {
    var self = this;
}]);

controllers.controller('PositionController', ['PositionService', function (positionService) {
    var self = this;

}]);

controllers.controller('LogController', ['LogService', function (logService) {
    var self = this;

}]);