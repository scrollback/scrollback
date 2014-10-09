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
		return JSON.parse(localStorage[key]);
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
		// clears elements in LocalStorage based on Least Recently Used strategy.
		// deletes the least recently used entry from LocalStorage
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