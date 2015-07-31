"use strict";

module.exports = {
	getName: function(roomId) {
		return roomId.replace(/-/g, " ").replace(/\s+/, " ");
	}
};
