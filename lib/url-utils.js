/* jshint browser: true */
var JSON_props = ["webview", "embed"],
	allowedParams = ["tab", "dialog", "platform", "webview", "embed"];

module.exports = {
	build: build,
	parse: parse,
	generateState: generateState
};


function generateState(path, search) {
	var state = {}, embed, obj = {};
	state.nav = {};
	state.nav.mode = "chat";
	
	if (/^\//.test(path)) path = path.substr(1, path.length);
	path = path.split("/");

	if (path[0] == "me") {
		if (path[1] == "edit") {
			state.nav.mode = "pref";
			if (!state.nav.tab) {
				state.nav.tab = "profile";
			}
		} else {
			state.nav.mode = "home";
		}
	} else {
		state.nav.room = path[0];
	}

	if (/^\?/.test(search)) {
		search = search.substr(1, search.length);
	}

	search.split("&").map(function(i) {
		var q;

		if (!i) {
			return;
		}

		q = i.split("=");
		obj[q[0]] = q[1];
	});
	
	if (obj.embed) {
		try {
			embed = decodeURIComponent(obj.embed);
			embed = JSON.parse(embed);
		} catch (e) {
			embed = null;
		}
		state.context = {
			env: "embed",
			embed: embed
		};
	}
	console.log("bootstate: ", state);
	return state;
}

function parse(path, search) {
	var state = {};
	if (/^\//.test(path)) {
		path = path.substr(1, path.length);
	}

	if (/^\?/.test(search)) {
		search = search.substr(1, search.length);
	}

	search.split("&").map(function(i) {
		var q;

		if (!i) {
			return;
		}

		q = i.split("=");

		if (q[0] === "q") {
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
			if (!state.tab) {
				state.tab = "profile";
			}
		} else {
			state.mode = "home";
		}
	} else {
		state.roomName = path[0];

		if (path[1] == "edit") {
			state.mode = "conf";
			if (!state.tab) {
				state.tab = "general";
			}
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
	if (!state.view) state.view = "normal";

	allowedParams.forEach(function(e) {
		if (!state[e]) return;
		state[e] = decodeURIComponent(state[e]);
		if (JSON_props.indexOf(e) >= 0) {
			try {
				state[e] = JSON.parse(state[e]);
			} catch (e) {
				state[e] = null;
			}
		}
	});

	return state;
}

function build(state) {
	var path, params = [];
	switch (state.mode) {
		case 'conf':
			path = '/' + (state.roomName ? state.roomName + '/edit' : 'me');
			break;
		case 'pref':
			path = '/me/edit';
			break;
		case 'search':
			path = state.roomName ? '/' + state.roomName : '';
			params.push('q=' + encodeURIComponent(state.query));
			break;
		case "home":
			path = "/me";
			break;
		default:
			path = (state.roomName ? '/' + state.roomName + (
				state.thread ? '/' + state.thread : "" /*+ '/' + format.sanitize(state.thread): ''*/ ) : '');
	}

	if (state.time) {
		params.push("time=" + new Date(state.time).toISOString());
	}


	allowedParams.forEach(function(component) {
		var value = state[component];
		if (JSON_props.indexOf(component) >= 0) value = JSON.stringify(state[component]);
		if (component in state && value !== null && typeof value !== "undefined") {
			params.push(component + "=" + encodeURIComponent(value));
		}
	});

	return path + (params.length ? "?" + params.join("&") : "");
}