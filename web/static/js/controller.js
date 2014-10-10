'use strict';

var controllers = angular.module('controller', []);

controllers.controller('MainController', function($scope) {
    $scope.title = 'Hello Angular World';
});

controllers.controller('NavbarController', function() {
    this.isJustified = false;
    this.isStacked = false;
    this.activeTab = null;
    this.tabs = [
        {id: 'tab1', name: 'Section1', content:'Howdy, I\'m in Section 1.'},
        {id: 'tab2', name: 'Section2', content:'Howdy, I\'m in Section 2.', icon:'glyphicon glyphicon-bell'},
        {id: 'tab3', name: 'Section3', content:'Howdy, I\'m in Section 3.', disabled:true},
        {id: 'tab4', name: 'Section4', include:'/static/html/header.html'},
    ];

    this.isActiveTab = function(tab) {
        return activeTab === tab.id && !tab.disabled;
    };

    this.setActiveTab = function(tab) {
        if(!tab.disabled) {
            activeTab = tab.id;
        }
    };

    this.addTab = function(tab) {
        tabs.push(tab)
    }
});