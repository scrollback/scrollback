/* Manages LocalStrorage data save taking into account space availablity */

/* jshint browser:true */

var LS;

if (typeof window === "undefined") {
	// This block is a polyfill for Unit Tests.

	/* jshint ignore:start */

	LS = {};
	membersPopulated = true;
	occupantsPopulated = true;

	/* jshint ignore:end */
} else {
	LS = window.localStorage;
}

var LRU = {};

if (LS.hasOwnProperty('LRU')) { // hasOwnProperty does not exist for the polyfill
	LRU = JSON.parse(LS.LRU);
}

module.exports = {
	set: function (key, value) {
		value = JSON.stringify(value);
		try {
			LS[key] = value;
		} catch (e) {
			// handle space exceeds error.
			this.clear();
			this.set(key, value);
		}
		this.touch(key);
	},
	get: function (key) {
		this.touch(key);
		if (LS.hasOwnProperty(key)) {
			return JSON.parse(LS[key]);
		} else {
			return null;
		}
	},
	touch: function (key) {
		LRU[key] = new Date().getTime();
		try {
			LS.LRU = JSON.stringify(LRU);
		} catch (e) {
			this.clear();
			this.touch(key);
		}
	},
	clear: function () {
		// if arguments are passed, each passed entity is deleted from localStorage.
		if (arguments.length > 0) {
			var args = Array.prototype.slice.call(arguments, 0);
			args.forEach(function (item) {
				delete LS[item];
			});
			return;
		}

		// clears elements in LocalStorage based on Least Recently Used strategy, if no arguments are passed.
		var leastTime = Infinity,
			leastEntry;
		for (var i in LRU) {
			if (LRU[i] < leastTime) {
				leastTime = LRU[i];
				leastEntry = i;
			}
		}
		if (leastTime != Infinity) {
			delete LRU[leastEntry];
			delete LS[leastEntry];
		}
	}
};