/* jshint browser: true */
/* global $ */

module.exports = function(core, config, state) {
	var keys = [ "view", "mode", "color" ],
	    $title = $(".js-appbar-title"),
	    $thread = $(".js-thread-title");

	// Listen to navigate and add class names
	core.on("statechange", function(changes, next) {
	    var classList = $("body").attr("class") || "";

	    for (var i = 0, l = keys.length; i < l; i++) {
	        if ([keys[i]] in changes.nav) {
	            classList = classList.replace(new RegExp("\\b" + keys[i] + "-" + "\\S+", "g"), "");

	            classList += " " + keys[i] + "-" + (state.getNav()[keys[i]] || "");
	        }
	    }

	    classList = classList.replace(/\bcolor-\S+/g, "").replace(/^\s+|\s+$/g, "");

	    if ("nav" in changes && "mode" in changes.nav) {
	        switch (state.getNav().mode) {
	        case "room":
	            $title.text(state.getNav().room);
	            break;
	        case "chat":
	            classList += " color-" + state.getNav().color;
	            $title.text(state.getNav().room);
	            $thread.text(state.getNav().threadId);
	            break;
	        case "home":
	            $title.text("My feed");
	            break;
	        }
	    }

	    $("body").attr("class", classList);

	    next();
	}, 1000);
};
