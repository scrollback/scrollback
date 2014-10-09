/* jshint browser:true */

var spaceManager = require('./spaceManager.js');
var ArrayCache = require('./ArrayCache.js');

window.backTimes = {};

module.exports = {
	cache: {},
	saveArrayCache: function (key) {
		spaceManager.set(key, this.cache[key].d);
	},
	loadArrayCache: function (key) {
		var data = spaceManager.get(key);
		if (data !== null) this.cache[key] = new ArrayCache(data);
		else this.cache[key] = new ArrayCache([]);
	},
	start: function (endType, key, time, pos) {
		/* Adds a result-start to the cache evaluating various conditions */
		var rs = {
			type: 'result-start',
			time: time,
			endType: endType
		};
		this.loadArrayCache(key);
		if (pos === 'begin') {
			try {
				if (this.cache[key][0].type !== 'result-start') {
					this.cache[key].d.unshift(rs);
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
		this.saveArrayCache(key);
	},
	end: function (endType, key, time, pos) {
		/* Adds a result-end to the cache evaluating various conditions */
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
		this.saveArrayCache(key);
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
	}

};