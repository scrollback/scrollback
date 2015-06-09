/* eslint-env browser */

"use strict";

const getAvatar = require("../lib/get-avatar.js");

module.exports = (core, config, store) => {
	const promisedAction = require("../lib/promised-action.es6")(core, config, store);

	core.on("conf-show", tabs => {
		let container = document.createElement("div"),
			users;

		users = store.getRelatedUsers(tabs.room.id).filter(user => user.transitionType === "request");

		if (users.length) {
			container.classList.add("request-item");

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

					promisedAction("admit-up", {
						to: tabs.room.id,
						ref: user.id,
						role: user.transitionRole
					})
					.catch(() => onDone(false))
					.then(res => onDone(res.role !== user.role ? (user.id + " is now a " + res.role) : false));
				}

				function onDecline() {
					approve.classList.add("disabled");
					decline.classList.add("working");

					promisedAction("admit-up", {
						to: tabs.room.id,
						ref: user.id,
						role: user.role
					})
					.catch(() => onDone(false))
					.then(res => onDone(res.role === user.role ? (user.id + "'s request was declined.") : false));
				}

				approve.addEventListener("click", onApprove, false);
				decline.addEventListener("click", onDecline, false);
			});
		} else {
			container.classList.add("request-item-empty");

			container.textContent = "There are no requetsts right now.";
		}

		tabs.requests = {
			html: container,
			text: "Requests",
			badge: users.length
		};
	}, 700);
};
