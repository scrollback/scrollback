/* Manages LocalStrorage data save taking into account space availablity */

/* jshint browser:true */

var LRU = {};

if (localStorage.hasOwnProperty('LRU')) {
	LRU = JSON.parse(localStorage.LRU);
}

module.exports = {
	set: function (key, value) {
		value = JSON.stringify(value);
		try {
			localStorage[key] = value;
		} catch (e) {
			// handle space exceeds error.
			this.clear();
			this.set(key, value);
		}
		this.touch(key);
	},
	get: function (key) {
		this.touch(key);
		if (localStorage.hasOwnProperty(key)) return JSON.parse(localStorage[key]);
		else return null;
	},
	touch: function (key) {
		LRU[key] = new Date().getTime();
		try {
			localStorage.LRU = JSON.stringify(LRU);
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
				delete localStorage[item];
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
			delete localStorage[leastEntry];
		}
	}
};