/* jshint browser: true */
/* jshint jquery: true */
/* global libsb */

/*
	Properties of the navigation state object:
	
	room: 'roomid',
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
		
		['room', 'mode', 'tab', 'thread', 'query', 'text', 'time'].forEach(function(prop) {
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
	
	next();
});

