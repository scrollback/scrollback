/* jshint browser: true */
/* global $, libsb, currentState */

var showMenu = require('./showmenu.js');

libsb.on('navigate', function(state, next){
	if(state.mode === 'profile' && state.source === 'noroom'){
		$('#profile-view-name').text(currentState.roomName);
	}
	next();
}, 100);

$("#noroom-view-create").on("click", function() {
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

$("#noroom-view-login").on("click", function() {
   if($("body").hasClass("role-guest")) {
		libsb.emit('auth-menu', {origin: $(this), buttons: {}, title: 'Sign in to Scrollback with'}, function(err, menu){
			showMenu(menu);
		});
   }
});
