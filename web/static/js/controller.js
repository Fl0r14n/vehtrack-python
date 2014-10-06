var controllers = angular.module('controller', []);

controllers.controller('MainController', function($scope) {
    $scope.title = 'Hello Angular World';
});

controllers.controller('NavbarController', function($scope) {
    $scope.isStacked = false;
    $scope.activeTab = 0;
    $scope.tabs = [
        {id: 'tab1', name: 'Section1', content:'Howdy, I\'m in Section 1.'},
        {id: 'tab2', name: 'Section2', content:'Howdy, I\'m in Section 2.', icon:'glyphicon glyphicon-bell'},
        {id: 'tab3', name: 'Section3', content:'Howdy, I\'m in Section 3.', disabled:true},
    ];

    $scope.isActiveTab = function(tabId) {
        console.log($scope.activeTab === tabId);
        return $scope.activeTab === tabId;
    };

    $scope.setActiveTab = function(tabId) {
        console.log(tabId);
        $scope.activeTab = tabId;
    }
});