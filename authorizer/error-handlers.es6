/* eslint-env es6 */

"use strict";

const objUtils = require("../lib/obj-utils.js"),
	  userUtils = require("../lib/user-utils.js"),
	  permissionWeights = require("../authorizer/permissionWeights.js");

let actions = [ "text", "join" ];

module.exports = (core, config, store) => {
	let sent = {};

	// Listen to actions
	actions.forEach(action => {
		core.on(action + "-up", o => sent[action + ":" + o.id] = o, 100);

		// Action completed successfully
		core.on(action + "-dn", o => delete sent[action + ":" + o.id], 100);
	});

	// Check if any error-dn happens for the actions
	core.on("error-dn", e => {
		let key = e.action + ":" + e.id;
		e.handled = true;
		if (e.message === "ERR_NOT_ALLOWED" && actions.indexOf(e.action) > -1 && sent[key]) {
			// Action failed because user was not signed in
			if (e.requiredRole === "registered" && (e.currentRole === "guest")) {
				// Get previous pending actions
				let pending = store.get("app", "queuedActions", "signup", e.action);

				if (Array.isArray(pending)) {
					pending = pending.slice(0);

					pending.push(sent[key]);
				} else {
					pending = [ sent[key] ];
				}

				core.emit("setstate", {
					nav: { dialog: "signup" },
					app: {
						queuedActions: {
							signup: { [e.action]: pending }
						}
					}
				});
			}
		}

		delete sent[key];
	}, 100);

	// Handle queuedActions
	core.on("init-dn", init => {
		// User signed in or signed up
		if (init.user && !userUtils.isGuest(init.user.id)) {
			let queuedActions = store.get("app", "queuedActions");

			if (queuedActions && queuedActions.signup) {
				for (let a in queuedActions.signup) {
					if (!queuedActions.signup[a]) {
						continue;
					}

					if (a === "join" && permissionWeights[store.getUserRole()] >= permissionWeights.follower) {
						// Avoid downgrading user role
						continue;
					}

					for (let action of queuedActions.signup[a]) {
						action = objUtils.clone(action);

						if (action.from) {
							action.from = store.get("user");
						}

						core.emit(a + "-up", action);
					}
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
