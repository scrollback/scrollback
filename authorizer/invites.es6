/* eslint-env browser */

"use strict";

module.exports = (core, config, store) => {
	const getRoomPics = require("../ui/utils/room-pics.js")(core, config, store);

	let actionIds = {};

	core.on("pref-show", tabs => {
		let container = document.createElement("div"),
			rooms;

		rooms = store.getRelatedRooms().filter(user => user.transitionType === "invite");

		function onJoinDn(action) {
			if (Object.keys(actionIds).length) {
				let fn = actionIds[action.id];

				if (typeof fn === "function") {
					fn(action);
				}

				delete actionIds[action.id];
			} else {
				core.off("join-dn", onJoinDn);
			}
		}

		if (rooms.length) {
			container.classList.add("invite-item");

			rooms.forEach(room => {
				let messagediv = document.createElement("div");

				messagediv.classList.add("invite-item-message");

				let avatar = document.createElement("img");

				avatar.src = getRoomPics(room).picture;

				let message = document.createTextNode(room.officer + " invited you to be a " + room.transitionRole + " of " + room.id);

				messagediv.appendChild(avatar);
				messagediv.appendChild(message);

				let accept = document.createElement("a");

				accept.textContent = "Accept";
				accept.classList.add("button");
				accept.classList.add("accept");

				let reject = document.createElement("a");

				reject.textContent = "Reject";
				reject.classList.add("button");
				reject.classList.add("reject");

				let actionsdiv = document.createElement("div");

				actionsdiv.classList.add("invite-item-actions");
				actionsdiv.appendChild(accept);
				actionsdiv.appendChild(reject);

				let requestdiv = document.createElement("div");

				requestdiv.classList.add("invite-item");
				requestdiv.appendChild(messagediv);
				requestdiv.appendChild(actionsdiv);

				container.appendChild(requestdiv);

				function onDone(text) {
					accept.classList.add("disabled");
					accept.classList.remove("working");

					reject.classList.add("disabled");
					reject.classList.remove("working");

					message.textContent = text === false ? "An error occured!" : text;
				}

				function onApprove() {
					reject.classList.add("disabled");
					accept.classList.add("working");

					core.emit("join-up", {
						to: room.id,
						role: room.transitionRole
					}, (err, action) => {
						if (err) {
							onDone(false);

							return;
						}

						actionIds[action.id] = res => onDone(res.role !== room.role ? ("You are now a " + res.role + " of " + room.id) : false);
					});
				}

				function onDecline() {
					accept.classList.add("disabled");
					reject.classList.add("working");

					core.emit("join-up", {
						to: room.id,
						role: room.role
					}, (err, action) => {
						if (err) {
							onDone(false);

							return;
						}

						actionIds[action.id] = res => onDone(res.role === room.role ? ("You rejected to be a " + room.transitionRole + " of " + room.id) : false);
					});
				}

				accept.addEventListener("click", onApprove, false);
				reject.addEventListener("click", onDecline, false);
			});

			core.on("join-dn", onJoinDn, 100);
		} else {
			container.classList.add("invite-item-empty");

			container.textContent = "There are no invites right now.";
		}

		tabs.invites = {
			html: container,
			text: "Invites",
			badge: rooms.length
		};
	}, 700);
};
