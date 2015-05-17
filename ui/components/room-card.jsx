/* eslint-env browser */

"use strict";

var appUtils = require("../../lib/app-utils.js");

module.exports = function(core, config, store) {
	var React = require("react"),
		Badge = require("./badge.jsx")(core, config, store),
		getRoomPics = require("../utils/room-pics.js")(core, config, store),
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

		toggleFollowRoom: function() {
			var room = this.props.roomId,
				rel = store.getRelation(room);

			if (rel && rel.role === "follower") {
				core.emit("part-up",  {
					to: room,
					room: room
				});
			} else {
				core.emit("join-up",  {
					to: room,
					room: room
				});
			}
		},

		goToRoom: function(e) {
			if (/card-header-icon/.test(e.target.className)) {
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
				text = "Join " + this.props.roomId + " on scrollback";

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

		badgeFilter: function(notification) {
			return notification.action.to === this.props.roomId;
		},

		render: function() {
			var room = this.props.roomId,
				user = store.get("user"),
				rel = store.getRelation(room, user),
				pics = getRoomPics(room),
				icons = [],
				threads;

			threads = (store.getThreads(room, null, -(this.props.threadCount || 3)) || []).reverse().map(function(thread) {
				return (
					<div key={"room-card-thread-" + room + "-" + thread.id} className="card-thread">
						<span className="card-thread-message">{thread.title}</span>
						<span className="card-thread-by">{appUtils.formatUserName(thread.from)}</span>
					</div>
				);
			});

			icons.push(<a className="card-header-icon card-header-icon-share card-cover-icon" key={"card-share-" + room} onClick={this.shareRoom}></a>);

			if (user && !appUtils.isGuest(user)) {
				if (rel && (/owner|moderator/).test(rel.role)) {
					icons.push(<a data-state="online" className="card-header-icon card-header-icon-configure card-cover-icon"
					           key={"card-configure-" + room} onClick={this.showRoomSettings}></a>);
				} else {
					icons.push(<a data-state="online" className={"card-header-icon card-header-icon-follow card-cover-icon" +
					           ((rel && rel.role === "follower") ? " following" : "")}
					           key={"card-follow-" + room} onClick={this.toggleFollowRoom}></a>);
				}
			}

			return (
				<div key={"room-card-" + room} className="card room-card" onClick={this.goToRoom}>
					<div className="card-cover" style={{ backgroundImage: "url(" + pics.cover  + ")" }}>
						<div className="card-cover-header card-header">
							<Badge className="card-header-badge notification-badge" filter={this.badgeFilter} />
							{icons}
						</div>
						<div className="card-cover-logo" style={{ backgroundImage: "url(" + pics.picture  + ")" }}></div>
						<h3 className="card-cover-title">{room}</h3>
					</div>
					<div className="card-content card-content-big">
						<h4 className="card-content-title">Recent discussions</h4>
						{threads}
					</div>
				</div>
			);
		}
	});

	return RoomCard;
};
