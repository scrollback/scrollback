/* jshint browser: true */
/* global $, format, libsb, currentState */

var infoArea = {};

$(function() {
	var $template = $(".pane-info").eq(0);
	infoArea.render = function (room) {
		$template.find('.info-title').text(room.id);
		$template.find('.info-description').html(format.textToHtml(room.description || "This room has no description."));
	};
	libsb.on("inited", function(q, n) {
		if(currentState.embed == "toast") {
			libsb.enter(window.location.pathname.split("/")[1]);
		}
		n();
	}, 600);
});

libsb.on('room-dn', function(action, next){
	infoArea.render(action.room);
	next();
}, 600);

function loadRooms(state) {
	libsb.getRooms({ ref: state.roomName }, function(err, room) {
		if(err) throw err;
		if(room.results && room.results.length)  infoArea.render(room.results[0]);
	});
}

libsb.on('navigate', function(state, next) {
	if(state.tab == "info") {
		$(".pane-info").addClass("current");
	}else{
		$(".pane-info").removeClass("current");
	}
	if(state.roomName != state.old.roomName) {
		if(libsb.isInited) {
            if(state.tab == 'info')
				infoArea.render({id: state.roomName, description: "Loading room description."});
			loadRooms(state);
		}else{
			libsb.on("inited", function(q, n) {
                if(state.tab == 'info')
					infoArea.render({id: state.roomName, description: "Loading room description."});
				loadRooms(state);
				n();
			}, 500);
		}
	}
	next();
}, 600);
