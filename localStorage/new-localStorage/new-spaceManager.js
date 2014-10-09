/* jshint browser:true */

var LRU = {};

if(localStorage.hasOwnProperty('LRU')) {
	LRU = JSON.parse(localStorage.LRU);
}

module.exports = {
	set: function (key, value) {
		value = JSON.stringify(value);
		try {
			localStorage[key] = value;
		} catch (e) {
			// handle space exceeds error.
		}
		this.touch(key);
	},
	get: function (key) {
		this.touch(key);
		return JSON.parse(localStorage[key]);
	},
	touch: function (key) {
		LRU[key] = new Date().getTime();
		localStorage[LRU] = JSON.stringify(LRU);
	},
	clear: function () {
		// clears elements in LocalStorage based on Least Recently Used strategy.
	}
};