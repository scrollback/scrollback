/* global window, history, location */

var objUtils = require('../lib/obj-utils.js');

function getParams(string) {
	var params = {};
	string.split('&').forEach(function(kv) {
		kv = kv.split('=');

		if (kv[0]) {
			params[kv[0]] = kv.length > 1 ? decodeURIComponent(kv[1]) : true;
		}
	});

	return params;
}

var propMap = {
	nav: { dialog: 'd', dialogState: 'ds'},
};

module.exports = function(core, config, store) {
	core.on("boot", function(state, next) {
		var params = getParams(location.search.substr(1)),
			path = location.pathname.substr(1).split('/');

		state.nav = state.nav || {};
		state.context = state.context || {};

		if (path.length === 0 || path[0] === 'me') {
			state.nav.mode = 'home';
		} else if (path.length === 1) {
			state.nav.mode = 'room';
			state.nav.room = path[0];
			state.nav.threadRange = { time: parseFloat(params.t) || null, before: 20 };
		} else if(path.length === 2) {
			state.nav.mode = 'chat';
			state.nav.room = path[0];
			if(path[1] !== 'all') state.nav.thread = path[1];
			state.nav.textRange = { time: parseFloat(params.t) || null };
			state.nav.textRange[params.t? 'after': 'before'] = 30;
		} else {
			state.nav.mode = 'home';
		}
		
		if(params.embed) {
			state.context.env = "embed";
			try {
				state.context.embed = JSON.parse(params.embed);
			} catch(e) {
				console.error("JSON parse of embed param failed", e);
				state.context.embed = {};
			}
		}
		
		
		if(params.android) {
			state.context.env = "android";
		}

		for (var section in propMap) {
			for (var prop in propMap[section]) {
				if (params[propMap[section][prop]]) {
					state[section][prop] = params[propMap[section][prop]];
				}
			}
		}
		next();
	}, 900);

	core.on('statechange', function(changes, next) {
		var url, params = {}, paramstr = [],
			state = { nav: store.get("nav"), context: store.getContext() };

		if (state.nav.mode == 'home') {
			url = '/me';
		} else if (state.nav.mode == 'room') {
			if (state.nav.room.indexOf(':') !== -1) {
				return; // Not ready with the new room yet.
			}

			url = '/' + state.nav.room;
		} else if (state.nav.mode == 'chat') {
			if (state.nav.room.indexOf(':') !== -1) {
				return; // Not ready with the new room yet.
			}

			url = '/' + state.nav.room + '/' + (state.nav.thread ? state.nav.thread : 'all');
		}

		if (state.nav.mode === 'room' && state.nav.threadRange.time) {
			params.t = state.nav.threadRange.time;
		}

		if (state.nav.mode === 'chat' && state.nav.textRange.time) {
			params.t = state.nav.textRange.time;
		}
		
		if(state.context.embed) {
			params.embed = JSON.stringify(state.context.embed);
		}

		for (var section in propMap) {
			for (var prop in propMap[section]) {
				if (state[section][prop]) {
					params[propMap[section][prop]] = state[section][prop];
				}
			}
		}

		if (url == location.pathname && objUtils.equal(params, getParams(location.search.substr(1)))) {
			return;
		}
		
		for(var key in params) paramstr.push(
			encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
		);
		if(paramstr.length) url = url + '?' + paramstr.join('&');
		
		if(changes.nav && (changes.nav.mode || changes.nav.dialog)) {
			history.pushState(state.nav, null, url);
		} else {
//			console.log('replacestate', state.nav);
			history.replaceState(state.nav, null, url);
		}
		next();

	}, 100);

	window.addEventListener('popstate', function(event) {
		console.log('popstate', event.state);
		core.emit('setstate', {nav: event.state});
	});
};
