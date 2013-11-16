var scrollbackFactory = angular.module('scrollback' , []);

scrollbackFactory.factory('roomFactory', function(){
  factory = {};
  room = { title : " Sample Room"}
  
  factory.room = {
    id : "Sample ID provided by factory" , 
    name : " Factory Room " , 
    description : " This is a sample factory room " , 
    picture : "" , 
    profile : " This is the profile of the sample factory room"
  };

  return factory;
});   