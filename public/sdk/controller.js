//var scrollback = angular.module('scrollback',[]);

var scrollbackApp = angular.module("scrollbackApp", ['ngRoute']);

//scrollback.controller('Main' , [$scope , function($scope , factory , $timeout){
  function messageController($scope, $timeout) {
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

    $scope.loadMoreUp = function() {    
        console.log("DOM size  ",$scope.items.length);
        for (var i = 0; i < 5; i++) {
              if(topCounter < messages.length){
                  $scope.items.unshift(messages[topCounter]);
                  topCounter += 1;
              }

              // factory.getMessages({to:"scrollback",type:"text", until:new Date().getTime()});
              // if(messages.length - topCounter == 100){
              //     factory.getMessages(messages[messages.length - 1].time , 256, function(messageArray){
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