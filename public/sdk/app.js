scrollbackApp.config(['$routeProvider', function($routeProvider){
	$routeProvider.when('/room', {
		templateUrl: '/roomview.html', 
		controller:'roomcontroller' 
	});
	$routeProvider.when('/rooms', {
		templateUrl: '/roomsview.html', 
		controller:'roomscontroller' 
	});
	$routeProvider.when('/config', {
		templateUrl: 'paritals/config', 
		controller:'configcontroller' 
	});
	$routeProvider.otherwise({redirectTo : '/room'});
}]);