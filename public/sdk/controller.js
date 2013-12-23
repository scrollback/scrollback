function messageController($scope, $factory, $timeout, $location, $anchorScroll) {
    $scope.items = [];
    var messages = messageArray();
        
    messages.load($scope.room.id);
    messages.merge($scope.messages.reverse());
    messages.save($scope.room.id);
        
    // console.log("Messages are loaded up", messages);
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
        if(msg.from != $scope.user.id) {
            newMessage(msg);  
        }
    });
    function newMessage(data) {
        // type is text, leave out err msgs, if any.. 
                angular.element('#nomessagediv').hide(); 
        messages.unshift(data);
        console.log("msg added to the cache... ", data.from, $scope.user.id);
        //messages.save($scope.scopeObj.room.name);
        if(data.from == $scope.user.id){
            $scope.gotoBottom(); 
            $scope.items.pop();
        }
        console.log("Bottom Index and top index are : ", bottomIndex, topIndex);
        if(!data.message && bottomIndex === 0 && data.type == "text") {
            $scope.$apply(function(){
                //$scope.items.shift();
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
//        $location.hash('endoflog');
//        $anchorScroll();
        }
    };

    $scope.loadMoreUp = function() {
        for (var i = 0; i < 5; i++) {
            if(topIndex < messages.length) {
                if(messages[topIndex].type == "text")
                    $scope.items.unshift(messages[topIndex]);
                topIndex += 1;
            }
            if(messages.length - topIndex == 20) {
                console.log("top reached", messages[topIndex]);
                // time to request factory for messages from above 
                $factory.messages($scope.room.id, "", messages[messages.length - 1].time);
                $factory.on("messages", function(data){
                    if(data.length > 1 && data[data.length-1].type == "result-end") {
                        console.log("concatenating now!", data[data.length-1]);
                        messages = messages.concat(data.reverse());
                    }
                    //console.log(" in factory.onMessages", data);emm
                    //console.log("current messages array" , messages);
                    //messages.merge(data);
                    //console.log("new messages after merge", messages);
                    //messages.save();
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
        // console.log("Top element ", messages[topIndex]);
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
        } , 1);
    };
}

scrollbackApp.controller('messageController', messageController);

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
                                //$scope.bcolor = hashColor(value);
                $scope.nick = (value.indexOf("guest-")!==0)?value: value.replace("guest-","");
            });
			attr.$observe('label', function(value) {
				if(value){
                    $scope.bcolor = hashColor(value);
                }
            });
            attr.$observe('text', function(value) {
                $scope.text = " "+value;
            });
        }
    };
});

scrollbackApp.directive('whenScrolledUp', ['$timeout', function($timeout) {
    return function(scope, elm, attr) {
        
        var raw = elm[0];
        var $ = angular.element;
        
        $(document).ready(function() {

            $('.column').fixInView();
            $('#body').nudgeInView(-$('#body').outerHeight() + $(window).innerHeight());
            $('#body').bind('reposition', function(e) {
                // console.log("reposition event is fired!", e.above, e.below, e.by);
//                console.log("Reposition ",e);
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
