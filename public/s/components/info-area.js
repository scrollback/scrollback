/* jshint browser: true */
/* global $, format, libsb */

var infoArea = {};

$(function() {
	var $template = $(".pane-info").eq(0);

	infoArea.render = function (room) {
		$template.find('.name').text(room.id);
		$template.find('.description').html(format.textToHtml(room.description || "This room has no description."));
	};
	libsb.on("inited", function(q, n) {
		libsb.enter(window.location.pathname.split("/")[1]);
		n();
	})

});

libsb.on('navigate', function(state, next) {
	if(!state.old || state.room != state.old.room) {
		if(state.tab == 'info') infoArea.render({id: state.room, description: "Loading room description."});
		

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
