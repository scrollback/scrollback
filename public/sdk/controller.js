//scrollback.controller('Main' , [$scope , function($scope , factory , $timeout){
function messageController($scope, $factory, $timeout) {
    $scope.items = [];
    var messages = $scope.scopeObj.data;
    messages.reverse();
    var topCounter = 0, bottomIndex = 0;
    // initialising items with 25 messages initially 
    for (var i = 0; i < 25; i++) {
        if(topCounter < messages.length){
            $scope.items.unshift(messages[topCounter]);
            topCounter += 1;
        }
    }
    
    $factory.on("init", function() {
		if(window.scrollback.streams && window.scrollback.streams.length > 0) {
			$factory.listenTo(window.scrollback.streams[0]);
		}
	});
	

	function newMessage(data) {
		messages.unshift(data);
		console.log(bottomIndex, topCounter);
		if(!data.message && bottomIndex == 0 && data.type == "text") {
			$scope.$apply(function(){
				$scope.items.shift();
				$scope.items.push(messages[bottomIndex]);
			});
		}
	}

	$scope.message = function() {
		$factory.message({type:"text", text: $scope.text, 
			to: window.scrollback.streams && window.scrollback.streams[0]}, function(data) {
			newMessage(data);
		});
		$scope.text = "";
	};
	
    $scope.loadMoreUp = function() {    
		console.log("DOM size  ",$scope.items.length,messages.length);

		for (var i = 0; i < 5; i++) {
			if(topCounter < messages.length){
				$scope.items.unshift(messages[topCounter]);
				topCounter += 1;
		  	}
			  // factory.getMessages({to:"scrollback",type:"text", until:new Date().getTime()});
			  // if(messages.length - topCounter == 100){
			  //     factory.getMessa(messages[messages.length - 1].time , 256, function(messageArray){
			  //         messages.push.apply(messages , messageArray);
			  //     });
			  // }
		}
		// removing elements from the bottom which are out of view scope 
		$timeout( function(){
			console.log("timeout 1");
			if($scope.items.length > 50){
				while($scope.items.length > 50){ 
				  $scope.items.pop();
				  bottomIndex += 1;
				}
			}
		});
	};
    $scope.loadMoreDown = function(){   
        // TODO : popping from top :)
        // console.log("Top element ", messages[topCounter]);
        for(i=0; i< 5; i++){
              if(bottomIndex > 0){
                $scope.items.push(messages[bottomIndex]);
                bottomIndex -= 1;
              }
              if(bottomIndex == 0 && $scope.items[$scope.items.length-1] != messages[0]){
                $scope.items.push(messages[0]);
                bottomIndex = 0;
              }
        }
         //this is causing troubles, so the shift is being done only for 2 elements at a time, ideally the while should be uncommented
        $timeout(function(){
            if($scope.items.length > 50){
                //while($scope.items.length > 50){ 
                $scope.items.shift();
                $scope.items.shift();
                topCounter -= 2;
                 //}
            }
            console.log("I am called");
        } , 1);
    }
}

scrollbackApp.controller('messageController',messageController);

scrollbackApp.directive('message',function() {
	return{
		restrict: 'E',
		template: '<div class="scrollback-message" style="border-left-color: {{bcolor}}">'+
					'<span class="scrollback-message-separator">[</span>'+
					'<span class="scrollback-message-nick">{{nick}}</span>'+
					'<span class="scrollback-message-separator">]</span>'+
					'<span class="scrollback-message-content">{{text}}</span>'+
					'</div>',
		scope: {},
		link: function($scope, element, attr) {
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

			attr.$observe('from', function(value) {
				$scope.bcolor = hashColor(value);
				$scope.nick = (value.indexOf("guest-")!=0)?value: value.replace("guest-","");
            });
            attr.$observe('text', function(value) {
				$scope.text = " "+value;
            })
		}
	};
});


scrollbackApp.directive('whenScrolledUp', ['$timeout', function($timeout) {
	return function(scope, elm, attr) {
		var raw = elm[0];
		$timeout(function() {
			raw.scrollTop = raw.scrollHeight;          
		});         
		
		elm.bind('scroll', function() {
            if (raw.scrollTop <= 150) { // load more items before you hit the top
                var sh = raw.scrollHeight;
                scope.$apply(attr.whenScrolledUp);
                if(raw.scrollHeight > sh) raw.scrollTop = raw.scrollHeight - sh;
            }
            if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
              scope.$apply(attr.whenScrolledDown);
            }
		});
	};
}]);