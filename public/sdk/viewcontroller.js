scrollbackApp.controller('metaController',['$scope', '$location', '$factory', '$timeout','$window',function($scope, $location, $factory, $timeout,$window) {
	$factory.on("error",function(error) {
		if(error == "AUTH_UNREGISTERED")return;
		if(error == "AUTH_REQ_TO_POST"){
			$scope.$apply(function() {
				$location.path("/beta/me/login");
			});
			error="You must sign in to post in this room."
		}
		if(error=="API Limit exceeded") error = "Your message was not delivered because you sent too many messages in a very short time.";
		if(error=="REPEATATIVE") error = "Your message was not delivered because it seems repetitive.";
		if(error=="BANNED_WORD") error = "Your message was not delivered because something you said was flagged as inappropriate.";
		$scope.$apply(function(){
			$scope.status.waiting = false;
			if($scope.notifications.indexOf(error)>=0) return;
			$scope.notifications.push(error);
			$timeout(function() {
				var index = $scope.notifications.indexOf(error);
				if(index>=0) $scope.notifications.splice(index,1);
			}, 3000);
		});
	});
	$scope.goBack = function() {
		$window.history.back();
	};
	$scope.profile = function() {
		if(/^guest-/.test($scope.user.id)) {
			$location.path("/beta/me/login");
		}else {
			$location.path("/beta/me/edit");	
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
	// 				$location.path("/beta/me");
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
	$scope.nickChange = function(event) {
		console.log(event);
		$scope.status.waiting = true;
		if($scope.user.id == "guest-"+$scope.displayNick){
			$location.path("/beta/"+$scope.room.id);
			return;
		}
		
	    $factory.message({to:"",type:"nick", ref:"guest-"+$scope.displayNick}, function(message){
	    	if(message.message){
	    		//error
	    	}else{
	    		$scope.$apply(function() {
					$scope.status.waiting = false;
		    		$location.path("/beta/"+$scope.room.id);	
	    		});
	    	}
	    });
	};
	$scope.goBack = function(){
		$location.path("/beta/"+$scope.room.id);
	};
	$scope.displayNick = ($scope.user.id).replace(/^guest-/,"");
	$scope.personaLogin = function(){
		navigator.id.watch({
			onlogin: function(assertion){
				var message = {browserid:assertion, type: "nick", to:''};
				$scope.status.waiting = true;
				$factory.message(message, function(message){
					if(message.message && message.message == "AUTH_UNREGISTERED") {
						$scope.$apply(function() {
							$scope.status.waiting = false;
							$location.path("/beta/me/edit");	
						});
					}
					else if(!message.message) {
						$scope.$apply(function() {
							$scope.status.waiting = false;
							$location.path("/beta/"+$scope.room.id);
						});
					}
				});
			},
			onlogout: function() {
				$scope.$apply(function() {
					$scope.status.waiting = false;
					$location.path("/beta/"+$scope.room.id);
				});
			}
		});
		navigator.id.request();
	};
}]);


scrollbackApp.controller('roomcontroller', function($scope, $timeout, $factory, $location, $routeParams) {
	if($factory.isActive ) {
		$factory.enter($routeParams.room);
	}else {
		$factory.on("init", function() {
			$factory.enter($routeParams.room);
		});
	}
	$scope.isOwner = function() {
		if($scope.user.id == $scope.room.owner) return true;
		else return false;
	};
	$scope.goToConfigure = function() {
		$location.path("/beta/"+$scope.room.id+"/edit");
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
			$location.path('/beta/me/login');
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
		$location.path("/beta/"+$scope.room.id);
	};
	if(/^guest-/.test($scope.user.id)) {
        $location.path("/beta/me/login");
    }
    $scope.goTo = function(room) {
    	if($scope.room.id == room){
    		$location.path("/beta/"+room);
    	}else{
    		window.location = "/beta/"+room;
    	}
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
		$location.path("/beta/"+$scope.room.id);
	};
	if(/^guest-/.test()){
		$location.path("/beta/me/login");
	}
	if($scope.user.id != $scope.room.owner && typeof $scope.room.owner!= "undefined") {
		$location.path("/beta/"+$scope.room.id);
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
		$location.path("/beta/"+$scope.room.id);
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
		$scope.status.waiting = true;
		$factory.room( room, function(room) {
			if(room.message)	alert(room.message);
			else {
				$scope.$apply(function() {
					Object.keys(room).forEach(function(element){
						$scope.room[element] = room[element];
					});
					$location.path("/beta/"+$scope.room.id);
					$scope.status.waiting = false;
				});
			}
		});
		
	};
}]);

scrollbackApp.controller('rootController' , ['$scope', '$factory', '$location', function($scope, $factory, $location) {
	$scope.goBack = function() {
		$location.path("/beta/"+$scope.room.id);	
	};
	$scope.status= {
		waiting : false
	};


	$factory.on('init', function(data){
		//assigning the new new init data to the user scope ---
		$scope.$apply(function(){
			Object.keys(data.user).forEach(function(key){
				$scope.user[key] = data.user[key];
			});
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
	
	$scope.cancelScreen = function(){
		$location.path("/beta/"+$scope.room.id);	
	};
	
	$scope.isGuest = function(){
		return /^guest-/.test($scope.user.id);
	};
	
}]);

scrollbackApp.controller('profileController' , ['$scope', '$factory', '$location', function($scope, $factory, $location) {
	
	$scope.logout = function() {
		$factory.message({type:"nick", to:"", ref:"guest-"},function(message) {
			navigator.id.logout();
			$location.path("/"+$scope.room.id);
		});
	};
	
	$scope.save = function() {
		$scope.status.waiting = true;
		$factory.message({to:"",type:"nick", user:{id:$scope.nick,accounts:[]}}, function(message) {
			if(message.message) {
				//err .
			}else{
				$scope.$apply(function() {
					$scope.status.waiting = false;
					$location.path("/beta/"+$scope.room.id);	
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