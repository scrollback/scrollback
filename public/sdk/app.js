scrollbackApp.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	$routeProvider.when('/me', {
		templateUrl: '/s/roomsview.html', 
		controller:'roomscontroller'
	});
	$routeProvider.when('/:room', {
		templateUrl: '/s/roomview.html', 
		controller:'roomcontroller'
	});
	$routeProvider.when('/me/login', {
		templateUrl: '/s/login.html'
	});
	$routeProvider.when('/me/edit', {
		templateUrl: '/me/edit'
	});
	$routeProvider.when('/:room/edit', {
		templateUrl: '/s/roomconfig.html', 
		controller:'configcontroller' 
	});
	$routeProvider.otherwise({redirectTo : '/:room'});
	$locationProvider.html5Mode(true);
}]);