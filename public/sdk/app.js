scrollbackApp.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
	$routeProvider.when('/room', {
		templateUrl: '/s/roomview.html', 
		controller:'roomcontroller' 
	});
	$routeProvider.when('/rooms', {
		templateUrl: '/s/roomsview.html', 
		controller:'roomscontroller' 
	});
	$routeProvider.when('/config', {
		templateUrl: '/s/roomconfig.html', 
		controller:'configcontroller' 
	});
	$routeProvider.otherwise({redirectTo : '/room'});

	//$locationProvider.html5Mode(true);
}]);