scrollbackApp.config(['$routeProvider', function($routeProvider){
	$routeProvider.when('/room', {
		templateUrl: '/s/roomview.html', 
		controller:'roomcontroller' 
	});
	$routeProvider.when('/rooms', {
		templateUrl: '/s/roomsview.html', 
		controller:'roomscontroller' 
	});
	$routeProvider.when('/config', {
		templateUrl: 'paritals/config', 
		controller:'configcontroller' 
	});
	$routeProvider.otherwise({redirectTo : '/room'});
}]);