"use strict";

var stringUtils = require("./string-utils.js");

module.exports = function(room, types) {
	var hash = stringUtils.hashCode(room),
		pics = {};

	types.forEach(function(type) {
		var num;

		if (type === "avatar") {
			num = parseInt((hash + "").slice(-4).slice(0, 2), 10);
		} else {
			num = parseInt((hash + "").slice(-2), 10);
		}

		if (num > 50) {
			num = Math.round(num / 2) + "";
		} else if (num < 10) {
			num = "0" + num;
		}

		pics[type] = "/s/assets/pictures/" + type + "/" + num + ".jpg";
	});

	return pics;
};
