"use strict";

module.exports = {
	getName: function(roomId) {
		return typeof roomId === "string" ? roomId.replace(/-/g, " ").replace(/\s+/, " ").trim() : "";
	}
};
