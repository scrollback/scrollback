scrollbackApp.config(['$routeProvider', function($routeProvider){
	$routeProvider.when('/room', {
		templateUrl: '/view1.html', 
		controller:'roomcontroller' 
	});
	$routeProvider.when('/rooms', {
		templateUrl: 'partials/rooms.html', 
		controller:'roomscontroller' 
	});
	$routeProvider.when('/config', {
		templateUrl: 'paritals/config', 
		controller:'configcontroller' 
	});
	$routeProvider.otherwise({redirectTo : '/room'});
}]);