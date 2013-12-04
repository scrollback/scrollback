scrollbackApp.controller('roomcontroller' , ['$scope', '$timeout', function($scope, $timeout){
	console.log("room controller is called!");
	$scope.val = "This value is set by room controler ";
	$scope.roomname = "Scrollback"
	$scope.roomDescription = " This room is a sandbox to test the new archieve view!"
	$scope.gravatar = "https://s.gravatar.com/avatar/7af99a09a2a182a118b262cf365cd7df";
	$timeout(function(){
		console.log("inside scope", $scope.scopeObj);
		console.log($scope.scopeObj.membership)
	});
}]);

scrollbackApp.controller('roomscontroller', ['$scope', '$timeout' , function($scope, $timeout){
	$scope.val = " View 2 set by controller 2";
	$scope.rooms = "";
	console.log("Rooms view controller is called now")
	$scope.isExists = function(m){
		if (m && m.length > 0) {
			return true; 
		}
		else return false;
	}
}]); 

scrollbackApp.controller('configcontroller' , ['$scope' , function($scope){
	$scope.val = "";
}]);


console.log("Controller.js started");
//	scrollbackApp.controller("mmm",['$scope'. messageController]);