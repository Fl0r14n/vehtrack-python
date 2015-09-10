/* global angular */

'use strict';

angular.module('homepage.header', ['utils', 'auth', 'homepage.navbar']).config(function() {
});

angular.module('homepage.header').controller('headerController', function($scope, config) {
    var self = this;
    self.login_url = config.get('static_url')+'app/auth/auth.html';
    self.navbar_url = config.get('static_url')+'app/homepage/navbar/navbar.html';
}); 