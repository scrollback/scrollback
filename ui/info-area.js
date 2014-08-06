/* jshit browser: true */
/* global $, format, libsb, currentState */

var infoArea = {};

$(function() {
	var $template = $(".pane-info").eq(0);
	infoArea.render = function (room) {
		$template.find('.info-title').text(room.id);
		$template.find('.info-description').html(format.textToHtml(room.description || "This room has no description."));
	};
	libsb.on("init-dn", function(q, n) {
		if(currentState.embed && currentState.embed.form) {
			libsb.enter(window.location.pathname.split("/")[1]);
		}
		n();
	}, 600);
});

libsb.on('room-dn', function (action, next) {
    if (action.room.id === currentState.roomName) {
        infoArea.render(action.room);
    }
    next();
}, 600);

libsb.on('navigate', function(state, next) {
    if (!state.old || state.roomName != state.old.roomName) {
        
        if (state.room && typeof state.room !== "string") {
            infoArea.render(state.room);
        } else {
            infoArea.render({
                id: state.roomName,
                description: "Currently offline."
            });
        }
    }
    
    if (state.tab == "info") {
	    $(".pane-info").addClass("current");
	} else {
	    $(".pane-info").removeClass("current");
	}
    
    next();
}, 600);