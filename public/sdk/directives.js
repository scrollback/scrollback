var __glo_prevtime = 0;

scrollbackApp.directive('message',function($compile, $timeout) {
    
	return {
        
		restrict: 'E',
		template: '<span class="scrollback-message-nick">{{nick}}</span>'+
                  '<span ng-class="slashMe?me:noSlashMe" ng-repeat="i in text track by $index">'+
                            '<span ng-show="isText(i)">{{i.text}}</span>'+
                            '<span ng-show="!isText(i)"><a href="{{i.link}}" target="_blank">{{i.text}}</a></span>'+
		          '</span>'+
				  '<span ng-show= "showTime" class="scrollback-message-underline"></span>' + 
				  '<span ng-show = "showTime" class="scrollback-message-time"> {{time}}</span>',
        
		scope: {
			showMenu: '=',
			menuOptions: '=',
			label: '=',
			id: '@'
		},
        
		link: function($scope, element, attr) {
			
			var value;
			
			$scope.showTime = true;
			
			$messageControllerScope = $scope.$parent.$parent;
            
			$scope.me ="scrollback-message-content-me";
            $scope.noSlashMe="scrollback-message-content";
            
			$scope.isText = function(part) {
                return ((part.type=="link")?false:true);
            };
			
            attr.$observe('from', function(value) {
                $scope.nick = $scope.from = value.replace(/^guest-/,"");
            });
			
			$scope.$watch('label', function(v) {
				// todo, this has to be rewritten
				if(!v) return;
				var bcolor, i, value;
				if(v[0] == "" || v[1] == "hidden") {
					if($messageControllerScope.room.owner == $messageControllerScope.user.id) {
							$messageControllerScope.hiddenMsgId = $scope.id;
					}
					else {
						$messageControllerScope.hide = $scope.id;
					}
				}
			});
			
            attr.$observe('text', function(value) {
				$scope.slashMe = (/^\/me/.test(value));
                $scope.text = value;
				$scope.nick = "";
                if($scope.slashMe) {
					$timeout(function(){
						console.log("Slashme", $scope.slashMe, "$scope.from", $scope.from, $scope.text[0].text);
						value = $scope.text[0].text = $scope.text[0].text.replace(/^\/me/, $scope.from);
                    	$scope.nick = "";
					});
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
				
				var showDate = $scope.prettyDate(time, currtime);
				$scope.time = showDate;
			
			});
			
			$scope.prettyDate = function prettyDate(time, currTime) {
					
					var d = new Date(parseInt(time, 10)), n = new Date(currTime), domTime; 
				
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
					
					domTime = str + ' '+ d.getHours() + ':' + (d.getMinutes()<10? '0': '') + d.getMinutes();
					return domTime;
			
			};
			
			$timeout( function() {
				$scope.$watch('showMenu', function(val) {
					
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

scrollbackApp.directive('conversationStyles', function(){
	return{
		restrict: 'E',
//		template: '<style> {{styleString}} </style>',
		scope: {
			conversations : '='
		},
		link: function($scope, elem, attrs){
			$scope.$watch('conversations', function(value){
				if(!value) return;
				var str = "";
				var color;
				value.forEach(function(labelClass){
					color = hashColor(labelClass);
					str += '.conv' + labelClass + ':before' + '{ background: ' + color + ' !important; } \n';
				});
//				$scope.styleString = $scope.value;
				elem = elem.eq(0).html("<style>"+str+"</style>");
			});
		}
	}
});

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

        function darken(c, l) {
        	return Math.min(255, Math.round(c*(0.5/l)));
        }
        
        function rgb(r, g, b) {
        	var l = (0.3*r + 0.55*g + 0.15*b)/255;

            return "#" + hex(darken(r, l)) + hex(darken(g, l)) + hex(darken(b, l));
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