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
	});
});

libsb.on('room-dn', function(action, next){
	infoArea.render(action.room);
	next();
});


libsb.on('navigate', function(state, next) {
	if(state.tab == "info") {
		$(".pane-info").addClass("current");
	}else{
		$(".pane-info").removeClass("current");
	}
	if(!state.old || state.room != state.old.room) {
		function loadRooms() {
			libsb.getRooms({ ref: state.room }, function(err, room) {
				if(err) throw err;
				if(room.results && room.results.length)  infoArea.render(room.results[0]);
			});
		}

		if(libsb.isInited) {
                        if(state.tab == 'info')	 infoArea.render({id: state.room, description: "Loading room description."});
			loadRooms();
		}else{
			libsb.on("inited", function(q, n) {
                                if(state.tab == 'info')	 infoArea.render({id: state.room, description: "Loading room description."});
				loadRooms();
				n();
			});
		}
	}
	next();
});
