/* eslint-env es6 */

"use strict";

const TempMap = require("../lib/temp-map.js"),
	  objUtils = require("../lib/obj-utils.js"),
	  permissionWeights = require("../authorizer/permissionWeights.js");

let actions = [ "text", "join" ];

module.exports = (core, config, store) => {
	const userInfo = require("../lib/user.js")(core, config, store);

	let sent = new TempMap(300000); // Expire sent actions after 5 minutes

	// Listen to actions
	actions.forEach(action => {
		core.on(action + "-up", o => sent.set(action + ":" + o.id, o), 100);

		// Action completed successfully
		core.on(action + "-dn", o => sent.delete(action + ":" + o.id), 100);
	});

	// Check if any error-dn happens for the actions
	core.on("error-dn", e => {
		let key = e.action + ":" + e.id;

		if (e.message === "ERR_NOT_ALLOWED" && actions.indexOf(e.action) > -1 && sent.has(key)) {
			// Action failed because user was not signed in
			if (e.requiredRole === "registered" && (e.currentRole === "guest" || e.currentRole === "none")) {
				core.emit("setstate", {
					nav: { dialog: "signup" },
					app: {
						queuedActions: {
							signup: { [e.action]: sent.get(key) }
						}
					}
				});
			}
		}

		sent.delete(key);
	}, 100);

	// Handle queuedActions
	core.on("init-dn", action => {
		// User signed in or signed up
		if (!userInfo.isGuest(action.user.id)) {
			let queuedActions = store.get("app", "queuedActions");

			if (queuedActions && queuedActions.signup) {
				for (let a in queuedActions.signup) {
					if (a === "join" && permissionWeights[userInfo.getRole()] >= permissionWeights.follower) {
						// Avoid downgrading user role
						continue;
					}

					let action = objUtils.clone(queuedActions.signup[a]);

					if (action.from) {
						action.from = store.get("user");
					}

					core.emit(a + "-up", action);
				}

				core.emit("setstate", {
					app: {
						queuedActions: { signup: null }
					}
				});
			}
		}
	});
};
