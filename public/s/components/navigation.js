/* jshint browser: true */
/* jshint jquery: true */
/* global libsb, format */
/* exported currentState */

/*
	Properties of the navigation state object:

	room: "roomid",
	view: (normal|rooms|meta|signup)
	mode: (normal|search|conf|prefs|home),
	tab: (info|people|threads|local|global|<conf/pref tabs>),
	thread: "selected_thread",
	query; "search_query",
	text: "selected text id",
	time: "current scroll time"

	old: {old state object},
	changes: {new values of changed properties only}

*/

var currentState = window.currentState = {};


libsb.on("inited", function(){
	var path  = window.location.pathname.substr(1);
	var search = window.location.search.substr(1), properties={};
	var state = {};
	path = path.split("/");
	state.source = "init";
	if(path[0]){
		state.room = path[0]
	}

	if(path[1]){
		state.thread = path[1]
	}

	search.split("&").map(function(i) {
		var q;
		if(!i) return;
		q = i.split("=");
		state[q[0]] = q[1];
	});
	if(!state.mode) state.mode = "normal";
	if(state.time) {
		state.time = new Date(state.time).getTime();
	}
	if(!state.tab) state.tab = "people";
	libsb.emit("navigate", state);
});
libsb.on("navigate", function(state, next) {
	state.old = $.extend(true, {}, currentState); // copying object by value
	state.changes = {};

	["room", "view", "mode", "tab", "thread", "query", "text", "time"].forEach(function(prop) {
		if(typeof state[prop] === "undefined") {
			if(typeof state.old[prop] !== "undefined")
				currentState[prop] = state[prop] = state.old[prop];
			return;
		}

		if (state[prop] != state.old[prop]) {
			if(state[prop] === null) {
				delete state[prop];
				delete currentState[prop];
				state.changes[prop] = null;
			} else {
				currentState[prop] = state.changes[prop] = state[prop];
			}
		} else {
			currentState[prop] = state[prop];
		}
	});

	if(!state.time && !state.room && !state.thread) {
		if(!state.time && state.old.time) {
			state.time = state.old.time;
		}
	}
	next();
}, 1000);

// On navigation, set the body classes.
libsb.on("navigate", function(state, next) {
	if(state.old && state.mode !== state.old.mode) {
		$(document.body).removeClass(state.old.mode + "-mode");
		$(document.body).addClass(state.mode + "-mode");
	}else if(state.mode){
		$(document.body).addClass(state.mode + "-mode");
	}

	if(state.old && state.view !== state.old.view) {
		$(document.body).removeClass(state.old.view + "-view");
		$(document.body).addClass(state.view + "-view");
	}else if(state.view){
		$(document.body).addClass(state.view + "-view");
	}else {
		// $("body").remove();
	}

	if(state.tab) {	
		$(".tab").removeClass("current");
		$(".tab-" + state.tab).addClass("current");
	}

	next();
}, 999);

// On navigation, add history and change URLs
libsb.on("navigate", function(state, next) {
	var threadTitle, addHistory = false;
	if(state.source == "history"){
		return;
	}
	function buildurl() {
		var path, params = [];
		switch(state.mode) {
			case 'conf':
				path = '/' + (state.room ? state.room + '/edit': 'me');
				break;
			case 'pref':
				path = '/me/edit';
				break;
			case 'search':
				path = (state.room ? '/' + state.room: '') + '/search';
				params.push('q=' + encodeURIComponent(state.query));
				break;
			case 'home':
				path = '/me';
				break;
			case 'view':

				break;
			default:
				path = (state.room ? '/' + state.room + (
						state.thread ? '/' + state.thread:"" /*+ '/' + format.sanitize(state.thread): ''*/
					): '');
		}

		if(state.time) params.push('time=' + new Date(state.time).toISOString());
		if(state.mode) params.push('mode=' + state.mode);
		if(state.tab) params.push('tab=' + state.tab);

		return path + (params.length ? '?' + params.join('&'): '');
	}

	function pushState() {
		var url = buildurl();
		if(Object.keys(state.changes).length == "") state.view = "normal";
		if(state.source == "init" || state.source == "text-area") {
			history.replaceState(state, null, url);
			return;
		}

		if((state.changes.view == "rooms" || state.changes.view == "meta" || state.changes.view =="normal") && Object.keys(state.changes).length == 1) {
			history.pushState(state, null, url);
			return;
		}else if(Object.keys(state.changes).length == 0) {
			history.pushState(state, null, url);
			return;
		}
		if (url && history.pushState && url != location.pathname + location.search && state.source !== "history") {
			if(state.changes.time && Object.keys(state.changes).length == 1) {
				history.replaceState(state, null, url);
			} else {
				history.pushState(state, null, url);
			}
		}
	}

	if (state.thread) {
		// TODO
		// libsb.getThreads({ref: state.thread}, function(err, thread) {
		// threadTitle = thread.title;
		// });
	}

	pushState();

	next();
}, 200);

// On history change, load the appropriate state
$(window).on("popstate", function() {
	if (('state' in history && history.state !== null)) {
		var state = {}, prop;
		for (prop in history.state) {
			if (history.state.hasOwnProperty(prop)) {
				if(prop !== 'old' && prop !== 'changes') {
					state[prop] = history.state[prop];
				}
			}
		}

		state.source = "history";
		libsb.emit("navigate", state);
	}

});
