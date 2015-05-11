/* eslint-env: es6 */

"use strict";

module.exports = core => {
	core.on("notification-dn", action => {
		core.emit("setstate", {
			notifications: [ action.notification ]
		})
	}, 100);

	core.on("notification-up", action => {
		core.emit("setstate", {
			notifications: [ action.notification ]
		})
	}, 100);
}
