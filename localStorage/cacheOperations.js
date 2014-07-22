/* jshint browser: true */

/*
	Abstracts out the standard operations on the cache.
*/

var LRU = {};

window.timeoutMapping = {};
window.backTimes = {};

var ArrayCache = require('./ArrayCache.js');
var config = require('../client-config.js');

module.exports = {
	cache: {},
	deleteLRU: function deleteLRU() {
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
	},
	saveCache: function (key) {
		// saves an ArrayCache to LocalStorage
		try {
			localStorage[key] = JSON.stringify(this.cache[key].d);
		} catch (e) {
			if (e.name == 'QuotaExceededError' || e.code == 22) { // localStorage is full!
				this.deleteLRU();
				this.saveCache(key);
			}
		}
		LRU[key] = new Date().getTime();
		this.save();
	},
	loadArrayCache: function (key) {
		// loads an ArrayCache from LocalStorage.
		var texts;
		if (localStorage.hasOwnProperty(key)) {
			try {
				texts = JSON.parse(localStorage[key]);
			} catch (e) {
				texts = [];
			}
			return (new ArrayCache(texts));
		} else {
			return (new ArrayCache([]));
		}
	},
	generateLSKey: function () {
		var args = Array.prototype.slice.call(arguments, 0);
		if (!args) {
			return;
		}
		var argumentsLC = args.map(function (val) {
			if (typeof val == "string") return val.toLowerCase();
		});
		return argumentsLC.join('_');
	},
	save: function () {
		//saves user, session, LRU, rooms, occupantOf, memberOf to LocalStorage
		localStorage.user = JSON.stringify(this.cache.user);
		localStorage.session = this.cache.session;
		localStorage.LRU = JSON.stringify(LRU);
		localStorage.occupantOf = JSON.stringify(this.cache.occupantOf);
		localStorage.memberOf = JSON.stringify(this.cache.memberOf);
		this.load();
	},
	load: function () {
		try {
			this.cache.user = JSON.parse(localStorage.user);
			this.cache.session = localStorage.session;
			LRU = JSON.parse(localStorage.LRU);
			this.cache.occupantOf = JSON.parse(localStorage.occupantOf);
			this.cache.memberOf = JSON.parse(localStorage.memberOf);
		} catch (e) {
			// do nothing, e is thrown when values do not exist in localStorage,
			// which is a valid scenario, execution must continue.
		}
	},
	updateLS: function () {
		var version = 'version' + config.localStorage.version;
		if (!localStorage.hasOwnProperty(version)) {
			console.log("Old version of LocalStorage present, clearing ...");
			localStorage.clear();
			localStorage[version] = true;
		} else {
			console.log("LocalStorage version is current ...");
		}
	},
	delRoomTimeOut: function (roomId) {
		/*
		this function deletes a saved room object from the cache every 'n' mintues
		*/
		var minutes = 10; // 10 minutes timeout

		clearTimeout(window.timeoutMapping[roomId]);

		window.timeoutMapping[roomId] = setTimeout(function () {
			if (this.cache && this.cache.rooms) {
				delete this.cache.rooms[roomId];
			}
		}, minutes * 60 * 1000);
	}
};