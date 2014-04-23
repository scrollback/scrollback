/* jshint browser: true */
/* jshint jquery: true */
/* global libsb, format */

/*
	Properties of the navigation state object:

	room: 'roomid',
	view: (normal|rooms|meta)
	mode: (normal|search|conf|prefs|home),
	tab: (info|people|threads|local|global|<conf/pref tabs>),
	thread: 'selected_thread',
	query; 'search_query',
	text: 'selected text id',
	time: 'current scroll time'

	old: {old state object},
	changes: {new values of changed properties only}

*/

(function() {
	var current = {};

	libsb.on('navigate', function(state, next) {
		state.old = current;
		current = {};

		['room', 'view', 'mode', 'tab', 'thread', 'query', 'text', 'time'].forEach(function(prop) {
			if(typeof state[prop] === 'undefined') {
				if(typeof state.old[prop] !== 'undefined')
					current[prop] = state[prop] = state.old[prop];
				return;
			}

			if(state[prop] != state.old[prop]) {
				if(state[prop] === null) delete state[prop];
				current[prop] = state[prop];
			}
		});
		next();
	}, 10);
}());


libsb.on('navigate', function(state, next) {
	if(state.mode != state.old.mode) {
		$(document.body).removeClass(state.old.mode + '-mode');
		$(document.body).addClass(state.mode + '-mode');
	}

	if(state.view != state.old.view) {
		$(document.body).removeClass(state.old.view + '-view');
		$(document.body).addClass(state.view + '-view');
	}

	next();
});

libsb.on('navigate', function(state, next) {

	function url() {
		return ;
	}

	/*
		URL format:

		room is blank: scrollback.io/me
		room is there, thread is blank: scrollback.io/roomname
		room, thread are both present: scrollback.io/roomname/threadid/format.sanitize(thread-title)
		if scrolled to a particular time (not null): ...?time=<timestamp> new Date(state.time).getISOString() ISO 8601 YYYY-MM-DDTHH:mm:ssZ

		mode is conf: scrollback.io/roomname/edit
		mode is search: scrollback.io/roomname/search?q=encodeURIComponent(state.query)
	*/

	/*
		if room, thread, mode has changed, then do pushstate with new url
		if time has changed, then do replacestate with new url
		if tab, view has changed, do pushstate without change in url.
	*/

	next();
});


