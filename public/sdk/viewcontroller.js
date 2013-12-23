scrollbackApp.controller('metaController',['$scope', '$location', '$factory','$window',function($scope, $location, $factory, $window) {
	$scope.goBack = function() {
		$window.history.back();
	};
	$scope.profile = function() {
		if(/^guest-/.test($scope.user.id)) {
			$location.path("/me/login");
		}else{
			$location.path("/me/edit");	
		}	
	};
	$scope.logout = function() {
		$factory.message({type:"nick", to:"", ref:"guest-"},function(message) {
			navigator.id.logout();
		});
	};
	var statusObject = {};
	// function personaWatch() {
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
}]);

scrollbackApp.controller('loginController',['$scope','$route','$factory','$location',function($scope, $route, $factory, $location) {
	$scope.nickChange = function() {
		
		if($scope.user.id == "guest-"+$scope.displayNick){
			$location.path("/"+$scope.room.id);
			return;
		}
		
	    $factory.message({to:"",type:"nick", ref:"guest-"+$scope.displayNick}, function(message){
	    	if(message.message){
	    		//error
	    	}else{
	    		$scope.$apply(function(){
	    		$location.path("/"+$scope.room.id);	
	    		});
	    	}
	    });
	};

	$scope.displayNick = ($scope.user.id).replace(/^guest-/,"");
	$scope.personaLogin = function(){
		navigator.id.watch({
			onlogin: function(assertion){
				var message = {browserid:assertion, type: "nick", to:''};
				$factory.message(message, function(message){
					if(message.message && message.message == "AUTH_UNREGISTERED") {
						$scope.$apply(function() {
							$location.path("/me/edit");	
						});
					}
					else if(!message.message) {
						$scope.$apply(function() {
							$location.path("/"+$scope.room.id);
						});
					}
				});
			},
			onlogout: function() {}
		});
		navigator.id.request();
	};
}]);


scrollbackApp.controller('roomcontroller', function($scope, $timeout, $factory, $location, $routeParams) {
	if($factory.isActive ) {
		$factory.enter($routeParams.room);
	}else {
		$factory.on("connected", function() {
			$factory.enter($routeParams.room);
		});
	}
	$scope.isOwner = function() {
		if($scope.user.id == $scope.room.owner) return true;
		else return false;
	};
	$scope.goToConfigure = function() {
		$location.path("/"+$scope.room.id+"/edit");
	};
	$scope.partRoom = function() {
		var msg = {}, index,i,l;
		msg.to = $scope.room.id;
		msg.type = "part";
		$factory.message(msg);
		if($scope.user.membership && $.isArray($scope.user.membership)){
			index = $scope.user.membership.indexOf($scope.room.id);
			if(index >= 0){
				$scope.user.membership.splice(index, 1);
				//deleting gravatar 
				for(i=0,l=$scope.room.members.length;i<l;i++) {
					if($scope.room.members[i].id === $scope.user.id){
						$scope.room.members.splice(i,1);
						break;
					}
				}
			}
		}
	};
	$scope.joinRoom = function() {
		var msg = {};
		if(/^guest-/.test($scope.user.id)){
			//guest
			$location.path('/me/login');
			return;
		}
		msg.to = $scope.room.id;
		msg.type = "join";
		$factory.message(msg);
		$scope.user.membership.unshift($scope.room.id);
		$scope.room.members.unshift($scope.user);
	}
	
	$scope.hasMembership = function() {
		var index = -1;
		if(!$scope.user.membership) return false;
		if($.isArray($scope.user.membership)) index = $scope.user.membership.indexOf($scope.room.id);
		if(index > -1) return true;
		else return false;
	};
});

scrollbackApp.controller('roomscontroller', ['$scope', '$timeout', '$location', function($scope, $timeout, $location) {	
	$scope.goBack = function(){
		$location.path("/"+$scope.room.id);
	};
	if(/^guest-/.test($scope.user.id)) {
        $location.path("/me/login");
    }
    $scope.goTo = function(room) {
    	window.location = "/"+room;
    };
	$scope.isExists = function(m) {
		if (m && m.length > 0) {
			return true; 
		}
		else return false;
	};
}]); 

scrollbackApp.controller('configcontroller' ,['$scope', '$factory', '$location', '$rootScope', '$routeParams', function($scope, $factory, $location, $rootScope, $routeParams) {
	var url;
	$scope.goBack = function(){
		$location.path("/"+$scope.room.id);
	};
	if(/^guest-/.test()){
		$location.path("/me/login");
	}
	if($scope.user.id != $scope.room.owner && typeof $scope.room.owner!= "undefined") {
		$location.path("/"+$scope.room.id);
		return;
	}
	$scope.name = $scope.room.name || $scope.room.id;
	$scope.description = $scope.room.description || $scope.room.description;
	if($scope.room.params){
		$scope.wordEnable = $scope.room.params.wordban?1:0;
		$scope.loginEnable = $scope.room.params.loginrequired?1:0;
		if($scope.room.accounts && $scope.room.accounts.forEach){
			$scope.room.accounts.forEach(function(account) {
				url = parseUrl($scope.room.accounts[0].id);
				if(url.protocol == "irc") {
					$scope.ircServer = url.hostname;
					$scope.ircRoom = url.hash;	
				}
			});
		}		
	}else{
		$scope.wordEnable = 0;
		$scope.loginEnable = 0;
		
	}
	$scope.cancel = function() {
		$location.path("/"+$scope.room.id);
	};
	$scope.saveRoom = function() {
		var room={};
		room.id = $scope.room.id;
		room.name = $scope.name || $scope.room.id;
		room.description = $scope.description || "";
		room.params = {};
		room.type = "room";
		room.params.wordban = $scope.wordEnable?true:false;
		room.params.loginrequired = $scope.loginEnable?true:false;
		if($scope.ircServer && $scope.ircRoom) {
			room.accounts = [
				{
					gateway: "irc",
					id:"irc://"+$scope.ircServer+"/"+$scope.ircRoom,
					room: $scope.room.id,
					params:{}
				}
			];
			room.params.irc = true;
		}else {
			room.params.irc = false;
		}
		$factory.room( room, function(room) {
			console.log(room);
			if(room.message)	alert(room.message);
			else {
				$scope.$apply(function() {
					Object.keys(room).forEach(function(element){
						$scope.room[element] = room[element];
					});
					$location.path("/"+$scope.room.id);
				});
				
			}
		});
		
	};
}]);

scrollbackApp.controller('rootController' , ['$scope', '$factory',  function($scope, $factory) {
	$factory.on('init', function(data){
		//assigning the new new init data to the user scope ---
		$scope.$apply(function(){
			Object.keys(data.user).forEach(function(key){
				$scope.user[key] = data.user[key];
			});
			console.log($scope.user);
			if(/^guest-/.test(data.user.id)) {
				$scope.user.picture = "//s.gravatar.com/avatar/guestpic";
			}else {
				if(data.user.membership) {
					if(data.user.membership instanceof Array) $scope.user.membership = data.user.membership;
					else $scope.user.membership = Object.keys(data.user.membership);
				}
			}	
		});
	});
}]);

scrollbackApp.controller('profileController' , ['$scope', '$factory', '$location', function($scope, $factory, $location) {
	$scope.isGuest = function(){
		return /^guest-/.test($scope.user.id);
	};
	$scope.save = function() {
		console.log("save called.", $scope.nick);
		$factory.message({to:"",type:"nick", user:{id:$scope.nick,accounts:[]}}, function(message) {
			if(message.message) {
				//err .
			}else{
				$scope.$apply(function() {
					$location.path("/"+$scope.room.id);	
				});
			}
		});
	};
}]);

function parseUrl(url) {
	var a = document.createElement('a');
	var protocol = url.split(":")[0];
	url = url.replace(protocol,"http");
    a.href = url;
    return {protocol:protocol, hash:a.hash, hostname:a.hostname, search:a.search};
}