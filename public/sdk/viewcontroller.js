scrollbackApp.controller('metaController',function($scope, $location, $factory) {
	$scope.navTo= function(to){
		//alert("asdkhbf"+$location.path);
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
	console.log("meta constroller-----------------------", $factory.isActive);


	// disabling this for now.
	
	// function personaWatch() {
	// 	console.log("WATCHING...", $factory.me);
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
	    alert("hi");
	};
	$scope.nick = $factory.nick;
	$scope.displayNick = ($factory.nick).replace(/^guest-/,"");
	$scope.save = function(){
		$factory.message({to:"",type:"nick", user:{id:$scope.displayNick,accounts:[]}}, function(message){
			if(message.message){

			}else{
				$location.path("/");
			}
		});
	};
    $factory.on("nick", function(nick) {
        $scope.$apply(function() {
        	$scope.nick = $factory.nick;
			$scope.displayNick = ($factory.nick).replace(/^guest-/,"");
        });
    });

	$scope.personaLogin = function(){
		//temp solution... 
		//if(!navigator.id.watching) {
			navigator.id.watch({
				onlogin: function(assertion){
					var message = {browserid:assertion, type: "nick", to:''};
					$factory.message(message, function(message){
						if(message.message && message.message == "AUTH_UNREGISTERED") $location.path("/signup");
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
