/* eslint-env browser */

"use strict";

var userUtils = require("../../lib/user-utils.js"),
	roomUtils = require("../../lib/room-utils.js"),
	getRoomPics = require("../../lib/get-room-pics.js");

module.exports = function(core, config, store) {
	var React = require("react"),
		Badge = require("./badge.js")(core, config, store),
		FollowButton = require("./follow-button.js")(core, config, store),
		RoomCard;

	RoomCard = React.createClass({
		showRoomSettings: function() {
			core.emit("setstate", {
				nav: {
					room: this.props.roomId,
					dialog: "conf"
				}
			});
		},

		goToRoom: function(e) {
			if (/card-icon/.test(e.target.className)) {
				return;
			}

			core.emit("setstate", {
				nav: {
					room: this.props.roomId,
					mode: "room",
					view: null,
					thread: null
				}
			});
		},

		shareRoom: function() {
			let url = window.location.protocol + "//" + window.location.host + "/" + this.props.roomId,
				text = "Join " + this.props.roomId + " on " + config.appName;

			if (window.Android && typeof window.Android.shareItem === "function") {
				window.Android.shareItem("Share room via", text + " - " + url);

				return;
			}

			core.emit("setstate", {
				nav: {
					dialog: "share",
					dialogState: {
						shareText: text,
						shareUrl: url,
						shareType: "room"
					}
				}
			});
		},

		badgeFilter: function(note) {
			return note.group.split("/")[0] === this.props.roomId;
		},

		render: function() {
			var room = this.props.roomId,
				user = store.get("user"),
				rel = store.getRelation(room, user),
				pics = getRoomPics(store.getRoom(room), [ "avatar", "cover" ]),
				icons = [],
				threads;

			threads = (store.getThreads(room, null, -(this.props.threadCount || 2)) || []).reverse().map(function(thread) {
				return (
					<div key={"room-card-thread-" + room + "-" + thread.id}>
						<span className="text">{thread.title}</span>
						<span className="nick">{userUtils.getNick(thread.from)}</span>
					</div>
				);
			});

			icons.push(<a className="card-icon card-icon-share card-actions-item" key={"card-share-" + room} onClick={this.shareRoom}></a>);

			if (user && !userUtils.isGuest(user)) {
				if (rel && (/owner|moderator/).test(rel.role)) {
					icons.push(<a data-state="online" className="card-icon card-icon-configure card-actions-item"
					           key={"card-configure-" + room} onClick={this.showRoomSettings}></a>);
				} else {
					icons.push(
						<FollowButton
							room={room}
							data-state="online"
							className="card-icon card-icon-follow card-actions-item"
							key={"card-follow-" + room}
						/>);
				}
			}

			return (
				<div key={"room-card-" + room} className="card card-room" onClick={this.goToRoom}>
					<div className="card-cover" style={{ backgroundImage: "url(" + pics.cover  + ")" }}>
						<div className="card-actions">
							<Badge className="card-actions-item card-badge notification-badge" filter={this.badgeFilter} />
							{icons}
						</div>
						<div className="card-cover-logo" style={{ backgroundImage: "url(" + pics.avatar  + ")" }}></div>
						<h3 className="card-cover-title">{roomUtils.getName(room)}</h3>
					</div>
					<div className="card-content">
						<h4 className="card-content-title">Recent discussions</h4>
						{threads}
					</div>
				</div>
			);
		}
	});

	return RoomCard;
};
