scrollbackApp.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	$routeProvider.when('/me', {
		templateUrl: '/s/roomsview.html', 
		controller:'roomscontroller'
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
	$routeProvider.when('/:room/', {
		templateUrl: '/s/roomview.html', 
		controller:'roomcontroller'
	});
	$routeProvider.when('/:room/:p1', {
		templateUrl: '/s/roomview.html', 
		controller:'roomcontroller'
	});
	$routeProvider.when('/:room/:p1/:p2', {
		templateUrl: '/s/roomview.html', 
		controller:'roomcontroller'
	});
//	$routeProvider.otherwise({redirectTo : '/me'});
	$locationProvider.html5Mode(true);
}]);