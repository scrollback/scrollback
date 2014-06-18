/* jshint browser: true */
/* global $, libsb, lace, currentState */

(function(){ // funciton wrapper to maintain the closure of msessageID.
    var messageID = -1;
    
    libsb.on('back-up', function(back, next){
        if(back.to === currentState.roomName){
            messageID = back.id;
        }
        next();
    }, 50); // execute at prio value 50, ie before socket(10) and after id-generator(100)

    libsb.on('error-dn', function(err, next){
        if(err.id === messageID && err.message === "NO_ROOM_WITH_GIVEN_ID"){
            libsb.emit("navigate", {mode:'noroom'});
        }
        next();
    });

})();

$("#create-room-button").click(function(){
    var roomObj = {
        to: currentState.roomName,
        room: {
            id: currentState.roomName,
            description: '',
            params: {
                irc: {},
                http: {
                    seo: true
                },
                antiAbuse: {
                    offensive: true
                }
            }
        }
    };
    libsb.emit('room-up', roomObj,function(){
         libsb.emit("navigate", {mode: 'normal', tab: 'info'}, function(){
             location.reload();    
         });
    });
});

$("#login-and-create-room-button").click(function(){
   if($("body").hasClass("role-guest")) {
       lace.modal.show({ body: $("#login-dialog").html()});
   }
});
