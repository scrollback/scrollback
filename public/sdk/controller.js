//var scrollback = angular.module('scrollback',[]);

var scrollbackApp = angular.module("scrollbackApp" , ['ngRoute']);

//scrollback.controller('Main' , [$scope , function($scope , factory , $timeout){
  function messageController($scope, $timeout) {

    $scope.items = [];
    messages= ["aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","1","2","3","4","5","6","7","8","9","0","ai","bi","ci","di","ei","fi","gi","hi","ii","ji","ki","li","mi","ni","oi","pi","qi","ri","si","ti","ui","vi","wi","xi","yi","zi","0i","1i","2i","3i","4i","5i","6i","7i","8i","9i"];
    var topCounter = 0, bottomIndex = 0;
    // initialising items with 25 messages initially 
    for (var i = 0; i < 25; i++) {
              if(topCounter < messages.length){
                  $scope.items.unshift({id: messages[topCounter]});
                  topCounter += 1;
              }
    }

    $scope.loadMoreUp = function() {    
        console.log("DOM size  ",$scope.items.length);
        for (var i = 0; i < 5; i++) {
              if(topCounter < messages.length){
                  $scope.items.unshift({id: messages[topCounter]});
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
                $scope.items.push({id: messages[bottomIndex]});
                bottomIndex -= 1;
              }
              if(bottomIndex == 0 && $scope.items[$scope.items.length-1].id != messages[0]){
                $scope.items.push({id: messages[0]});
                bottomIndex = 0;
              }
        }
        // this is causing troubles :( )
        // $timeout( function(){
        //     if($scope.items.length > 30){
        //         while($scope.items.length > 30){ 
        //           $scope.items.shift();
        //           topCounter -= 1;
        //         }
        //     }
        //     console.log("I am called");
        // } , 1);
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


console.log(ang);