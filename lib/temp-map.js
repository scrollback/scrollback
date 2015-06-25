"use strict";

function TempMap(expireTime) {
	// Handle situation where called without "new" keyword
	if (false === (this instanceof TempMap)) {
		throw new Error("Constructor TempMap requires 'new'");
	}

	// Throw error if not expireTime is not number
	if (typeof expireTime !== "number") {
		throw new TypeError("Invalid value used as expire time");
	}

	this._expireTime = expireTime;
	this._entries = [];
}

TempMap.prototype = Object.create(null);

TempMap.prototype.constructor = TempMap;

TempMap.prototype.get = function(key) {
	var item;

	for (var i = 0, l = this._entries.length; i < l; i++) {
		item = this._entries[i];

		if (item[0] === key) {
			return item[1];
		}
	}
};

TempMap.prototype.set = function(key, value) {
	var item, timeout;

	timeout = setTimeout(function() {
		this.delete(key);
	}.bind(this), this._expireTime);

	for (var i = 0, l = this._entries.length; i < l; i++) {
		item = this._entries[i];

		if (item[0] === key) {
			if (item[2]) {
				clearTimeout(item[2]);
			}

			item[1] = value;
			item[2] = timeout;

			return this;
		}
	}

	this._entries.push([ key, value, timeout ]);
};

TempMap.prototype.has = function(key) {
	var item;

	for (var i = 0, l = this._entries.length; i < l; i++) {
		item = this._entries[i];

		if (item[0] === key) {
			return true;
		}
	}

	return false;
};

TempMap.prototype.delete = function(key) {
	var item;

	for (var i = 0, l = this._entries.length; i < l; i++) {
		item = this._entries[i];

		if (item[0] === key) {
			this._entries.splice(i, 1);

			return true;
		}
	}

	return false;
};

module.exports = TempMap;
