'use strict';

var directives = angular.module('directive', []);

directives.directive('uiTabList', function() {
    return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
            stacked: '@',
            justified: '@'
        },
        controllerAs: 'tabsCtrl',
        controller: function($scope) {
            var stacked = $scope.stacked,
                justified = $scope.justified,
                activeTab = null,
                tabs = [];

            this.getTabs = function() {
                return tabs;
            };

            this.isStacked = function() {
                return stacked;
            };

            this.isJustified = function() {
                return justified;
            };

            this.addTab = function(tab) {
                tabs.push(tab);
            };

            this.setActiveTab = function(tab) {
                if(!tab.disabled) {
                    activeTab = tab.id;
                }
            };

            this.isActiveTab = function(tab) {
                return activeTab === tab.id && !tab.disabled;
            }
        },
        template: [
            '<div class="tabs"',
                '<div class="tabbable">',
                    '<ng-transclude></ng-transclude>',
                    '<div ng-class="{\'col-xs-3\': tabsCtrl.isStacked()}">',
                        '<ul class="nav nav-tabs" ng-class="{\'nav-stacked nav-pills\': tabsCtrl.isStacked(), \'nav-justified\': tabsCtrl.isJustified()}">',
                            '<li ng-repeat="tab in tabsCtrl.getTabs()" ng-class="{\'active\': tabsCtrl.isActiveTab(tab), \'disabled\': tab.disabled}" ng-click="tabsCtrl.setActiveTab(tab)" ng-init="tabsCtrl.setActiveTab(tabsCtrl.tabs[0])">',
                                '<a><i ng-if="tab.icon" class="{{ tab.icon }}"></i>{{ tab.name }}</a>',
                            '</li>',
                        '</ul>',
                    '</div>',
                    '<div ng-class="{\'col-xs-9\': tabsCtrl.isStacked()}">',
                        '<div class="tab-content col-xs-9"',
                            '<div class="tab-pane fade" ng-repeat="tab in tabsCtrl.getTabs()" ng-class="{\'active in\': tabsCtrl.isActiveTab(tab)}" ng-show="tabsCtrl.isActiveTab(tab)">',
                                '<ng-include src="tab.include" ng-if="tab.include"></ng-include>',
                                '{{ tab.content }}',
                            '</div>',
                        '</div>',
                    '</div>',
                '</div>',
            '</div>'
        ].join('')
    };
});

directives.directive('uiTab', function() {
    return {
        require: '^uiTabList',
        replace: true,
        restrict: 'E',
        scope: {
            id: '@',
            name: '@',
            icon: '@',
            disabled: '@',
            include: '@',
            active: '@'
        },
        compile: function() {
            return {
                pre: function(scope, element, attributes, controller, transcludeFn) {
                    var tab = {
                        id: scope.id,
                        name: scope.name,
                        icon: scope.icon,
                        disabled: scope.disabled,
                        include: scope.include,
                        content: element.text()
                    };
                    controller.addTab(tab);
                    if(scope.active) {
                        controller.setActiveTab(tab);
                    }
                },
                post: function(scope, element, attributes, controller, transcludeFn) {
                    element.remove();
                }
            }
        }
    }
});
