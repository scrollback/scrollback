"use strict";

var stringUtils = require("../../lib/string-utils.js");

module.exports = function(roomObj) {
	var roomId = roomObj.id,
		hash, picture, cover, banner;

	if (rooObj) {
		picture = rooObj.picture;

		if (rooObj.guides && rooObj.guides.customization && rooObj.guides.customization.cover) {
			cover = rooObj.guides.customization.cover;
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

		picture = "/s/assets/pictures/avatar/" + picture + ".jpg";
	}

	if (!cover) {
		cover = parseInt((hash + "").slice(-2));

		if (cover > 50) {
			cover = Math.round(cover / 2) + "";
		} else if (cover < 10) {
			cover = "0" + cover;
		}

		banner = "/s/assets/pictures/banner/" + cover + ".jpg";
		cover = "/s/assets/pictures/cover/" + cover + ".jpg";
	}

	roomPics[roomId] = {
		picture: picture,
		cover: cover,
		banner: banner
	};

	return roomPics[roomId];
};
