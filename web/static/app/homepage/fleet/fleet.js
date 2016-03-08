/* global angular */

'use strict';

angular.module('homepage.fleets', [
    'utils', 'ui.bootstrap',
    'ui.grid', 'ui.grid.selection', 'ui.grid.resizeColumns', 'ui.grid.moveColumns', 'ui.grid.treeView', 'ui.grid.edit'
]).config(function () {
});

angular.module('homepage.fleets').factory('fleetService', function (restResource) {
    var $resource = restResource.$resource;
    var url = restResource.endpoint('fleet');
    return {
        id: $resource(url + ':id/', {id: '@id'}, {
            //also define update method
            'update': {method: 'PUT'}
        }),
        user: $resource(url + ':id/user/:email/', {id: '@id', email: '@email'}),
        device: $resource(url + ':id/device/:email/', {id: '@id', email: '@email'}),
        q: $resource(url, {
            name: '@name'
        }, {'get': {method: 'GET'}})
    };
});

angular.module('homepage.fleets').controller('fleetController', function ($scope, config, messagingService, deviceService, userService, fleetService, $uibModal) {
    var self = this;

    self.device_grid = {
        //bug here in ui-grid so we make it editable even for users
        enableCellEdit: true,
        enableRowSelection: true,
        multiSelect: false,
        enableGridMenu: true,
        enableSorting: false,
        enableFiltering: false,
        enableRowHeaderSelection: false,
        columnDefs: [
            {name: 'Serial', field: 'serial', enableCellEdit: false},
            {name: 'Description', field: 'description'},
            {name: 'Plate', field: 'plate'},
            {name: 'VIN', field: 'vin'},
            {name: 'Type', field: 'type', enableCellEdit: false},
            {name: 'Active', field: 'is_active', width: 60, enableCellEdit: false},
            {
                name: 'Show Journeys',
                displayName: '',
                width: 40,
                enableColumnMenu: false,
                enableFiltering: false,
                cellTemplate: 'show_journey_button.html'
            }
        ],
        onRegisterApi: function (gridApi) {
            self.device_grid.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function (rowChanged) {
                messagingService.pub(messagingService.DEFAULT_DOMAIN, 'device_selected', rowChanged.entity);
            });
            gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                if (newValue !== oldValue) {
                    deviceService.id.update(rowEntity).$promise.catch(function (response) {
                        rowEntity[colDef.field] = oldValue;
                    });
                }
            });
        }
    };

    self.user_grid = {
        enableCellEdit: true,
        enableRowSelection: true,
        multiSelect: false,
        enableGridMenu: true,
        enableSorting: false,
        enableFiltering: false,
        enableRowHeaderSelection: false,
        columnDefs: [
            {name: 'Name', field: 'name'},
            {name: 'Email', field: 'email', enableCellEdit: false},
            {name: 'Last Login', field: 'last_login', enableCellEdit: false},
            {name: 'Active', field: 'is_active', width: 60, enableCellEdit: false}
        ],
        onRegisterApi: function (gridApi) {
            self.user_grid.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function (rowChanged) {
                var email = rowChanged.entity.email;
                userService.getUserDetail(email, function (data) {
                    var fleets = data.fleets;
                    var fleetIds = [];
                    for (var i = 0; i < fleets.length; i++) {
                        fleetIds.push(fleets[i].id);
                    }
                    deviceService.getDevicesForFleet(fleetIds, function (data) {
                        self._makeUniqueDevices(data.objects);
                        self.device_grid.data = data.objects;
                        messagingService.pub(messagingService.DEFAULT_DOMAIN, 'devices', data.objects);
                    });
                });
            });
            gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                if (newValue !== oldValue) {
                    userService.id.update(rowEntity).$promise.catch(function (response) {
                        rowEntity[colDef.field] = oldValue;
                    });
                }
            });
        }
    };

    self._makeUniqueDevices = function (devices) {
        var lastEmail = '';
        for (var i = devices.length - 1; i > -1; i--) {
            if (devices[i].email === lastEmail) {
                devices.splice(i, 1);
            } else {
                lastEmail = devices[i].email;
            }
        }
    };

    self.fleet_grid = {
        //bug here in ui-grid so we make it editable even for users
        enableCellEdit: true,
        enableRowSelection: true,
        enableGridMenu: false,
        multiSelect: false,
        enableSorting: false,
        enableFiltering: false,
        enableRowHeaderSelection: false,
        showTreeExpandNoChildren: true,
        columnDefs: [
            {name: 'Fleet', field: 'label', enableColumnMenu: false}
        ],
        onRegisterApi: function (gridApi) {
            self.fleet_grid.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function (rowChanged) {
                var fleet = rowChanged.entity;
                deviceService.getDevicesForFleet(fleet.id, function (data) {
                    self.device_grid.data = data.objects;
                    messagingService.pub(messagingService.DEFAULT_DOMAIN, 'devices', data.objects);
                });
                userService.getUsersForFleet(fleet.id, function (data) {
                    self.user_grid.data = data.objects;
                });
            });
            gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                if (newValue !== oldValue) {
                    fleetService.id.update(rowEntity).$promise.catch(function (response) {
                        rowEntity[colDef.field] = oldValue;
                    });
                }
            });
        }
    };

    messagingService.sub($scope, messagingService.DEFAULT_DOMAIN, 'user', function (event, user) {
        var data = [];
        self._flattenTree(user.fleets, data, 0);
        self.fleet_grid.data = data;
        if (user.role === 'FLEET_ADMIN') {
            self.device_grid.enableCellEdit = true;
            self.fleet_grid.enableCellEdit = true;
            self.fleet_grid.columnDefs.push({
                name: 'Add/Remove', width: 40, enableColumnMenu: false, enableFiltering: false,
                headerCellTemplate: 'fleet_add_button.html',
                cellTemplate: 'fleet_remove_button.html'
            });
            self.user_grid.columnDefs.push({
                name: 'Add/Remove', width: 40, enableColumnMenu: false, enableFiltering: false,
                headerCellTemplate: 'user_add_button.html',
                cellTemplate: 'user_remove_button.html'
            });
            self.device_grid.columnDefs.push({
                name: 'AddRemove', width: 40, enableColumnMenu: false, enableFiltering: false,
                headerCellTemplate: 'device_add_button.html',
                cellTemplate: 'device_remove_button.html'
            });
        }
    });

    messagingService.sub($scope, messagingService.DEFAULT_DOMAIN, 'logout', function (event, profile) {
        self.fleet_grid.data = [];
        self.user_grid.data = [];
        self.device_grid.data = [];
    });

    messagingService.sub($scope, messagingService.DEFAULT_DOMAIN, 'TOOGLE_MANAGER', function (event, toogle) {
        self.isManagerVisible = toogle;
    });
    self.isManagerVisible = true;


    self._flattenTree = function (tree, result, depth) {
        for (var i = 0; i < tree.length; i++) {
            result.push({
                id: tree[i].id,
                label: tree[i].label,
                $$treeLevel: depth
            });
            self._flattenTree(tree[i].children, result, depth + 1);
        }
    };

    self._getRootTree = function (tree, row) {
        for (var i = 0; i < tree.length; i++) {
            if (row.$$hashKey === tree[i].$$hashKey) {
                for (var j = i; j > -1; j--) {
                    if (tree[j].$$treeLevel === 0) {
                        return tree[j];
                    }
                }
            }
        }
    };

    $scope.showJourney = function (device) {
        var tab = {
            id: 'journey_' + device.serial,
            name: 'Journeys for ' + device.serial,
            active: true,
            include: config.get('static_url') + 'app/homepage/journey/journey.html'
        };
        messagingService.pub(messagingService.DEFAULT_DOMAIN, 'TAB_ADD', tab);
        messagingService.pub(messagingService.DEFAULT_DOMAIN, 'TAB_SELECT', tab);
        messagingService.sub($scope, tab.id, 'OPTIONS_ON_LOAD', function (event, options) {
            options.devices.readonly = true;
            options.devices.selected = device;
            messagingService.pub(tab.id, 'OPTIONS_SUBMITTED', options);
        });
    };

    $scope.addFleet = function (fleet) {
        $uibModal.open({
            size: 'sm',
            animation: true,
            templateUrl: 'add_fleet.html',
            controller: function ($scope, $uibModalInstance) {
                $scope.fleet = fleet;
                $scope.new_fleet = {
                    readonly: false,
                    name: undefined
                };
                $scope.error = {
                    text: undefined,
                    show: false
                };

                $scope.ok = function () {
                    $scope.error.show = false;
                    fleetService.id.save({
                        name: $scope.new_fleet.name,
                        parent: fleet.id
                    }, function (data) {
                        self.fleet_grid.data.forEach(function (item, index, array) {
                            if (item.id === fleet.id) {
                                data.$$treeLevel = fleet.$$treeLevel + 1;
                                array.splice(index + 1, 0, data);
                                return false;
                            }
                        });
                        $uibModalInstance.dismiss('cancel');
                    }).$promise.catch(function (response) {
                        $scope.error.text = response.statusText;
                        $scope.error.show = true;
                    });
                };
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            }
        });
    };

    $scope.removeFleet = function (fleet) {
        $uibModal.open({
            size: 'sm',
            animation: true,
            templateUrl: 'remove_fleet.html',
            controller: function ($scope, $uibModalInstance) {
                $scope.fleet = fleet;
                $scope.error = {
                    text: undefined,
                    show: false
                };

                $scope.ok = function () {
                    $scope.error.show = false;
                    fleetService.id.remove(fleet, function (data) {
                        self.fleet_grid.data.forEach(function (item, index, array) {
                            if (item.id === fleet.id) {
                                array.splice(index, 1);
                                return false;
                            }
                        });
                        self.user_grid.data = [];
                        self.device_grid.data = [];
                        $uibModalInstance.dismiss('cancel');
                    }).$promise.catch(function (response) {
                        $scope.error.text = response.statusText;
                        $scope.error.show = true;
                    });
                };
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            }
        });
    };

    $scope.addUserToFleet = function () {
        $uibModal.open({
            size: 'sm',
            animation: true,
            templateUrl: 'add_user.html',
            controller: function ($scope, $uibModalInstance) {
                $scope.fleet = self.fleet_grid.gridApi.selection.getSelectedRows()[0];
                $scope.users = {
                    readonly: true,
                    selected: undefined,
                    list: []
                };
                $scope.error = {
                    text: undefined,
                    show: false
                };

                var rootFleet = self._getRootTree(self.fleet_grid.data, $scope.fleet);
                userService.getUsersForFleet(rootFleet.id, function (data) {
                    $scope.users.list = data.objects;
                    $scope.users.readonly = false;
                });

                $scope.ok = function () {
                    $scope.error.show = false;
                    fleetService.user.save({
                        id: $scope.fleet.id,
                        email: $scope.users.selected.email
                    }, function (data) {
                        self.user_grid.data.push($scope.users.selected);
                        $uibModalInstance.dismiss('cancel');
                    }).$promise.catch(function (response) {
                        $scope.error.text = response.statusText;
                        $scope.error.show = true;
                    });
                };
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            }
        });
    };

    $scope.removeUserFromFleet = function (user) {
        $uibModal.open({
            size: 'sm',
            animation: true,
            templateUrl: 'remove_user.html',
            controller: function ($scope, $uibModalInstance) {
                $scope.user = user;
                $scope.fleet = self.fleet_grid.gridApi.selection.getSelectedRows()[0];
                $scope.error = {
                    text: undefined,
                    show: false
                };
                $scope.ok = function () {
                    $scope.error.show = false;
                    fleetService.user.remove({
                        id: $scope.fleet.id,
                        email: user.email
                    }, function (data) {
                        self.user_grid.data.forEach(function (item, index, array) {
                            if (item.email === user.email) {
                                array.splice(index, 1);
                                return false;
                            }
                        });
                        $uibModalInstance.dismiss('cancel');
                    }).$promise.catch(function (response) {
                        $scope.error.text = response.statusText;
                        $scope.error.show = true;
                    });
                };
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            }
        });
    };

    $scope.addDeviceToFleet = function () {
        $uibModal.open({
            size: 'sm',
            animation: true,
            templateUrl: 'add_device.html',
            controller: function ($scope, $uibModalInstance) {
                $scope.fleet = self.fleet_grid.gridApi.selection.getSelectedRows()[0];
                $scope.devices = {
                    readonly: true,
                    selected: undefined,
                    list: []
                };
                $scope.error = {
                    text: undefined,
                    show: false
                };

                var rootFleet = self._getRootTree(self.fleet_grid.data, $scope.fleet);
                deviceService.getDevicesForFleet(rootFleet.id, function (data) {
                    $scope.devices.list = data.objects;
                    $scope.devices.readonly = false;
                });

                $scope.ok = function () {
                    $scope.error.show = false;
                    fleetService.device.save({
                        id: $scope.fleet.id,
                        email: $scope.devices.selected.email
                    }, function (data) {
                        self.device_grid.data.push($scope.devices.selected);
                        $uibModalInstance.dismiss('cancel');
                    }).$promise.catch(function (response) {
                        $scope.error.text = response.statusText;
                        $scope.error.show = true;
                    });
                };
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            }
        });
    };

    $scope.removeDeviceFromFleet = function (device) {
        $uibModal.open({
            size: 'sm',
            animation: true,
            templateUrl: 'remove_device.html',
            controller: function ($scope, $uibModalInstance) {
                $scope.device = device;
                $scope.fleet = self.fleet_grid.gridApi.selection.getSelectedRows()[0];
                $scope.error = {
                    text: undefined,
                    show: false
                };

                $scope.ok = function () {
                    $scope.error.show = false;
                    fleetService.device.remove({
                        id: $scope.fleet.id,
                        email: device.email
                    }, function (data) {
                        self.device_grid.data.forEach(function (item, index, array) {
                            if (item.email === device.email) {
                                array.splice(index, 1);
                                return false;
                            }
                        });
                        $uibModalInstance.dismiss('cancel');
                    }).$promise.catch(function (response) {
                        $scope.error.text = response.statusText;
                        $scope.error.show = true;
                    });
                };
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            }
        });
    };

    $scope.isNotSelectedRootFleet = function () {
        var selectedRows = self.fleet_grid.gridApi.selection.getSelectedRows();
        if (selectedRows.length > 0) {
            return selectedRows[0].$$treeLevel !== 0;
        }
        return true;
    };
});