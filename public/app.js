var scrollback = angular.module('scrollback');
scrollback.config(function($routeProvider){
      $routeProvider.when('/dummy/rooms', {
          templateUrl : '/dummy/layout',
          controller : 'roomsControllerTmp'
      })
      /*.when('/room', {
          templateUrl : 'room' , 
          controller : 'roomController'
      })
      .otherwise({redirectTo : '/me '}); */
});

scrollback.controller("roomsControllerTmp" , function($scope){
  alert("Ola");
});