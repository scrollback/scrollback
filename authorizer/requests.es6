/* eslint-env browser */

"use strict";

const getAvatar = require("../lib/get-avatar.js");

module.exports = (core, config, store) => {
	let actionIds = {};

	core.on("conf-show", tabs => {
		let container = document.createElement("div"),
			users;

		container.classList.add("request-item");

		users = store.getRelatedUsers(tabs.room.id).filter(user => user.transitionType === "request");

		if (!users.length) {
			return;
		}

		users.forEach(user => {
			let messagediv = document.createElement("div");

			messagediv.classList.add("request-item-message");

			let avatar = document.createElement("img");

			avatar.src = getAvatar(user.picture, 64);

			let message = document.createTextNode(user.id + " wants to be a " + user.transitionRole);

			messagediv.appendChild(avatar);
			messagediv.appendChild(message);

			let approve = document.createElement("a");

			approve.textContent = "Approve";
			approve.classList.add("button");
			approve.classList.add("approve");

			let decline = document.createElement("a");

			decline.textContent = "Decline";
			decline.classList.add("button");
			decline.classList.add("decline");

			let actionsdiv = document.createElement("div");

			actionsdiv.classList.add("request-item-actions");
			actionsdiv.appendChild(approve);
			actionsdiv.appendChild(decline);

			let requestdiv = document.createElement("div");

			requestdiv.classList.add("request-item");
			requestdiv.appendChild(messagediv);
			requestdiv.appendChild(actionsdiv);

			container.appendChild(requestdiv);

			function onDone(text) {
				approve.classList.add("disabled");
				approve.classList.remove("working");

				decline.classList.add("disabled");
				decline.classList.remove("working");

				message.textContent = text === false ? "An error occured!" : text;
			}

			function onApprove() {
				decline.classList.add("disabled");
				approve.classList.add("working");

				core.emit("admit-up", {
					to: tabs.room.id,
					ref: user.id,
					role: user.transitionRole
				}, (err, action) => {
					actionIds[action.id] = res => onDone(res.role !== user.role ? (user.id + " is now a " + res.role) : false);
				});
			}

			function onDecline() {
				approve.classList.add("disabled");
				decline.classList.add("working");

				core.emit("admit-up", {
					to: tabs.room.id,
					ref: user.id,
					role: user.role
				}, (err, action) => {
					actionIds[action.id] = res => onDone(res.role === user.role ? (user.id + " was declined to be a " + user.transitionRole) : false);
				});
			}

			approve.addEventListener("click", onApprove, false);
			decline.addEventListener("click", onDecline, false);
		});

		function onAdmitDn(action) {
			if (Object.keys(actionIds).length) {
				let fn = actionIds[action.id];

				if (typeof fn === "function") {
					fn(action);
				}

				delete actionIds[action.id];
			} else {
				core.off("admit-dn", onAdmitDn);
			}
		}

		core.on("admit-dn", onAdmitDn, 100);

		tabs.requests = {
			html: container,
			text: "Requests"
		};
	}, 200);
};
