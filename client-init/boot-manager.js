/* jshint browser: true */
var actionQueue = require("./actionQueue.js")();
var continueBoot = null, bootState = null;
function init(libsb) {
	var isInited = false;
	var backQueue = [];

	libsb.on("init-dn", function(action, next) {
		isInited = true;
		backQueue.forEach(function(e) {
			e();
		});
		next();
	}, 1000);

/*	libsb.on("init-up", function(action, next) {
		if (libsb.hasBooted) return next();
		actionQueue.enQueue(next);
	}, 1000);*/
	libsb.on("back-up", function(action, next) {
		if (!isInited) {
			backQueue.push(next);
			return;
		}
		return next();
	}, 1000);

	libsb.on("navigate", function(state, next) {
		var i;
		if (state.source == "boot") return next();
		if (state.source == "socket" && continueBoot) {
			for(i in bootState) {
				if(bootState.hasOwnProperty(i) && i != "source" && i != "connectionStatus") {
					state[i] = bootState[i];
				}
			}
		} else if (!libsb.hasBooted) {
			// add more sources if the navigate has to be queued up.
			if (["socket"].indexOf(state.source) >= 0) return actionQueue.enQueue(next);
			return next(new Error("BOOT_NOT_COMPLETE"));
		}
		next();
	}, 1000);
	
	libsb.on('navigate', function (state, next) {
		if( state.source === 'boot' && !state.room ) {
			continueBoot = next;
			bootState = state;
		}else if(state.source === 'socket' && continueBoot) {
			bootState.room = state.room;
			bootState.roomName = state.roomName;
			bootState.mode = state.mode;
			continueBoot();
			continueBoot = bootState = null;
			next();
		}else{
			next();
		}
	}, 997);

	libsb.on("navigate", function(state, next) {
		if (state.connectionStatus != "online" && state.source !="boot") isInited = false;
		next();
	}, 500);
}

module.exports = function(l) {
	init(l);
};