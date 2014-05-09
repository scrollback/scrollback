/* jshint browser: true */
/* global $, format, libsb */

var infoArea = {};

$(function() {
	var $template = $(".pane-info").eq(0);
	infoArea.render = function (room) {
		if($('body').hasClass("guest-user"))  $('.configure-button').hide() ;
		$template.find('.name').text(room.id);
		$template.find('.description').html(format.textToHtml(room.description || "This room has no description."));
	};
	libsb.on("inited", function(q, n) {
		libsb.enter(window.location.pathname.split("/")[1]);
		n();
	})

});

function configButtonRender(user){
	// checks if the roomConfig button must be hidden for user
	libsb.emit("getRooms", {hasMember: user}, function(err, data){
		if(!err && data.results[0]){
			if(data.results[0].id !== currentState.room){
				// user is not owner of current room
				$('.configure-button').hide();
			} else{
				if(data.results[0].role !== "owner"){
					$('.configure-button').hide();
				} else{
					$('.configure-button').show();
				}

			}
		}
	});
}

libsb.on('room-dn', function(action, next){
	infoArea.render(action.room);
	next();
});

libsb.on('back-dn', function(back, next){
	configButtonRender(back.from);
	next();
});

libsb.on('init-dn', function(init, next){
	configButtonRender(init.user.id)
	next();
})

libsb.on('logout', function(logout, next){
	$('.configure-button').hide();
	next();
});

libsb.on('navigate', function(state, next) {
	if(!state.old || state.room != state.old.room) {
		if(state.tab == 'info')	 infoArea.render({id: state.room, description: "Loading room description."});
		function loadRooms() {
			libsb.getRooms({ ref: state.room }, function(err, room) {
				if(err) throw err;
				if(room.results && room.results.length)  infoArea.render(room.results[0]);
			});
		}
		
		if(libsb.isInited) {
			loadRooms();
		}else{
			libsb.on("inited", function(q, n) {
				loadRooms();
				n();
			})
		}
	}
	next();
});
