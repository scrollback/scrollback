/* global window, history, location */

module.exports = function (core, config, store) {
	core.on("boot", function(state, next) {
		var s = urlUtils.generateState(window.location.pathname, window.location.search);
		Object.keys(s).forEach(function(key) {
			state[key] = s[key];
		});
		if (!state.nav.mode) state.nav.mode = "chat";
		next();
	}, 900);
	
	core.on('statechange', function (changes) {
		var url, params = {}, nav = store.getNav();
		
		if(nav.mode == 'home') {
			url = '/me';
		} else if(nav.mode == 'room') {
			if(nav.room.indexOf(':')) return; // Not ready with the new room yet.
			url = '/' + nav.room;
		} else if(nav.mode == 'chat') {
			url += '/' + nav.room + '/' + (nav.thread? nav.thread: 'all');
		}
		
		if(nav.mode === 'room' && nav.threadRange.time) params.time = nav.threadRange.time;
		if(nav.mode === 'chat' && nav.textRange.time) params.time = nav.textRange.time;
		if(nav.dialog) params.dialog = nav.dialog;
		
		/* TODO: Add search, context */
		
		if(url == location.pathname + location.search + location.hash) return;
		
		
		if(changes.nav && (changes.nav.mode || changes.nav.dialog)) {
			history.pushState(nav, null, url);
		} else {
			history.replaceState(nav, null, url);
		}
	});
		
	window.addEventHandler('popstate', function (event) {
		core.emit('setstate', {nav: event.state});
	});
};