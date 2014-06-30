/* jshint browser: true */
/* global $, libsb, currentState */

var showMenu = require('./showmenu.js');

(function(){ // funciton wrapper to maintain the closure of msessageID.
    /*
    var messageID = -1;

    libsb.on('back-up', function(back, next){
        if(back.to === currentState.roomName){
            messageID = back.id;
        }
        next();
    }, 50); // execute at prio value 50, ie before socket(10) and after id-generator(100)*/

    libsb.on("navigate", function(state, next) {
        if(state.source == "noroom") return next();
        if(state.room === null && libsb.isInited) libsb.emit("navigate", {mode:'noroom', source: "noroom"});
        next();
    }, 500);
/*
    libsb.on('error-dn', function(err, next){
        if(err.id === messageID && err.message === "NO_ROOM_WITH_GIVEN_ID"){
            libsb.emit("navigate", {mode:'noroom'});
        }
        next();
    });*/

})();

$("#create-room-button").click(function(){
    var roomObj = {
        to: currentState.roomName,
        room: {
            id: currentState.roomName,
            description: '',
            params: {
                
            },
            guides: {}
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
		libsb.emit('auth-menu', {origin: $(this), buttons: {}, title: 'Sign in to Scrollback with'}, function(err, menu){
			showMenu(menu);
		});
	   	libsb.on('init-dn', function(init, next){
			showMenu.hide();
			next();
		}, 1000)
       // lace.modal.show({ body: $("#signin-dialog").html()});
   }
});
