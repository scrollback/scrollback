scrollbackApp.controller('roomcontroller', ['$scope', '$timeout', '$factory', '$location', function($scope, $timeout, $factory, $location){
	
	console.log("room controller is called! value of membership ", $scope.scopeObj.membership);
	$timeout(function() {
		console.log("inside scope", $scope.scopeObj);
		console.log($scope.scopeObj.membership);
	});
	
	$scope.partRoom = function() {
		var msg = {}, index;
		msg.to = $scope.scopeObj.room.id;
		msg.type = "part";
		$factory.message(msg);
		index = $scope.scopeObj.membership.indexOf($scope.scopeObj.room.id);
		if(index >= 0) $scope.scopeObj.membership.splice(index, 1);
	}
	
	$scope.joinRoom = function() {
		var msg = {};
		if(/^guest-/.test($scope.scopeObj.user)){
			//guest
			$location.path('/login');
			return;
		}
		msg.to = $scope.scopeObj.room.id;
		msg.type = "join";
		$factory.message(msg);
		$scope.scopeObj.membership.push($scope.scopeObj.room.id);
	}
	
	$scope.hasMembership = function() {
		var index = $scope.scopeObj.membership.indexOf($scope.scopeObj.room.id);
		if(index > -1) return true;
		else return false;
	}
	
}]);

scrollbackApp.controller('roomscontroller', ['$scope', '$timeout' , function($scope, $timeout) {	
	console.log("Rooms view controller is called now, value of membership is", $scope.scopeObj.membership);
	$scope.isExists = function(m) {
		if (m && m.length > 0) {
			return true; 
		}
		else return false;
	}
}]); 

scrollbackApp.controller('configcontroller' , ['$scope' , function($scope) {
	$scope.val = "";
}]);