scrollbackApp.controller('metaController',function($scope, $location, $factory) {
	$scope.navTo= function(to){
		$location.path(to);
	}
	$scope.profile = function(){
		if(/^guest-/.test($scope.nick)) {
			$location.path("/login");
		}else{
			$location.path("/me");
		}
	};

	var statusObject = {};
	// disabling this for now.scope.user	id	// function personaWatch() {
	// 	console.log("WATCHING...", $scope.nick
	// 	if(/^guest-/.test($factory.me)) {
	// 		navigator.id.watch({
	// 			onlogin:function(assertion) {
	// 			console.log("onLogin");
	// 			var message = {browserid:assertion, type: "nick", to:''};
	// 			$factory.message(message, function(resp) {
	// 				$location.path("/me");
	// 			});
	// 		},
	// 		onlogout: function() {}
	// 		});
	// 		//adding something to keep track of this..
	// 		navigator.id.watching = true;
	// 	}
	// }
	// if($factory.isActive) {
		
	// 	//personaWatch();
	// }else {
	// 	$factory.on("init", function() {
	// 		console.log("-------",$factory.isActive);
	// 		$factory.listenTo(window.scrollback.room);
	// 	});
	// }
});
scrollbackApp.controller('meController',['$scope','$route','$factory','$location',function($scope, $route, $factory, $location) {
	console.log("me controller called");
	$scope.nickChange = function() {
	    $factory.message({to:"",type:"nick", ref:"guest-"+$scope.displayNick});
	};
	$scope.displayNick = ($scope.user.id).replace(/^guest-/,"");
	$scope.save = function() {
		$factory.message({to:"",type:"nick", user:{id:$scope.displayNick,accounts:[]}}, function(message) {
			if(message.message) {
				//err .
			}else{
				$location.path("/");
			}
		});
	};
	$scope.personaLogin = function(){
		//temp solution... 
		//if(!navigator.id.watching) {
			navigator.id.watch({
				onlogin: function(assertion){
					var message = {browserid:assertion, type: "nick", to:''};
					$factory.message(message, function(message){
						if(message.message && message.message == "AUTH_UNREGISTERED") $location.path("/me/edit");
						else if(!message.message) $location.path("/");
					});
				},
				onlogout: function() {}
			});
			navigator.id.watching = true;
		//}
		navigator.id.request();
	};
}]);


scrollbackApp.controller('roomcontroller', ['$scope', '$timeout', '$factory', '$location', function($scope, $timeout, $factory, $location) {	
	$scope.partRoom = function() {
		var msg = {}, index;
		msg.to = $scope.room.id;
		msg.type = "part";
		$factory.message(msg);
		if($scope.user.membership){
			index = $scope.user.membership.indexOf($scope.room.id);
			if(index >= 0)$scope.user.membership.splice(index, 1);	
		}
		
	}
	
	$scope.joinRoom = function() {
		var msg = {};
		if(/^guest-/.test($scope.user.id)){
			//guest
			$location.path('/login');
			return;
		}
		msg.to = $scope.room.id;
		msg.type = "join";
		$factory.message(msg);
		$scope.user.membership.push($scope.room.id);
	}
	
	$scope.hasMembership = function() {
		if(!$scope.user.membership) return false;
		var index = $scope.user.membership.indexOf($scope.room.id);
		if(index > -1) return true;
		else return false;
	}
}]);

scrollbackApp.controller('roomscontroller', ['$scope', '$timeout' , function($scope, $timeout) {	
	console.log("Rooms view controller is called now, value of membership is", $scope.user.membership);
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

scrollbackApp.controller('rootController' , ['$scope' , function($scope) {
	$scope.val = "";
}]);