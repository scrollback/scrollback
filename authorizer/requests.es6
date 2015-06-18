/* eslint-env browser */

"use strict";

const React = require("react"),
	  getAvatar = require("../lib/get-avatar.js");

module.exports = (core, config, store) => {
	const RequestInviteItem = require("./request-invite-item.jsx")(core, config, store),
		  promisedAction = require("../lib/promised-action.es6")(core, config, store);

	core.on("conf-show", tabs => {
		let container = document.createElement("div"),
			users;

		users = store.getRelatedUsers(tabs.room.id).filter(user => user.transitionType === "request");

		class Requests extends React.Component {
			constructor(props) {
				super(props);
			}

			onAccept(user) {
				return promisedAction("admit", {
					to: tabs.room.id,
					ref: user.id,
					role: user.transitionRole
				}).then(res => {
					if (res.role !== user.role) {
						return Promise.resolve(user.id + " is now a " + res.role);
					} else {
						return Promise.reject();
					}
				});
			}

			onReject(user) {
				return promisedAction("admit", {
					to: tabs.room.id,
					ref: user.id,
					role: user.role
				}).then(res => {
					if (res.role === user.role) {
						return Promise.resolve(user.id + "'s request was declined.");
					} else {
						return Promise.reject();
					}
				});
			}

			render() {
				let items = users.map(user => {
						return (
							<RequestInviteItem
								avatar={getAvatar(user.picture, 64)}
								text={user.id + " wants to be a " + user.transitionRole}
								acceptLabel="approve"
								rejectLabel="decline"
								onAccept={() => this.onAccept(user)}
								onReject={() => this.onReject(user)}
							/>
							);
					});

				if (items.length) {
					return <div>{items}</div>;
				} else {
					return <div className="request-item-empty">"There are no requetsts right now."</div>;
				}
			}
		}

		React.render(<Requests />, container);

		tabs.requests = {
			html: container,
			text: "Requests",
			badge: users.length
		};
	}, 700);
};
