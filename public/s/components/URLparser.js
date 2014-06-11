/* jshint browser: true */
/* global $, libsb */

module.exports = function() {
	$(function(){
		var path  = window.location.pathname.substr(1),
			search = window.location.search.substr(1),
			state = {};

		path = path.split("/");
		state.source = "init";

		search.split("&").map(function(i) {
			var q;
			if (!i) return;
			q = i.split("=");
			if (q[0]=="q") {
				state.query = q[1];
			} else {
				state[q[0]] = q[1];
			}
		});

		if (state.query) {
			state.mode = "search";
		}

		if (state.time) {
			state.time = new Date(state.time).getTime();
		}

		if (path[0] == "me") {
			if (path[1] == "edit") {
				state.mode = "pref";
			} else {
				state.mode = "home";
			}
		} else {
			state.room = path[0].toLowerCase();

			if (path[1] == "edit") {
				state.mode = "conf";
			} else {
				state.mode = "normal";

				if (path[1]) {
					state.thread = path[1] || "";
				}
			}
		}

		if (state.minimize === "true") {
			state.minimize = true;
		} else {
			state.minimize = false;
		}

		if (!state.mode) state.mode = "normal";
		if (!state.tab) state.tab = "people";
		if (!state.theme) state.theme = "light";

		libsb.emit("navigate", state);
	});
};
