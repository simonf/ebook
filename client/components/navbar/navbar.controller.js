'use strict';

angular.module('guiApp')
  .controller('NavbarCtrl', function ($scope, $location) {
    $scope.menu = [{
      'title': 'Candidates',
      'link': '/'
    },
		{
		  'title': 'Matched',
		  'link': '/matched'
		}];

    $scope.isCollapsed = true;

    $scope.isActive = function(route) {
      return route === $location.path();
    };
  });