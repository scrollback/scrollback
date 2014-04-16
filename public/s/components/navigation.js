/* jshint browser: true */
/* jshint jquery: true */
/* global libsb, infoArea, peopleArea, threadArea, textArea */

var navigation = {};

(function() {
	var current = {};

	navigation.set = function(state) {
		if(state.mode != current.mode) {
			$(document.body).removeClass(current.mode + '-mode');
			$(document.body).addClass(state.mode + '-mode');
			$(".tab.current, .pane.current").removeClass("current");
			$(".tab.mode-" + state.mode).eq(0).click();
		}

		if(state.room != current.room) {
			infoArea.render({id: state.room, description: "Loading room description."});
			libsb.getRooms(state.room, function(err, room) {
				if(err) throw err;
				infoArea.render(room);
			});
			peopleArea.setRoom(state.room);
			threadArea.setRoom(state.room);
			textArea.setRoom(state.room);
		}

		current = state;
	};
}());

