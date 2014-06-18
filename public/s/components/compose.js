/* jshint browser: true */
/* global $, chatArea, libsb */

$(function() {
	var $entry = $(".chat-entry"),
		$input = $(".chat-input");
    var roomName = "", thread = "";
	// Focus chat entry on pageload
	$entry.focus();


	function sendMsg(){
		var text = $entry.text();
		text = text.trim();
		$entry.text("");
		if(!text) return;
		if (roomName) {
			libsb.say(roomName, text, thread);
		}else {
			// show the error that not part of any room yet.
		}

		setTimeout(function() {
			chatArea.setBottom($input.outerHeight());
		}, 0);
	}

	$entry.keypress(function(e) {
		if(e.which == 13 && !e.shiftKey) {
			e.preventDefault();
			sendMsg();
		}
	});

	$(".chat-send").on("click", sendMsg);

	libsb.on("init-dn", function(action, next) {
		$entry.attr("data-placeholder", libsb.user.id );
		next();
	}, 10);
    
    libsb.on("navigate", function(state, next) {
        if(state.roomName === "pending" && state.room !== null) return next();
        if(state.roomName) roomName = state.roomName;
        if(state.thread) thread = state.thread;
        next();
    });
});