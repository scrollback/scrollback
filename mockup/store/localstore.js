/* jshint browser: true */
/* global localStorage */

"use strict";

var localstore = {
	get: function(key, callback) {
		var value;

		if (typeof key !== "string") {
			throw new Error("Invalid key specified");
		}

		callback = (typeof callback !== "function") ? function() {} : callback;

		try {
			value = JSON.parse(localStorage.getItem(key));

			return callback(value);
		} catch(err) {
			return callback(err);
		}
	},

	set: function(key, value, callback) {
		if (typeof key !== "string") {
			throw new Error("Invalid key specified");
		}

		callback = (typeof callback !== "function") ? function() {} : callback;

		if (typeof value === "undefined") {
			localStorage.deleteItem(key);
		} else {
			try {
				localStorage.setItem(key, JSON.stringify(value));
			} catch(err) {
				return callback(err);
			}
		}

		return callback();
	}
};

module.exports = localstore;
