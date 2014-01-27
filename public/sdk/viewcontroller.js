scrollbackApp.controller('metaController',['$scope', '$location', '$factory', '$timeout','$window',function($scope, $location, $factory, $timeout,$window) {
	$scope.editRoom = {};
	$factory.on("disconnected", function(){
		$scope.isActive = false;
		$timeout(function() {
			if($scope.notifications.indexOf("Disconnected. trying to reconnect…")<0 && !$scope.isActive) {
				$scope.notifications.push("Disconnected. trying to reconnect…");
			}
		}, 30000);
	});
	$factory.on("init", function(){
		$scope.$apply(function(){
			$scope.isActive = true;
			$factory.enter($scope.room.id);
			if($scope.notifications.indexOf("Disconnected. trying to reconnect…")<0) return;
			else {
				$scope.notifications.splice($scope.notifications.indexOf("Disconnected. trying to reconnect…"),1);
			}	
		});
	});
	$factory.on("error",function(error) {
		if(error == "AUTH_UNREGISTERED")return;
		if(error == "DUP_NICK") error = "Username already taken.";;
		if(error == "disconnected") {
			$scope.$apply(function(){
				error="Disconnected. trying to reconnect…";
				if($scope.notifications.indexOf(error)<0 && !$scope.isActive) {
					$scope.notifications.push(error);
				}
			});
			return;
		}
		if(error == "AUTH_REQ_TO_POST"){
			$scope.$apply(function() {
				$location.path("/me/login");
			});
			error="You must sign in to post in this room."
		}
		if(error=="API Limit exceeded") error = "Your message was not delivered because you sent too many messages in a very short time.";
		if(error=="REPEATATIVE") error = "Your message was not delivered because it seems repetitive.";
		if(error=="BANNED_WORD") error = "Your message was not delivered because something you said was flagged as inappropriate.";
		if(error == "INVALID_NAME") error= "Invalid user name";
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
			$scope.personaLogin();
			//$location.path("/me/login");
		}else {
			$location.path("/me/edit");	
		}	
	};
	$scope.personaLogin = function(){
		navigator.id.watch({
			onlogin: function(assertion){
				var message = {browserid:assertion, type: "nick", to:''};
				$scope.status.waiting = true;
				$factory.message(message, function(message){
					if(message.message && message.message == "AUTH_UNREGISTERED") {
						$scope.$apply(function() {
							$scope.status.waiting = false;
							$location.path("/me/edit");	
						});
					}
					else if(!message.message) {
						$scope.$apply(function() {
							$scope.status.waiting = false;
							if($scope.room.id) $location.path("/"+$scope.room.id);
							else $location.path("/me");
						});
					}
				});
			},
			onlogout: function() {
				$scope.$apply(function() {
					$scope.status.waiting = false;
					if($scope.room.id) $location.path("/"+$scope.room.id);
					else $location.path("/me/login");
				});
			}
		});
		navigator.id.request();
	};
	$scope.logout = function() {
		if($scope.room.id) $location.path("/" + $scope.room.id);
		else $location.path("/me/login");
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
	$scope.nickChange = function(event) {
		$scope.status.waiting = true;
		if($scope.user.id == "guest-"+$scope.displayNick){
			$location.path("/"+$scope.room.id);
			return;
		}
		
	    $factory.message({to:"",type:"nick", ref:"guest-"+$scope.displayNick}, function(message){
	    	if(message.message){
	    		//error
	    	}else{
	    		$scope.$apply(function() {
					$scope.status.waiting = false;
		    		$location.path("/"+$scope.room.id);	
	    		});
	    	}
	    });
	};
	$scope.goBack = function(){
//		$location.path("/"+$scope.room.id);
		$location.path("/me");
	};
	$scope.displayNick = ($scope.user.id).replace(/^guest-/,"");
}]);


scrollbackApp.controller('roomcontroller', function($scope, $timeout, $factory, $location, $routeParams) {
	if($factory.isActive ) {
		$factory.enter($routeParams.room);
	}else {
		$factory.on("init", function() {
			$factory.enter($routeParams.room);
		});
	}
	// getting users present in the room 
	
	function getDisplayList(occupants, members) {
		var userList = [], ctr=0;
		occupants = occupants.sort(function(a, b){ return a.id - b.id });
		
		function exists(element, userArray, startPos, endPos) {
			// binary search to see if element exists in userArray, if so return index of element, else return -1
			if(element === undefined) return -1;
			if(endPos < startPos)  return -1;
			var mid = Math.floor((startPos + endPos)/2);
			if( userArray[mid] && userArray[mid].id === element.id) return mid; 
			else if( userArray[mid] && userArray[mid].id > element.id ) return exists(element, userArray, 0, mid-1);
			else return exists(element, userArray, mid+1, endPos);
		}
		
		members.forEach(function(m) {
			if( (index = exists(m, occupants, 0, occupants.length)) > -1 ) {
				userList.push(m);
				console.log("Deleting memebers[m]", members[ctr]);
				members.splice(ctr, 1);
				console.log("Deleting occupants[index]", occupants[index]);
				occupants.splice(index, 1);
			}
			ctr++;
		});
		
		userList.push.apply(userList, occupants);
		userList.push.apply(userList, members);
		return userList;
	}
	
//	(function(){
//		// get occupants[]
//		var occupants, members;
//		$factory.occupants({occupantOf: $scope.room.id}, function(data){
//			occupants = data;
//		});
//		// get members[]
//		$factory.membership({memberOf: $scope.room.id}, function(data){
//			members = data;
//		});
//		$scope.usersPresent = getDisplayList(occupants, members);
//	})();
	
	
	
	$scope.goToRoomsView = function(){
		if(/^guest-/.test($scope.user.id)){ 
			$scope.personaLogin();
			//$location.path('/me/login');
		}
		else $location.path("/me");
	}
	$scope.toggleEmbed = function(){
		$('#embedScript').toggle();
	}
	$scope.isOwner = function() {
		if($scope.user.id == $scope.room.owner) return true;
		else return false;
	};
	$scope.goToConfigure = function() {
		if(/^guest-/.test($scope.user.id)){ 
			$scope.personaLogin();
			//$location.path('/me/login');
		}
		else $location.path("/"+$scope.room.id+"/edit");
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
			//$location.path('/me/login');
			$scope.personaLogin();
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
		//$scope.personaLogin();
        $location.path("/me/login");
    }
    $scope.goTo = function(room) {
    	if($scope.room.id == room){
    		$location.path("/"+room);
    	}else{
    		window.location = "/"+room;
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
	$scope.editRoom = {
		id: $scope.room.id,
		description:$scope.room.description|| "",
		params:{}
	};

	$scope.goBack = function(){
		$location.path("/"+$scope.room.id);
	};
	if((/^guest-/.test($scope.user.id))){
		$location.path("/"+$scope.room.id);
		return;
	}
	if($scope.user.id != $scope.room.owner && typeof $scope.room.owner!= "undefined") {
		$location.path("/"+$scope.room.id);
		return;
	}
	$scope.cancel = function() {
		$location.path("/"+$scope.room.id);
	};
	$scope.saveRoom = function() {
		var room={};
		$scope.editRoom.id = $scope.room.id;
		$scope.editRoom.name = $scope.room.id;
		$scope.editRoom.description = $scope.editRoom.description || "";
		$scope.editRoom.type = "room";
		if($scope.editRoom.ircServer && !$scope.editRoom.ircRoom) {
			return $factory.emit("error","Enter irc room name");
		}
		if(!$scope.editRoom.ircServer && $scope.editRoom.ircRoom) {
			return $factory.emit("error","Enter irc server");
		}
		if($scope.editRoom.ircServer && $scope.editRoom.ircRoom) {
			$scope.editRoom.accounts = [
				{
					gateway: "irc",
					id:"irc://"+$scope.editRoom.ircServer+"/"+$scope.editRoom.ircRoom,
					room: $scope.room.id,
					params:{}
				}
			];
			$scope.editRoom.params.irc = true;
		}else {
			$scope.editRoom.params.irc = false;
			delete $scope.editRoom.accounts;
		}
		//delete $scope.editRoom.ircServer; //what is the purpose of this?? 
		//delete $scope.editRoom.ircRoom
		$scope.status.waiting = true;
		$factory.room( $scope.editRoom, function(room) {
			if(room.message)	alert(room.message);
			else {
				$scope.$apply(function() {
					Object.keys(room).forEach(function(element){
						$scope.room[element] = room[element];
					});
					if(!$scope.room.params.irc) delete $scope.room.accounts;
					$location.path("/"+$scope.room.id);
					$scope.status.waiting = false;
				});
			}
		});
		
	};
}]);
scrollbackApp.controller('ircController',['$scope', function($scope) {
	if($scope.room.accounts && $scope.room.accounts.forEach) {
		$scope.room.accounts.forEach(function(account) {
			url = parseUrl($scope.room.accounts[0].id);
			if(url.protocol == "irc") {
				$scope.editRoom.ircServer = url.hostname;
				$scope.editRoom.ircRoom = url.hash;	
			}
		});
	}
}]);

scrollbackApp.controller('threaderController',['$scope', function($scope) {
	if(!$scope.editRoom.params) $scope.editRoom.params = {};
	$scope.editRoom.params.threader = $scope.room.params.threader?true:false;
}]);

scrollbackApp.controller('loginreqController',['$scope', function($scope) {
	//prefilling the editRoom object when the config Page is loaded.
	if(!$scope.editRoom.params) $scope.editRoom.params = {};
	$scope.editRoom.params.loginrequired = $scope.room.params.loginrequired?true:false;
}]);

scrollbackApp.controller('wordbanController',['$scope', function($scope) {
	if(!$scope.editRoom.params) $scope.editRoom.params = {};
	$scope.editRoom.params.wordban = $scope.room.params.wordban?true:false;
}]);

scrollbackApp.controller('rootController' , ['$scope', '$factory', '$location', function($scope, $factory, $location) {
	$scope.goBack = function() {
		$location.path("/"+$scope.room.id);	
	};
	$scope.status= {
		waiting : false
	};


	$factory.on('init', function(data){
		//assigning the new new init data to the user scope ---
		$scope.$apply(function(){
			console.log(" Sending init ", data);
			Object.keys(data.user).forEach(function(key){
				$scope.user[key] = data.user[key];
			});
		
			if(data.user.membership) {
				if(data.user.membership instanceof Array) $scope.user.membership = data.user.membership;
				else $scope.user.membership = Object.keys(data.user.membership);
			}
			
			if($scope.room.id) $location.path("/" + $scope.room.id);
			else $location.path("/me");
		});
	});
	
	$scope.cancelScreen = function(){
		if($scope.room.id) $location.path("/"+$scope.room.id);	
		else $location.path("/me");
	};
	
	$scope.isGuest = function(){
		return /^guest-/.test($scope.user.id);
	};
	
}]);

scrollbackApp.controller('profileController' , ['$scope', '$factory', '$location', function($scope, $factory, $location) {
	
	$scope.logout = function() {
		$factory.message({type:"nick", to:"", ref:"guest-"},function(message) {
			navigator.id.logout();
			if($scope.room.id) $location.path("/"+$scope.room.id);
			else $location.path("/me/login");
		});
	};
	$scope.save = function() {
		$scope.status.waiting = true;
		$factory.message({to:"",type:"nick", user:{id:$scope.nick,accounts:[]}}, function(message) {
			if(message.message) {
				//err .
				$scope.$apply(function() {
					$scope.status.waiting = false;
				});
			}else{
				$scope.$apply(function() {
					$scope.status.waiting = false;
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
