/* eslint-env browser */

"use strict";

const React = require("react");

module.exports = (core, config, store) => {
	const promisedAction = require("../lib/promised-action.es6")(core, config, store),
		  getRoomPics = require("../ui/utils/room-pics.js")(core, config, store);

	core.on("pref-show", tabs => {
		let container = document.createElement("div"),
			rooms;

		rooms = store.getRelatedRooms().filter(user => user.transitionType === "invite");

		class Invites extends React.Component {
			constructor(props) {
				super(props);
			}

			onAccept(room) {
				return promisedAction("join", {
					to: room.id,
					role: room.transitionRole
				}).then(res => {
					if (res.role !== room.role) {
						return Promise.resolve("You are now a " + res.role + " of " + room.id);
					} else {
						return Promise.reject();
					}
				});
			}

			onReject(room) {
				return promisedAction("join", {
					to: room.id,
					role: room.role
				}).then(res => {
					if (res.role === room.role) {
						return Promise.resolve("You declined to be a " + room.transitionRole + " of " + room.id);
					} else {
						return Promise.reject();
					}
				});
			}

			render() {
				let items = rooms.map(room => {
						return (
							<RequestInviteItem
								avatar={getRoomPics(room).picture}
								text={room.officer + " invited you to be a " + room.transitionRole + " of " + room.id}
								acceptLabel="approve"
								rejectLabel="decline"
								onAccept={() => this.onAccept(room)}
								onReject={() => this.onReject(room)}
							/>
							);
					});

				if (items.length) {
					return <div>{items}</div>;
				} else {
					return <div className="invites-item-empty">"There are no invites right now."</div>;
				}
			}
		}

		React.render(<Invites />, container);

		tabs.invites = {
			html: container,
			text: "Invites",
			badge: rooms.length
		};
	}, 700);
};
