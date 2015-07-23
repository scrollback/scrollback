"use strict";

var getRoomPics = require("../../lib/get-room-pics.js");

module.exports = function(core, config, store) {
	var roomPics = {};

	return function(roomId) {
		var room = store.getRoom(roomId),
			params = [],
			pics, picture, cover, banner;

		if (room) {
			picture = room.picture;

			if (room.guides && room.guides.customization && room.guides.customization.cover) {
				cover = room.guides.customization.cover;
				banner = cover;
			}
		}

		if (!picture && !cover && roomPics[roomId]) {
			return roomPics[roomId];
		}

		if (!picture) {
			params.push("avatar");
		}

		if (!cover) {
			params.push("cover");
			params.push("banner");
		}

		if (params.length) {
			pics = getRoomPics(roomId, params);
		}

		roomPics[roomId] = {
			picture: picture || pics.picture,
			cover: cover || pics.cover,
			banner: banner || pics.banner
		};

		return roomPics[roomId];
	};
};
