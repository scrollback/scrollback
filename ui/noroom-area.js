/* jshint browser: true */
/* global $, libsb, currentState */

var showMenu = require('./showmenu.js');

function showError(cb){
	libsb.emit('getUsers', {ref: currentState.roomName}, function(e, d){
		if(d.results){
			user = d.results[0];
			libsb.emit('navigate', {mode: 'profile', source: 'noroom'});
		}else{
            libsb.emit("navigate", {mode:'noroom', source: "noroom"});
        }
        if(cb) cb();
	});
}

libsb.on("navigate", function(state, next) {
    if(state.source == "noroom") return next();
    if(state.roomName !== state.old.roomName) {
        if(state.room) return next();
        showError(next);
    }
}, 500);

libsb.on('error-dn', function(err, next){
	var user;
	if(err.message === "NO_ROOM_WITH_GIVEN_ID"){
		showError(next);
	}else{
        next();
    }
}, 10);

libsb.on('navigate', function(state, next){
	if(state.mode === 'profile' && state.source === 'noroom'){
		$('#profileText').text(currentState.roomName);
	}
	next();
}, 100);

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
   }
});
