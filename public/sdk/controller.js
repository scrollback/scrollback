/* global $ */
/* global window */
/* global angular */
/* global document */
/* global scrollbackApp */
/* global messageArray */

scrollbackApp.controller('messageController', ['$scope', '$factory', '$timeout', function($scope, $factory, $timeout) {
	
	var messages = messageArray();
	var topIndex = 0, bottomIndex = 0;
	messages.load($scope.room.id);
	$scope.showMenu = false;
	$scope.items = [];
	$scope.test = true;
	$scope.hiddenMsgId = "";
	$scope.hide = false;
    
	if($scope.room.id){
		
		if($factory.initialized) {
			loadMessages();
		} else {
			$factory.on("init", function() {
				loadMessages();
			});
		}
		
	}
	
	function loadMessages() {
		$factory.messages($scope.room.id,null, null, function(data) {
			$scope.$apply(function() {
				$scope.messages = data;
				if($scope.messages) messages.merge($scope.messages.reverse());
				messages.save($scope.room.id);
				// initialising items with 50 messages initially 
				for (var i = 0; i < 50; i++) {
					if(topIndex < messages.length) {
						if(messages[topIndex].type == "text") $scope.items.unshift(messages[topIndex]);
						topIndex += 1;
					}
				}
				// $timeout(function(){ $('#body').nudgeInView(-99999); });
				$timeout(function(){ $('html, body').animate({scrollTop:$(document).height()}, 'slow'); }, 1);
			});
		});
    }
    
	
    $factory.on("nick", function(nick) {
        $scope.$apply(function() {
            $scope.user.id = nick;
        });
    });
	
    $factory.on("message", function(msg) {
		$scope.$apply(function(){
			newMessage(msg);    
		});
    });
	
	$factory.on('message', function(msg){
		var i, j;
		var toggleHide = function(){
			// function to toggle showing and hiding messages for non moderators
			if( $scope.items[i].labels[0]!=="hidden" && $scope.items[i].labels[1]!=="hidden" ){
				$scope.items[i].labels.push("hidden");
				console.log($scope.items[i]);
			}
			else{
				if($scope.items[i].labels){
					for(j = 0; j < $scope.items[i].labels.length; j++){
						if($scope.items[i].labels[j] == "hidden"){
							$scope.items[i].labels.splice(j, 1);
							break;
						}
					}
				}
			}
		};
		if(msg.type == "edit") { 
			for(i = 0; i < $scope.items.length; i++){
				if($scope.items[i].id === msg.ref && msg.from !== $scope.user.id){
					$scope.$apply(toggleHide);
				}
			}
		}
	});
	
    function newMessage(data) {
		
		var i, updated = false, deleted = false, bottom =false, index;
		
        if($(window).scrollTop() + $(window).height() > $(document).height() - 20) {
			bottom = true;
           // If a user is reading a message towards the bottom of the page, or typing something, a new incoming message must not 
           //reset the scrollposition.
//           $('html, body').animate({scrollTop:$(document).height()}, 'slow'); 
       }
       
        if(data.type && data.type!="text") return;
		
		angular.element('#nomessagediv').hide();
		
		for (i =0; i <=50 && i<messages.length; i++ ) {
            if (messages[i].id == data.id) {
                messages[i] = data;
                updated = true; 
                if(data.message) {
                    messages.splice(i,1);
                    deleted = true;
                }
                break;
            }
        }
		
        
		if (!updated && !data.message) {
            messages.unshift(data);
            index = 0;
        }else {
            index = i;
        }
		
		if(bottomIndex === 0) {
            //just to isolate the scope.
			(function(){
				
				var l=$scope.items.length,insertPosition=l-1,i;
				for(i=insertPosition;i>=0;i--) {
                    if($scope.items[i].id == data.id) {
                        $scope.items[i] = data;
                        if(data.message) {
                          $scope.items.splice(i,1);
                        } 
                        return;  
                    } 
                }
				if (!(deleted && !data.message)) $scope.items.push(messages[index]);
			})();
		}
		
		if(bottom) {
			$('#body').nudgeInView(-99999);
		}

    }
	
	
	$scope.$watch('items', function(items){
		var hashMap = {};
		
		items.forEach(function(item){
			
			if(!item.labels) return; 
			
			if(item.labels[0] !== 'hidden'){
				if(item.labels.length > 0) hashMap[item.labels[0].split(':')[0]] = "";
			}
		});
		
		$scope.convLabelList = Object.keys(hashMap);
		
	}, true);

	$scope.hideMsg = function(msg){
		var flag = false, i;
		if(!msg.labels) return false;
		for(i = 0; i < msg.labels.length; i++){
			if(msg.labels[i] == "hidden"){
				flag = true;
				break;
			}
		}
		if($scope.$parent.user.id !== $scope.$parent.room.owner) return flag;
		else return false;
	};
	
	$scope.showmenu = function(index, item, $event){
		
		if($event.target.className.indexOf('hidden') > -1 && $scope.user.id !== $scope.room.owner ) return;
		if($event.target.tagName.toLowerCase() == "a") return; // do not show menu when user clicks on an anchor tag
		
		var shareUser = $scope.user.id;
		var isHidden = false;
		
		$scope.selectedId = item.id;
		$scope.selectedIndex = index;
		$scope.showMenu = true;
		
		if( $scope.user.id.indexOf('guest-') === 0 ) shareUser = shareUser.substring(6);
		
		var twitterLink = encodeURI("http://twitter.com/home/?status=" + item.text  + " via https://scrollback.io/" + $scope.room.id);
		
		var facebookLink = "https://www.facebook.com/sharer/sharer.php?s=100&p[url]=" + encodeURIComponent("https://scrollback.io/" + $scope.room.id )
		+ "&p[images][0]=" + encodeURIComponent('https://scrollback.io/img/logod-72.png') + "&p[title]=Conversation on scrollback.io/"+ $scope.room.id 
		+ "&p[summary]=" + item.text;
		
		$scope.options = {
			'Tweet Message'	: function(){ window.open(twitterLink,'_blank'); }, 
			'Share on FB'   : function(){ window.open(facebookLink,'_blank'); }
		};
		
		if($scope.user.id === $scope.room.owner){
			//user is owner of the room, so show option to hide messages
			
			// firstly check if the message has the label hidden 
			$scope.items[index].labels.forEach(function(i){
					if(i === "hidden") isHidden = true;
			});
			
			var showMsgFn = function(){
					var labels = {};
					
					$scope.items[index].labels.forEach(function(i){
						if(i) labels[i] = 1;
					});
					labels.hidden = 0;
					
					var unhideMsg = {
						type : 'edit',
						ref : $scope.items[index].id,
						to : $scope.room.id,
						from : $scope.user.id,
						labels : labels
					};
				
					$factory.message(unhideMsg, function(){
						isHidden = false;
						var i;
						$scope.$apply(function(){
							for(i=0; i<$scope.items[index].labels.length; i++){
								if($scope.items[index].labels[i] === 'hidden'){
									$scope.items[index].labels.splice(i, 1);
								}
							}
						});
					});
			};
			var hideMsgFn = function() {
				var labels = {};
				$scope.items[index].labels.forEach(function(i){
					if(i) labels[i] = 1;
				});
				labels.hidden = 1;
				var hideMsg = {
					type : 'edit',
					ref : $scope.items[index].id,
					to : $scope.room.id,
					from : $scope.user.id,
					labels : labels
				};

				$factory.message(hideMsg, function() {
					$scope.$apply(function(){
						$scope.items[index].labels.push("hidden");
					});
				});
			};
			
			if(isHidden){
				$scope.options['Unhide Message'] = showMsgFn;
			}
			else{
				$scope.options['Hide Message'] = hideMsgFn;
			}
		}
	};

    $scope.message = function() {

		var text = $scope.text.trim(),message;
		var mentionedUsers = [];
		
		function isMember(m) {
			var i;
			if($scope.room.members) {
				for(i=0; i < $scope.room.members.length; i++ ) {
					if($scope.room.members[i].id === m) return 1;
				}
			}
			return 0;
		}
		
		function isMention(input) {
			//this function checks if any users were mentioned in a message 
			if( (/^@[a-z][a-z0-9\_\-\(\)]{2,32}[:,]?$/i).test(input) || (/^[a-z][a-z0-9\_\-\(\)]{2,32}:$/i).test(input)) {						
				input = input.toLowerCase();
				input = input.replace(/[@:,]/g,"");
				if(isMember(input)) mentionedUsers.push(input);
			}
		}
		
		text.split(' ').map(isMention);
		
        $scope.text = "";
        message = { type:"text", text: text, to: $scope.room.id, from: $scope.user.id, mentions: mentionedUsers };
        
		if(text !== "") {
            newMessage(message);
            $factory.message(message, function(data) {
                $scope.$apply(function() {
                    newMessage(data);    
                });
            });
        }
    };
    
//    $scope.gotoBottom = function() {
//        $scope.items.length = 0;
//        topIndex = 0, bottomIndex = 0;
//        for (var i = 0; i < 50; i++) {
//            if(topIndex < messages.length){
//                if(messages[topIndex].type == "text")
//                    $scope.items.unshift(messages[topIndex]);
//                topIndex += 1;
//            }
//        }
//    };
	
    $scope.loadMoreUp = function() {
        
		for (var i = 0; i < 15; i++) {
           
			if(topIndex < messages.length) {
                if(messages[topIndex].type === "text")
                    $scope.items.unshift(messages[topIndex]);
                topIndex += 1;
            }
			
            if(messages.length - topIndex === 30) {
                // time to request factory for messages from above 
                $factory.messages($scope.room.id, "", messages[messages.length - 1].time);
                $factory.on("messages", function(data){
                    if(data.length > 1 && data[data.length-1].type == "result-end") {
                        messages = messages.concat(data.reverse());
                    }
                });
            }
			
        }
		
        // removing elements from the bottom which are out of view scope 
        $timeout( function() {
            if($scope.items.length > 50) {
                while($scope.items.length > 50) {
                    if(messages[bottomIndex] && messages[bottomIndex].type != "text") bottomIndex += 1;
                    $scope.items.pop();
                    bottomIndex += 1;
                }
				$('#body').nudgeInView(0);
            }
        });
		
    };
    $scope.loadMoreDown = function() {
		var i;
        // TODO : popping from top
        for(i=0; i< 15; i++) {
              if(bottomIndex > 0) {
				bottomIndex -= 1;
                if(messages[bottomIndex] && messages[bottomIndex].type == 'text'){
                    $scope.items.push(messages[bottomIndex]);
				}
              }
        }
         //this is causing troubles, so the shift is being done only for 2 elements at a time, ideally
         // the while should be uncommented
        
		$timeout(function() {
            if($scope.items.length > 50) {
//                while($scope.items.length > 50){ 
                $scope.items.shift();
                $scope.items.shift();
                $scope.items.shift();
                topIndex -= 3;
//                 }
				$('#body').nudgeInView(0);
            }
        } , 1);
    };
	
}]);
