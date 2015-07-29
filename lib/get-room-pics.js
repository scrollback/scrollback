"use strict";

var stringUtils = require("./string-utils.js");

module.exports = function(room, types, size) {
	var hash = stringUtils.hashCode(room.id),
		pics = {};

	types.forEach(function(type) {
		var num;

		if (room) {
			if (type === "avatar") {
				if (room.picture) {
					pics[type] = room.picture;

					return;
				}
			} else {
				if (room.guides && room.guides.customization && room.guides.customization.cover) {
					pics[type] = room.guides.customization.cover;

					return;
				}
			}
		}

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

		if (type === "avatar" && size && size > 128) {
			num += "@2x";
		}

		pics[type] = "/s/assets/pictures/" + type + "/" + num + ".jpg";
	});

	return pics;
};
