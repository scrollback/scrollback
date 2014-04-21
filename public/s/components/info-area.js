/* jshint browser: true */
/* global $, format, libsb */

var infoArea = {};

$(function() {
	var $template = $(".pane-info").eq(0);

	infoArea.render = function (room) {
		$template.find('.name').text(room.id);
		$template.find('.description').html(format.textToHtml(room.description || "This room has no description."));
	};
});

libsb.on('navigate', function(state, next) {
	if(state.room != state.old.room) {
		if(state.tab == 'info') infoArea.render({id: state.room, description: "Loading room description."});
		libsb.getRooms(state.room, function(err, room) {
			if(err) throw err;
			infoArea.render(room);
		});
	}
	next();
});
