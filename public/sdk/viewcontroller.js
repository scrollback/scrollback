scrollbackApp.controller('roomcontroller', ['$scope', '$timeout', '$factory', function($scope, $timeout, $factory){
	
	console.log("room controller is called!");
	$timeout(function(){
		console.log("inside scope", $scope.scopeObj);
		console.log($scope.scopeObj.membership);
	});
	
	$scope.partRoom = function(){
		var msg = {}, index;
		msg.to = $scope.scopeObj.room.id;
		msg.type = "part";
		$factory.message(msg);
		index = $scope.scopeObj.membership.indexOf('$scope.scopeObj.room.id');
		if(index){
			$scope.scopeObj.membership.splice(index, 1);
		}
	}
	$scope.joinRoom = function(){
		var msg = {};
		msg.to = $scope.scopeObj.room.id;
		msg.type = "join";
		$factory.message(msg);
		$scope.scopeObj.membership.push($scope.scopeObj.room.id);
	}
	
	$scope.hasMembership = function(){
		var index = $scope.scopeObj.membership.indexOf($scope.scopeObj.room.id);
		if(index && index > -1) return true;
		else return false;
	}
	
}]);

scrollbackApp.controller('roomscontroller', ['$scope', '$timeout' , function($scope, $timeout){	
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