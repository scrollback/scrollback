"use strict";

module.exports = {
	hashCode: function(s) {
		var hash = 0,
			c;

		if (!s || s.length === 0) {
			return hash;
		}

		for (var i = 0; i < s.length; i++) {
			c = s.charCodeAt(i);
			hash = ((hash << 5) - hash) + c;
			hash = hash & hash; // Convert to 32bit integer
		}

		return hash;
	},

	format: function(str) {
		var args = Array.prototype.slice.call(arguments, 1),
			i = 0;

		return str.replace(/%s/g, function() {
			return args[i++];
		});
	}
};
