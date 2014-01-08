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
		templateUrl: '/s/login.html',
		controller: 'loginController'
	});
	$routeProvider.when('/me/edit', {
		templateUrl: '/s/me/edit',
		controller: 'profileController'
	});
	$routeProvider.when('/:room/edit', {
		templateUrl: '/s/editRoom', 
		controller:'configcontroller' 
	});
	//$routeProvider.otherwise({redirectTo : '/me'});
	$locationProvider.html5Mode(true);
}]);