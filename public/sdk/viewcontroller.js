console.log("View Controller");
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
scrollbackApp.controller('roomcontroller' , ['$scope', '$timeout', function($scope, $timeout){
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

