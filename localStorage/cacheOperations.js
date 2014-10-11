/* jshint browser: true */

/* global libsb */

/*
	Abstracts out the cache & standard operations on it.
*/

window.timeoutMapping = {};
window.backTimes = {};

var ArrayCache = require('./ArrayCache.js');
var config = require('../client-config.js');
var _this;




function applyUpdates(data, cacheName, endType) {
	// applies edits till no more messages are left.
	var pos;
	data.forEach(function (msg) {
		pos = _this.cache[cacheName].find(endType, msg.time);
		if (msg && _this.cache[cacheName].d[pos] && (msg.id === _this.cache[cacheName].d[pos].id)) {
			 _this.cache[cacheName].d[pos] = msg;
		}
	});
}

module.exports = {
	cache: {},
	LRU: {},
	rooms: {},
	deleteLRU: function deleteLRU() {
		// deletes the least recently used entry from LocalStorage
		var leastTime = Infinity,
			leastEntry;
		for (var i in this.LRU) {
			if (this.LRU[i] < leastTime) {
				leastTime = this.LRU[i];
				leastEntry = i;
			}
		}
		if (leastTime != Infinity) {
			delete this.LRU[leastEntry];
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
		this.LRU[key] = new Date().getTime();
		this.save();
	},
	loadArrayCache: function (key) {
		// loads an ArrayCache from LocalStorage.
		if (this.cache.hasOwnProperty(key)) return;

		var texts;
		if (localStorage.hasOwnProperty(key)) {
			try {
				texts = JSON.parse(localStorage[key]);
			} catch (e) {
				texts = [];
			}
			this.cache[key] = new ArrayCache(texts);
		} else {
			this.cache[key] = new ArrayCache([]);
		}
	},
	updateArrayCache: function (key, roomName, endType) {
		var msgs = this.cache[key].d;
		//var msgs = JSON.parse(localStorage[key]);
		var lastTime = this.findLastTime(msgs);
		_this = this;
		
		if (typeof lastTime === "undefined") return;
		libsb.emit("getTexts", { // remove this.
			to: roomName,
			updateTime: lastTime,
			after: 256
		}, function (err, data) {
			applyUpdates(data.results, key, endType);
		});
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
		if (typeof this.cache.session !== "undefined") {
			if (localStorage.hasOwnProperty("session")) {
				this.cache.session = localStorage.session;
			} else {
				localStorage.session = this.cache.session;
			}
		}
		localStorage.LRU = JSON.stringify(this.LRU);
		localStorage.occupantOf = JSON.stringify(this.cache.occupantOf);
		localStorage.memberOf = JSON.stringify(this.cache.memberOf);
		localStorage.rooms = JSON.stringify(this.rooms);
		this.load();
	},
	load: function () {
		try {
			this.cache.user = JSON.parse(localStorage.user);
			this.cache.session = localStorage.session;
			this.LRU = JSON.parse(localStorage.LRU);
			this.cache.occupantOf = JSON.parse(localStorage.occupantOf);
			this.cache.memberOf = JSON.parse(localStorage.memberOf);
			this.rooms = JSON.parse(localStorage.rooms);
		} catch (e) {
			// do nothing, e is thrown when values do not exist in localStorage,
			// which is a valid scenario, execution must continue.
		}
	},
	update: function () {
		var version = 'version' + config.localStorage.version;
		if (!localStorage.hasOwnProperty(version)) {
			console.log("Old version of LocalStorage present, clearing ...");
			for (var k in localStorage) {
				if (k !== "session") { // session should not be cleared on LS update
					delete localStorage[k];
				}
			}
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
				this.save();
			}
		}, minutes * 60 * 1000);
	},
	start: function (endType, key, time, pos) {
		var rs = {
			type: 'result-start',
			time: time,
			endType: endType
		};
		this.loadArrayCache(key);
		if (pos === 'begin') {
			try {
				if (this.cache[key][0].type !== 'result-start') {
					this.cache.d.unshift(rs);
				}
			} catch (e) {
				this.cache[key].d.unshift(rs);
			}
		} else {
			try {
				if (this.cache[key].d[this.cache[key].d.length - 1].type !== 'result-start') {
					this.cache[key].d.push(rs);
				}
			} catch (e) {
				// in case of empty ArrayCache.
				this.cache[key].d.push(rs);
			}
		}
		this.saveCache(key);
	},
	end: function (endType, key, time, pos) {
		var re = {
			type: 'result-end',
			time: time,
			endType: endType
		};
		var rs = {
			type: 'result-start',
			time: time,
			endType: endType
		};
		this.loadArrayCache(key);
		if (pos === 'begin') {
			try {
				if (this.cache[key][0].type !== 'result-end') {
					this.cache[key].d.unshift(re);
				}
			} catch (e) {
				this.cache[key].d.unshift(re);
			}
		} else {
			try {
				var lastItem = this.cache[key].d[this.cache[key].d.length - 1];

				if (lastItem.type === 'result-start') {
					this.cache[key].d.pop();
					this.cache[key].push(rs); // push a new result start, replacing older one
				} else if (lastItem.type !== 'result-end') {
					this.cache[key].d.push(re);
				}

			} catch (e) {
				// if the cache is empty, there is no need to push result end 
			}
		}
		this.saveCache(key);
	},
	findLastTime : function (key) {
		// finds the last message time in the array of messages.
		var messages = this.cache[key].d;
		var len = messages.length;
		var lastMsgTime = messages[len - 1].time;
		for (var i=len-1; i > 0; i--) {
			if (messages[i].type === "text") {
				lastMsgTime = messages[i].time;
				break;
			}
		}
		
		return lastMsgTime;
	}
};
