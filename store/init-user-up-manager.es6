"use strict";
var objUtils = require("../lib/obj-utils.js");

module.exports = function(core) {
	core.on("init-dn", function (init) {
		core.emit("init-user-up", {}, function (err, payload) {
			if (Object.keys(payload).length === 0) return;
			var userObj = objUtils.merge(init.user, payload);
			core.emit("user-up", {
				user: userObj,
				to: "me"
			});
		});
	}, 1);
};
