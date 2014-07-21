/* jshint browser: true */
/* global $, libsb */
var validate = require("../lib/validate.js");

function parseURL(path, search) {
	var	state = {};
    if(/^\//.test(path)) path = path.substr(1, path.length);
    if(/^\?/.test(search)) search = search.substr(1, search.length);
    
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
    
    
    state.mode = "normal";
    
    path = path.split("/");
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

	if (state.time) {
		state.time = new Date(state.time).getTime();
	}

	if (state.query) {
		state.mode = "search";
		state.time = null;
	}
	
	if (!state.mode) state.mode = "normal";
	if (!state.tab) state.tab = "people";
	return state;
}

module.exports = parseURL;