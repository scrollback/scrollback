scrollbackApp.controller('roomcontroller' , ['$scope', '$timeout', function($scope, $timeout){
	console.log("room controller is called!");
	$scope.val = "This value is set by room controler ";
}]);

scrollbackApp.controller('roomscontroller', ['$scope' , function($scope){
	$scope.val = " View 2 set by controller 2";
	$scope.rooms = "";
}]); 

scrollbackApp.controller('configcontroller' , ['$scope' , function($scope){
	$scope.val = "";
}]);


console.log("Controller.js started");
//	scrollbackApp.controller("mmm",['$scope'. messageController]);