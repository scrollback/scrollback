var __glo_prevtime = 0;

function messageController($scope, $factory, $timeout, $location, $anchorScroll) {
	
	var messages = messageArray();
	var topIndex = 0, bottomIndex = 0;
	
	$scope.showMenu = false;
	$scope.messages = sbmessages;
	$scope.items = [];
    
    messages.load($scope.room.id);
	if($scope.messages) messages.merge($scope.messages.reverse());
    messages.save($scope.room.id);

	// initialising items with 50 messages initially 
    for (var i = 0; i < 50; i++) {
        if(topIndex < messages.length){
            if(messages[topIndex].type == "text")
                $scope.items.unshift(messages[topIndex]);
            topIndex += 1;
        }
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
	
    function newMessage(data) {
		
		var i, updated = false, deleted = false, index;
		
        if($(window).scrollTop() + $(window).height() > $(document).height() - 20) {
           // If a user is reading a message towards the bottom of the page, or typing something, a new incoming message must not 
           //reset the scrollposition.
           $('html, body').animate({scrollTop:$(document).height()}, 'slow'); 
          if($(window).scrollTop() + $(window).height() == $(document).height()) $('#body').nudgeInView(0);
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
				
				(deleted && !data.message) || $scope.items.push(messages[index]);
			
			})();
		}
    }
	
	$scope.showmenu = function(index, item){
		
		var el = angular.element('.scrollback-message').eq(index);
		var shareUser = $scope.user.id;
		
		$scope.selectedId = item.id;
		$scope.selectedIndex = index;
		$scope.showMenu = true;
		
		if( $scope.user.id.indexOf('guest-') === 0 ) shareUser = shareUser.substring(6);
		
		if(item.text.indexOf('/me') === 0) item.text = item.text.replace('/me', shareUser);
		
		var twitterLink = encodeURI("http://twitter.com/home/?status=" + item.text  + " via https://scrollback.io/" + $scope.room.id);
		
		var facebookLink = "https://www.facebook.com/sharer/sharer.php?s=100&p[url]=" + encodeURIComponent("https://scrollback.io/" + $scope.room.id ) 
		+ "&p[images][0]=" + encodeURIComponent('https://scrollback.io/img/logod-72.png') + "&p[title]=Conversation on scrollback.io/"+ $scope.room.id 
		+ "&p[summary]=" + item.text;
		
		$scope.options = {
			'Tweet Message'	: function(){ window.open(twitterLink,'_blank'); }, 
			'Share on FB'   : function(){ window.open(facebookLink,'_blank'); } 
		};
		
	};

    $scope.message = function() {

		var text = $scope.text.trim(),message;
		var mentionedUsers = [];
		
		function isMember(m) {
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
        
		for (var i = 0; i < 5; i++) {
           
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
            }
        });
		
    };
    $scope.loadMoreDown = function() {
        // TODO : popping from top :)
        for(i=0; i< 5; i++) {
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
                //while($scope.items.length > 50){ 
                $scope.items.shift();
                $scope.items.shift();
                $scope.items.shift();
                topIndex -= 3;
                 //}
            }
        } , 1);
    };
	
	$timeout(function(){ $('html, body').animate({scrollTop:$(document).height()}, 'slow'); }, 1); //scrolling down to bottom of page.
}

scrollbackApp.controller('messageController', messageController);

scrollbackApp.directive('message',function($compile, $timeout) {
    
	return {
        
		restrict: 'E',
        
		template: '<div class="scrollback-message" style="border-left-color: {{bcolor}}">'+
                        '<span class="scrollback-message-separator">[</span>'+
                        '<span class="scrollback-message-nick">{{nick}}</span>'+
                        '<span class="scrollback-message-separator">]</span>'+
                        '<span ng-class="slashMe?me:noSlashMe" ng-repeat="i in text track by $index">'+
                            '<span ng-show="isText(i)">{{i.text}}</span>'+
                            '<span ng-show="!isText(i)"><a href="{{i.link}}">{{i.text}}</a></span></span>'+
						'<span ng-show = "showTime" class="scrollback-message-time"> {{time}}</span>'+'</div>',
        
		scope: {
			showMenu: '=',
			menuOptions: '='
		},
        
		link: function($scope, element, attr) {
			var value;
            
			$scope.me ="scrollback-message-content-me";
            $scope.noSlashMe="scrollback-message-content";
            
			$scope.isText = function(part) {
                return ((part.type=="link")?false:true);
            };
			
            attr.$observe('from', function(value) {
                $scope.nick = $scope.from = value.replace(/^guest-/,"");
            });
			
            attr.$observe('label', function(value) {
            
				value = value.substring(0,32);
                if(value)$scope.bcolor = hashColor(value);
                else $scope.bcolor = "";
            
			});
			
            attr.$observe('text', function(value) {
                
				$scope.slashMe = (/^\/me/.test(value));
                $scope.text = value;
                if($scope.slashMe) {
                    value = $scope.text = $scope.text.replace(/^\/me/, $scope.from);
                    $scope.nick = ""; 
                }else {
                    $scope.nick = $scope.from; 
                }
                $scope.text = format($scope.text);
				
            });
			
			attr.$observe('time', function(value) {
			
				var currtime = new Date().getTime();
				
				var time = value;

				if (time - __glo_prevtime > 60000) $scope.showTime = true; 
				else $scope.showTime = false;
				
				__glo_prevtime = time;
				
				var showDate = prettyDate(time, currtime);
				$scope.time = showDate;
			
			});
			
			$scope.prettyDate = function prettyDate(time, currTime) {
					
					var d = new Date(parseInt(time, 10)), n = new Date(currTime),
					day_diff = (n.getTime()-d.getTime())/86400000,
					weekDays=["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday",
						"Friday", "Saturday"],
					months=["January", "February", "March", "April", "May", "June", "July",
						"August", "September", "October", "November", "December"],
					str = "";
					if (day_diff > 6) {
						str+=months[d.getMonth()] + ' ' + d.getDate();
						str = (d.getFullYear() !== n.getFullYear()? d.getFullYear() + ' ': '')+str;
					}
					else{
						str = str || day_diff > 1? weekDays[d.getDay()]: d.getDay()!=n.getDay()?
						'yesterday': '';
					}
					
					return str + ' at '+ d.getHours() + ':' +
						(d.getMinutes()<10? '0': '') + d.getMinutes();
			
			};
			
			$timeout( function(){
				$scope.$watch('showMenu', function(val){
					
					$messageControllerScope = $scope.$parent.$parent;
					
					if( val === true) {
						
						if($messageControllerScope.selectedIndex && $messageControllerScope.selectedIndex === $scope.$parent.$index) {
							
							var el = angular.element('.scrollback-message').eq($scope.$parent.$index);
							$messageControllerScope.showMenu = false;
							
							options = $messageControllerScope.options;
							element = el.eq(0);
							
							(function showMenu(el, opt) {
								var layer = $("<div>").addClass('layer').click(hide);
								var menu = $("<div>").addClass('menu').addClass('clearfix');
								var arrow = $("<div>").addClass('arrow').appendTo(menu);
								
								for(i in opt) {
									$("<button>").addClass('menuitem').text(i).click( {option: i}, function(event) {
										opt[event.data.option]();
										hide();
									}).appendTo(menu);
								}
								
								$('body').append(layer, menu);
								
								var elt = el.offset().top - $(document).scrollTop() + 5; // element top relative to window
								var ell = el.offset().left - $(document).scrollLeft() - 100;
								var elw = el.width();
								var elh = el.height();
								
								var scrw = $(window).width();
								var scrh = $(window).height();
								
								var menuw = menu.width();
								var menuh = menu.height();
								
								var spaceBelow = scrh - elt - elh;
								
								if(spaceBelow > menuh) {
									arrow.addClass('up');
									menut = elt + elh;
								}
								else {
									arrow.addClass('down');
									menut = elt - menuh;
								}
								
								// default:
								var menul = ell + (elw - menuw)/2;
								
								if(menul < 0) menul = 0;
								else if(menul > scrw - menuw) menul = scrw - menuw;
								
								if(arrow.hasClass("up")) arrow.css({left: menul + 152 , top: menut - 8});
								else arrow.css({left: menul + 152 , top: menut + menuh});
								
								menu.css({left: menul, top: menut});
								
								function hide() {
									$(".layer").remove();
									$(".menu").remove();
									$(".arrow").remove();
									$messageControllerScope.$apply(function(){
										$messageControllerScope.selectedId = null;
									});
								}
							})(element, options);
						}
					}
				});
			});
			
        }
    }
});

scrollbackApp.directive('whenScrolledUp', ['$timeout', function($timeout) {
    
	return function(scope, elm, attr) {
        
        var raw = elm[0];
        var $ = angular.element;
        
        $(document).ready(function() {
            $('.column').fixInView();
            $('#body').nudgeInView(-$('#body').outerHeight() + $(window).innerHeight());
            $('#body').bind('reposition', function(e) {
                if(e.above < 150 && e.by<0) {
                    scope.$apply(attr.whenScrolledUp);
                    $('#body').nudgeInView(-$('#body').outerHeight() + e.height);
                }
                else if(e.below < 30) {
					scope.$apply(attr.whenScrolledDown);
					$('#body').nudgeInView(1);
                }
            });
        });
    };
}]);


function hashColor(name) {
    if (!name) return '#999';
    name = name.toLowerCase().replace(/[^a-z0-9]+/g,' ').replace(/^\s+/g,'').replace(/\s+$/g,''); 
    // nicks that differ only by case or punctuation should get the same color.
    
    function hash(s) {
        var h=7, i, l;
        s = s.toLowerCase().replace(/[^a-z0-9]+/g,' ').replace(/^\s+/g,'').replace(/\s+$/g,''); 
        // nicks that differ only by case or punctuation should get the same color.
        for (i=0, l=s.length; i<l; i++) {
            h = (h*31+s.charCodeAt(i)*479)%1531;
        }
        return h%1530;
    }
    
    function color(h) {
        // h must be between [0, 1529] inclusive
        
        function hex(n) {
            var h = n.toString(16);
            h = h.length==1? "0"+h: h;
            return h;
        }
        
        function rgb(r, g, b) {
            return "#" + hex(r) + hex(g) + hex(b);
        }
        
        if(h<255) return rgb(255, h, 0);
        else if(h<510) return rgb(255-(h-255), 255, 0);
        else if(h<765) return rgb(0, 255, h-510);
        else if(h<1020) return rgb(0, 255-(h-765), 255);
        else if(h<1275) return rgb(h-1020, 0, 255);
        else return rgb(255, 0, 255-(h-1275));
    }
    return color(hash(name));
}



function format(text) {
    var parts = [];
    if(!text) return "";
    var u = /\b(https?\:\/\/)?([\w.\-]*@)?((?:[a-z0-9\-]+)(?:\.[a-z0-9\-]+)*(?:\.[a-z]{2,4}))((?:\/|\?)\S*)?\b/g;
    var r, s=0, protocol, user, domain, path;

    while((r = u.exec(text)) !== null) {
         if(text.substring(s, r.index)) parts.push({type:"text", text: text.substring(s, r.index)});
        protocol = r[1], user = r[2], domain = r[3], path = r[4] || '';                    
        protocol = protocol || (user? 'mailto:': 'http://');
        user = user || '';
        s = u.lastIndex;
        parts.push({type:"link", link:protocol + user + domain + path, text:r[0]});
    }
    if(text.substring(s))   parts.push({type:"text", text: text.substring(s)});
    return parts;
}
