var __glo_prevtime = 0;

function messageController($scope, $factory, $timeout, $location, $anchorScroll) {
    $scope.items = [];
    var messages = messageArray();
        
    messages.load($scope.room.id);
    messages.merge($scope.messages.reverse());
    messages.save($scope.room.id);
   var topIndex = 0, bottomIndex = 0;
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
        var i, updated,deleted = false,index;

        if($(window).scrollTop() + $(window).height() > $(document).height() - 20) {
           // If a user is reading a message towards the bottom of the page, or typing something, a new incoming message must not 
           //reset the scrollposition.
           $('html, body').animate({scrollTop:$(document).height()}, 'slow'); 
          if($(window).scrollTop() + $(window).height() == $(document).height()) $('#body').nudgeInView(0);
       }
       
        if(data.type && data.type!="text") return;
		angular.element('#nomessagediv').hide();
		for (i =0; i <=30 && i<messages.length; i++ ) {
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
//			$scope.gotoBottom(); 
		if(bottomIndex === 0) {
            //just to isolate the scope.
			(function(){
                var l=$scope.items.length,insertPosition=l-1,i;
                for(i=insertPosition;i>0;i--) {
                    if($scope.items[i].id == data.id){
                        $scope.items[i] = data;
                        if(data.message){
                          $scope.items.splice(i,1);
                        } 
                        return;  
                    } 
                }
				(deleted && !data.message) || $scope.items.push(messages[index]);
			})();
		}
    }

    $scope.message = function() {
        var text = $scope.text.trim(),message;
		var mentionedUsers = [];
		
		function isMention(input){
			//this function checks if any users were mentioned in a message 
			if( (/^@[a-z][a-z0-9\_\-\(\)]{2,32}[:,]?$/i).test(input) || (/^[a-z][a-z0-9\_\-\(\)]{2,32}:$/i).test(input)) mentionedUsers.push(input.replace(/[@:,]/g,""));
		}

		text.split(' ').map(isMention);
        $scope.text = "";
        message = {type:"text", text: text, to: $scope.room.id, from: $scope.user.id, mentions: mentionedUsers};
        if(text !== "") {
            newMessage(message);
            $factory.message(message, function(data) {
                $scope.$apply(function(){
                    newMessage(data);    
                });
            });
        }
    };
    
    // $scope.loadMoreAt = function(time, before, after, callback) {

    // };
    $scope.gotoBottom = function() {
        $scope.items.length = 0;
        topIndex = 0, bottomIndex = 0;
        for (var i = 0; i < 50; i++) {
            if(topIndex < messages.length){
                if(messages[topIndex].type == "text")
                    $scope.items.unshift(messages[topIndex]);
                topIndex += 1;
            }
        }
    };

    $scope.loadMoreUp = function() {
        for (var i = 0; i < 5; i++) {
            if(topIndex < messages.length) {
                if(messages[topIndex].type == "text")
                    $scope.items.unshift(messages[topIndex]);
                topIndex += 1;
            }
            if(messages.length - topIndex == 30) {
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
                    if(messages[bottomIndex].type != "text") bottomIndex += 1;
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
                if(messages[bottomIndex].type == 'text')
                    $scope.items.push(messages[bottomIndex]);
                bottomIndex -= 1;
              }
              if(bottomIndex === 0 && $scope.items[$scope.items.length-1] != messages[0]) {
                if(messages[0].type == "text")
                    $scope.items.push(messages[0]);
                bottomIndex = 0;
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
			
			if($(window).scrollTop() + $(window).height() == $(document).height()) $('#body').nudgeInView(0);
			
        } , 1);
    };
}

scrollbackApp.controller('messageController', messageController);

scrollbackApp.directive('message',function($compile) {
    return{
        restrict: 'E',
        template: '<div class="scrollback-message" style="border-left-color: {{bcolor}}">'+
                        '<span class="scrollback-message-separator">[</span>'+
                        '<span class="scrollback-message-nick">{{nick}}</span>'+
                        '<span class="scrollback-message-separator">]</span>'+
                        '<span ng-class="slashMe?me:noSlashMe" ng-repeat="i in text track by $index">'+
                            '<span ng-show="isText(i)">{{i.text}}</span>'+
                            '<span ng-show="!isText(i)"><a href="{{i.link}}">{{i.text}}</a></span></span>'+
						'<span class = "socialButton" title="Tweet this message"><a href="{{twitterText}}"  target="_blank" ng-class="{darken : hover}" ng-mouseenter="hover=true" ng-mouseleave="hover=false" class="fa fa-twitter default"></a> </span>'+
						'<span ng-show = "showTime" class="scrollback-message-time"> {{time}}</span>'
						
                    +'</div>',
        scope: true,
        link: function($scope, element, attr) {
            var value;
            $scope.me="scrollback-message-content-me";
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
				
				
				$scope.twitterText = encodeURI("http://twitter.com/home/?status=" + value + " via https://scrollback.io/" + $scope.room.id);
				
            });
			attr.$observe('time', function(value){
				var currtime = new Date().getTime();
				var time = value;
				
				console.log("Diff:", time - __glo_prevtime);
				console.log("new : ", time - (new Date().getTime()));
				
				if(time - __glo_prevtime > 60000 ) $scope.showTime = true; 
				else $scope.showTime = false;
				
				__glo_prevtime = time;
				
				var showDate = prettyDate(time, currtime);
				$scope.time = 'Sent ' + showDate;
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
			}
			
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
                }
            });
        });



        // elm.bind('scroll', function() {
        //     if (raw.scrollTop <= 150) { // load more items before you hit the top
        //         var sh = raw.scrollHeight;
        //         scope.$apply(attr.whenScrolledUp);
        //         if(raw.scrollHeight > sh) raw.scrollTop = raw.scrollHeight - sh;
        //     }
        //     if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight - 50) {
        //       scope.$apply(attr.whenScrolledDown);
        //     }
        // });
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
