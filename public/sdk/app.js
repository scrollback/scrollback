scrollbackApp.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	$routeProvider.when('/beta/me', {
		templateUrl: '/s/roomsview.html', 
		controller:'roomscontroller'
	});
	$routeProvider.when('/beta/:room', {
		templateUrl: '/s/roomview.html', 
		controller:'roomcontroller'
	});
	$routeProvider.when('/beta/me/login', {
		templateUrl: '/s/login.html',
		controller: 'loginController'
	});
	$routeProvider.when('/beta/me/edit', {
		templateUrl: '/s/me/edit',
		controller: 'profileController'
	});
	$routeProvider.when('/beta/:room/edit', {
		templateUrl: '/s/editRoom', 
		controller:'configcontroller' 
	});
	//$routeProvider.otherwise({redirectTo : '/me'});
	$locationProvider.html5Mode(true);
}]);