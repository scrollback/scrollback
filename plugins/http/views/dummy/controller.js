var ui_controller = angular.module('scrollback' , []);
ui_controller.config(['$routeProvider' , function($routeProvider){
    $routeProvider.when('/room/:roomId', {templateUrl : '' , controller : ''});
    $routeProvider.when('/rooms/:userId', {templateUrl : '' , controller: ''});
    $routeProvider.when('/config/:roomId', {templateUrl: '', controller: '' });
    $routeProvider.when('/user/:userId', {template: '', controller: '' });
    

}]);
