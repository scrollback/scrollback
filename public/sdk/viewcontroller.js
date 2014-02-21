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
	
	$scope.userAction = function(){
		if(/^guest-/.test($scope.user.id)){
			$scope.profile();
		}	
		else{
			$scope.logout();
		}
	}
	
	if(/^guest-/.test($scope.user.id)){
		$scope.actionText = "Sign In ";	
	}
	else{
		$scope.actionText = "Sign Out";
	}
	
	$factory.on("init", function(){
		$scope.$apply(function(){
			if(/^guest-/.test($scope.user.id)){
				$scope.actionText = "Sign In ";	
			}
			else{
				$scope.actionText = "Sign Out";
			}
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
		if (error == "TWITTER_LOGIN_ERROR") error = "Something went wrong during twitter authentication.";  
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
	$scope.timeout = null;
	if($factory.isActive ) {
		$factory.enter($routeParams.room);
	}else {
		$factory.on("init", function() {
			$factory.enter($routeParams.room);
		});
	}
	
	function camelCase(input) {
		if(input){
			var inputArr = input.split('');
			inputArr[0] = inputArr[0].toUpperCase();
			return inputArr.join('');
		}
	}
	
	
	function getRoomName(roomId) {
		var roomWords = roomId.split('-');
		var newroomWords = roomWords.map(function(name){
			return camelCase(name);
		});
		return newroomWords.join(' ');
	}
	
	$scope.room.name = getRoomName($scope.room.id); 
	
		
	if($scope.room.members) $scope.room.members.length = 0;
	function generateSortedList(members, occupants) {
		var userMap = {}, userArray=[];
		members.forEach(function(member) {
			if(!member || !member.id || !member.picture) return;
			if(!userMap[member.id]){
				if(member.id === $scope.room.owner) member.score = 1.5;
				else member.score = 1;
				userMap[member.id] = member;
				userArray.push(member);	
			}else{
				if(member.id === $scope.room.owner) member.score = 1.5;
				else member.score = 1;
			}
		});
		occupants.forEach(function(occupant) {
			if(!occupant || !occupant.id || !occupant.picture) return;
			if(userMap[occupant.id]) {
				userMap[occupant.id].score +=2;	
			}else {
				userMap[occupant.id] = occupant;
				occupant.score = 2;
				userArray.push(occupant);
			}
		});
		userArray.sort(function(a,b) {
			return -(a.score-b.score);
		});
		return userArray;
		
	}
	function refreshList(members, occupants){
		$scope.$apply(function(){
			if($scope.timeout) {
				clearTimeout($scope.timeout);
			}
			$scope.timeout = setTimeout(function() {
				$scope.$apply(function() {
					$scope.room.relatedUser = generateSortedList(members, occupants);
				});
			}, 1000);
		});
	}
	function loadMembers() {
		var usersList; 
		var occupants, members;
		$factory.membership({memberOf: $scope.room.id}, function(data){
			$scope.$apply(function(){
				members = data.data;
				$factory.occupants({occupantOf: $scope.room.id}, function(data) {
					$scope.$apply(function() {
						occupants = data.data;
						usersList = generateSortedList(members, occupants);

						$scope.room.relatedUser = usersList;
					});
				});
			});
		});
		$factory.on("message", function(i){
			if(occupants && members){
				if(i.type == "back"){
					if(i.user) {
						user = i.user;
						if(user.id !== $scope.user.id) {
							occupants.push(user);
							refreshList(members, occupants);
						}
					}else{
						return;
					}
				}
				if(i.type == "away"){
					// remove user from list. 
					for(j=0; j< occupants.length; j++) {
						if(occupants[j] && occupants[j].id === i.from) {
							break;
						}
					}
					if(j == occupants.length) return;
					occupants.splice(j, 1);
					refreshList(members, occupants);
				}
				if(i.type == "join") {
					if(i.user) {
						user = i.user;
						members.push(user);
						refreshList(members, occupants);
					}
				}
				if(i.type == "part"){
					// remove user from members list
					for(j=0; j< members.length; j++) {
						if(members[j].id === i.from) {
							break;
						}
					}
					if(j == members.length) return;
					members.splice(j, 1);
					refreshList(members, occupants);
				}
				if(i.type == "nick"){
					for(j=0; j< occupants.length; j++){
						//figure out why this has null. 
						if(occupants[j] && occupants[j].id === i.from){
							break;
						}
					}
					if(j == occupants.length) return;
					$factory.getUsers({id:i.ref}, function(user) {
						occupants.splice(j, 1);
						user = user.data[0];
						occupants.push(user);
						refreshList(members, occupants);	
					});
				}
			}
		});
	}
	if($factory.isActive ) {
		loadMembers();
	}else {
		$factory.on("init", function() {
			loadMembers();
		});
	}
	
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
					if($scope.room.members[i].id === $scope.user.id && $scope.room.members[i].id != $scope.room.owner ){
						$scope.room.members.splice(i,1);
						break;
					}
				}
			}
		}
	};
	
	$scope.joinRoom = function() {
		var msg = {};
		var flag = 1;
		if(/^guest-/.test($scope.user.id)){
			//guest
			//$location.path('/me/login');
			$scope.personaLogin();
			return;
		}
		msg.to = $scope.room.id;
		msg.type = "join";
		$factory.message(msg);
		
		if(!$scope.room.members){ $scope.room.members= [] }
			
		for(i=0; i < $scope.room.members.length; i++ ) {
			if($scope.room.members[i].id === $scope.user.id){
				flag = 0;
				break;
			}
		};
			
		if(flag == 1){
			$scope.room.members.unshift($scope.user);
		}
		$scope.user.membership.unshift($scope.room.id);
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
		if ($scope.twitterUsername) {
			if(!$scope.editRoom.identities) $scope.editRoom.identities = [];
			$scope.editRoom.identities.push("twitter://" + $scope.twitterUsername + ":" + $scope.room.id);
			$scope.editRoom.params.twitter = {};
			$scope.editRoom.params.twitter.tags = $scope.twitterTags;
			$scope.editRoom.params.twitter.id = $scope.twitterUsername;
		}
		else {
			$scope.editRoom.params.twitter = false;
		}
		if(!$scope.editRoom.ircServer && $scope.editRoom.ircRoom) {
			return $factory.emit("error","Enter irc server");
		}
		if($scope.editRoom.ircServer && $scope.editRoom.ircRoom) {
			if(!$scope.editRoom.accounts) $scope.editRoom.accounts = [];
			$scope.editRoom.accounts.push({
					gateway: "irc",
					id:"irc://"+$scope.editRoom.ircServer+"/"+$scope.editRoom.ircRoom,
					room: $scope.room.id,
					params:{}
			});
			$scope.editRoom.params.irc = true;
		}else {
			$scope.editRoom.params.irc = false;
			//delete $scope.editRoom.accounts;
		}
		//delete $scope.editRoom.ircServer; //what is the purpose of this?? 
		//delete $scope.editRoom.ircRoom
		$scope.status.waiting = true;
		$factory.room( $scope.editRoom, function(room) {
			if(!room.message){
				$scope.$apply(function() {
					Object.keys(room).forEach(function(element){
						$scope.room[element] = room[element];
					});
					//if(!$scope.room.params.irc) delete $scope.room.accounts;
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

scrollbackApp.controller('loginreqController',['$scope', function($scope) {
	//prefilling the editRoom object when the config Page is loaded.
	if(!$scope.editRoom.params) $scope.editRoom.params = {};
	$scope.editRoom.params.loginrequired = $scope.room.params.loginrequired?true:false;
}]);

scrollbackApp.controller('seoController',['$scope', function($scope) {
	//prefilling the editRoom object when the config Page is loaded.
	if(!$scope.editRoom.params) $scope.editRoom.params = {};
	if(typeof $scope.room.params.allowSEO === "undefined") $scope.room.params.allowSEO = true; 
	$scope.editRoom.params.allowSEO = $scope.room.params.allowSEO?true:false;
}]);

scrollbackApp.controller('wordbanController',['$scope', function($scope) {
	if(!$scope.editRoom.params) $scope.editRoom.params = {};
	$scope.editRoom.params.wordban = $scope.room.params.wordban?true:false;
}]);

scrollbackApp.controller('twitterController',['$scope', function($scope) {
	$scope.twitterLogin = function(){
		window.open("/r/twitter/login", 'mywin','left=20,top=20,width=500,height=500,toolbar=1,resizable=0');
		if(!$scope.isEventAdded) $scope.loginEvent();
		$scope.isEventAdded = true;
		return false;
	};
	$scope.loginEvent = function() {
		window.addEventListener("message", function(event) {
			var suffix = "scrollback.io";
			var isOrigin = event.origin.indexOf(suffix, event.origin.length - suffix.length) !== -1;
			if (isOrigin) {
				$scope.$apply(function() {
					$scope.$parent.twitterUsername = event.data;
				});
			}
		}, false);
	};
	if($scope.room.params && $scope.room.params.twitter) {
		$scope.$parent.twitterTags = $scope.room.params.twitter.tags;
		$scope.$parent.twitterUsername = $scope.room.params.twitter.id;
	}
}]);

scrollbackApp.controller('rootController' , ['$scope', '$factory', '$location', function($scope, $factory, $location) {
	$scope.room = sbroom;
	$scope.user = sbuser;
	$scope.notifications = [];
	$scope.goBack = function() {
		$location.path("/"+$scope.room.id);	
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
		
			if(data.user.membership) {
				if(data.user.membership instanceof Array) $scope.user.membership = data.user.membership;
				else $scope.user.membership = Object.keys(data.user.membership);
			}
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
