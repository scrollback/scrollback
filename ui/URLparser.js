/* jshint browser: true */
/* global $, libsb */
var validate = require("../lib/validate.js");
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
			state.roomName =  validate(path[0], true);

			if (path[1] == "edit") {
				state.mode = "conf";
			} else {
				state.mode = "normal";

				if (path[1]) {
					state.thread = path[1] || "";
				}
			}
		}
        
        if (state.query) {
			state.mode = "search";
		}

		if (state.embed) {
			state.embed = JSON.parse(decodeURIComponent(state.embed));

			state.minimize = state.embed.minimize || false;
			state.theme = state.embed.theme || "light";
		}

		if (!state.mode) state.mode = "normal";
		if (!state.tab) state.tab = "people";

		libsb.emit("navigate", state);
	});
};
