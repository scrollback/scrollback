"use strict";

var stringUtils = require("../../lib/string-utils.js");

module.exports = function(core, config, store) {
	var roomPics = {};

	return function(roomId) {
		var room = store.getRoom(roomId),
			hash, picture, cover, banner;

		if (room) {
			picture = room.picture;

			if (room.guides && room.guides.customization && room.guides.customization.cover) {
				cover = room.guides.customization.cover;
				banner = cover;
			}
		}

		if (!(picture && cover)) {
			if (roomPics[roomId]) {
				return roomPics[roomId];
			}

			hash = stringUtils.hashCode(roomId);
		}

		if (!picture) {
			picture = parseInt((hash + "").slice(-4).slice(0, 2));

			if (picture > 50) {
				picture = Math.round(picture / 2) + "";
			} else if (picture < 10) {
				picture = "0" + picture;
			}

			picture = "/s/pictures/avatar/" + picture + ".jpg";
		}

		if (!cover) {
			cover = parseInt((hash + "").slice(-2));

			if (cover > 50) {
				cover = Math.round(cover / 2) + "";
			} else if (cover < 10) {
				cover = "0" + cover;
			}

			banner = "/s/pictures/banner/" + cover + ".jpg";
			cover = "/s/pictures/cover/" + cover + ".jpg";
		}

		roomPics[roomId] = {
			picture: picture,
			cover: cover,
			banner: banner
		};

		return roomPics[roomId];
	};
};
