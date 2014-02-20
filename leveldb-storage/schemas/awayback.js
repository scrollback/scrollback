var log = require("../../lib/logger.js");

module.exports = function(types) {
	return {
		put : function(data, cb) {
			types.awayback.put({
				id: data.id,
				time: data.time,
				from: data.from,
				to: data.to,
				type: data.type,
				origin: data.origin,
				session: data.session || "",
				text: data.text || ""
			},cb);
		}
	}
};