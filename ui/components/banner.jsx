/* jshint browser: true */

var appUtils = require("../../lib/app-utils.js"),
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
			var mode = store.get("nav", "mode"),
				items = [],
				user, userObj, roomObj, pics;

			if (mode === "room") {
				roomObj = store.getRoom();

				if (roomObj && roomObj.id) {
					pics = getRoomPics(roomObj.id);

					items.push(
					        <div className="banner-cover" style={{ backgroundImage: "url(" + pics.cover + ")" }} key="banner-cover">
								<div className="banner-cover-logo" style={{ backgroundImage: "url(" + pics.picture + ")" }}></div>
									<h3 className="banner-cover-title">{roomObj.id}</h3>
									<p className="banner-cover-description">{roomObj.description || "This room has no description."}</p>
									<a data-role="owner moderator" className="button banner-cover-button" onClick={this.showRoomSettings}>Configure room</a>
					        </div>
					          );
				}
			} else if (mode === "home") {
				user = store.get("user");

				if (user && !appUtils.isGuest(user)) {
					userObj = store.getUser();

					items.push(
					        <div className="banner-cover" style={{ backgroundImage: "url(" + getAvatar(userObj.picture, 24) + ")" }} key="banner-cover">
								<div className="banner-cover-logo" style={{ backgroundImage: "url(" + getAvatar(userObj.picture, 128) + ")" }}></div>
									<h3 className="banner-cover-title">{userObj.id}</h3>
									<p className="banner-cover-description">{userObj.description || "This user has no description."}</p>
									<a className="button banner-cover-button" onClick={this.showUserSettings}>Configure account</a>
					        </div>
					          );

					items.push(
							<div className="banner-form-container" key="banner-form">
								<form className="banner-form" onSubmit={this.onSubmit}>
									<input ref="roomNameEntry" className="banner-form-entry linked" type="text" placeholder="Type a room name" autofocus />
									<input className="banner-form-submit linked" type="submit" value="Go" />
								</form>
							</div>
					        );
				}
			}

			return <div className="banner">{items}</div>;
		}
	});

	return Banner;
};
