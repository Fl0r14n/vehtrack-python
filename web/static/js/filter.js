'use strict';

var filters = angular.module('filter', []);

filters.filter('sanitize', ['$sce', function($sce) {
    return $sce.trustAsHtml;
}]);
