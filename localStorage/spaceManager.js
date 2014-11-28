/* Manages LocalStrorage data save taking into account space availablity */

/* jshint browser:true */

var _ = require('underscore');

var LS;

if (typeof window === "undefined") {
	// This block is a polyfill for Unit Tests.
	LS = {};
} else {
	LS = window.localStorage;
}

var LRU = {};

if (LS.hasOwnProperty('LRU')) { // hasOwnProperty does not exist for the polyfill
	LRU = JSON.parse(LS.LRU);
}

module.exports = {
	backOffVal: 1, // exponential back-off value.
	set: function(key, value, touch) {
		value = (typeof value !== "string") ? JSON.stringify(value) : value;
		try {
			LS[key] = value;
		} catch (e) {
			// handle space exceeds error.
			this.clear();
			this.set(key, value);
		}
		if (touch !== false) this.touch(key);
	},
	get: function(key, touch) {
		if (touch !== false) this.touch(key);
		if (LS.hasOwnProperty(key)) {
			try {
				return JSON.parse(LS[key]);
			} catch (e) {
				return LS[key];
			}

		} else {
			return null;
		}
	},
	touch: function(key) {
		LRU[key] = new Date().getTime();
		try {
			LS.LRU = JSON.stringify(LRU);
		} catch (e) {
			this.clear();
			this.touch(key);
		}
	},
	clear: function() {
		// if arguments are passed, each passed entity is deleted from localStorage.
		if (arguments.length > 0) {
			var args = Array.prototype.slice.call(arguments, 0);
			args.forEach(function(item) {
				delete LS[item];
			});
			return;
		}
        
        var that = this;

		// clears elements in LocalStorage based on Least Recently Used strategy, if no arguments are passed.
		if (that.backOffVal === Infinity) that.backOffVal = 1;
        _.times(that.backOffVal, function() {
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
            
            that.backOffVal = that.backOffVal * 2;
		});
	}
};