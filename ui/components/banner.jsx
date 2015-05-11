"use strict";

var format = require("../../lib/format.js"),
	appUtils = require("../../lib/app-utils.js"),
	getAvatar = require("../../lib/get-avatar.js");

module.exports = function(core, config, store) {
	var React = require("react"),
		getRoomPics = require("../utils/room-pics.js")(core, config, store),
		Banner;

	Banner = React.createClass({
		showRoomSettings: function() {
			core.emit("setstate", {
				nav: { dialog: "conf" }
			});
		},

		showUserSettings: function() {
			core.emit("setstate", {
				nav: { dialog: "pref" }
			});
		},

		onSubmit: function(e) {
			var roomNameEntry = React.findDOMNode(this.refs.roomNameEntry),
				roomName;

			e.preventDefault();

			if (roomNameEntry) {
				roomName = roomNameEntry.value;
			} else {
				return;
			}

			if (roomName) {
				core.emit("setstate", {
					nav: {
						room: roomName,
						mode: "room",
						view: null,
						thread: null
					}
				});
			}

		},

		render: function() {
			var items = [];

			if (this.state.banner) {
				items.push(
						<div className="banner-cover" key="banner-cover">
							<div className="banner-cover-image" style={{ backgroundImage: "url(" + this.state.cover + ")" }}></div>
							<div className="banner-cover-content">
								<div className="banner-cover-logo" style={{ backgroundImage: "url(" + this.state.picture + ")" }}></div>
									<h3 className="banner-cover-title">{this.state.title}</h3>
									<div className="banner-cover-description" dangerouslySetInnerHTML={{__html: this.state.description}}></div>
									{this.state.button ?
										<button className="banner-cover-button" data-state="online" onClick={this.state.button.action}>{this.state.button.label}</button> : ""}
							</div>
						</div>
						  );
			}

			if (this.state.form) {
				items.push(
						<div className="banner-form-container" key="banner-form">
							<form className="banner-form" onSubmit={this.onSubmit}>
								<input ref="roomNameEntry" className="banner-form-entry linked" type="text" placeholder="Type a room name" autofocus />
								<input className="banner-form-submit linked" type="submit" value="Go" />
							</form>
						</div>
						);
			}

			return <div className="banner">{items}</div>;
		},

		getInitialState: function() {
			return {
				title: "",
				description: "",
				picture: "",
				cover: "",
				banner: false,
				form: false,
				button: null
			};
		},

		onStateChange: function(changes) {
			var user = store.get("user"),
				room = store.get("nav", "room"),
				mode, env, pics,
				rel, roomObj, userObj;

			if ((changes.nav && (changes.nav.mode || changes.nav.room)) || changes.user ||
				(changes.entities && (changes.entities[user] || changes.entities[room])) ||
				(changes.context && changes.context.env)) {
				mode = store.get("nav", "mode");
				env = store.get("context", "env");

				if (mode === "room" && env !== "embed") {
					rel = store.getRelation();
					roomObj = store.getRoom() || {};
					pics = getRoomPics(roomObj.id);

					this.setState({
						title: roomObj.id,
						description: format.mdToHtml(roomObj.description) || "This room has no description.",
						picture: pics.picture,
						cover: pics.banner,
						banner: true,
						form: false,
						button: (rel && /(owner|moderator)/.test(rel.role)) ? {
							label: "Configure room",
							action: this.showRoomSettings
						} : null
					});
				} else if (mode === "home" && env !== "embed" && user && !appUtils.isGuest(user)) {
					userObj = store.getUser() || {};

					this.setState({
						title: userObj.id,
						description: format.mdToHtml(userObj.description) || "This user has no description.",
						picture: getAvatar(userObj.picture, 128),
						cover: getAvatar(userObj.picture, 24),
						banner: true,
						form: true,
						button: {
							label: "Configure account",
							action: this.showUserSettings
						}
					});
				} else {
					this.setState(this.getInitialState());
				}
			}
		},

		componentDidMount: function() {
			core.on("statechange", this.onStateChange, 500);
		},

		componentWillUnmount: function() {
			core.off("statechange", this.onStateChange);
		}
	});

	return Banner;
};
