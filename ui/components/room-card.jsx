/* jshint browser: true */

var stringUtils = require("../../lib/string-utils.js"),
	appUtils = require("../../lib/app-utils.js"),
	showMenu = require("../utils/show-menu.js"),
	roomPics = {};

function getRoomPics(roomId) {
	var hash, cover, picture;

	if (roomPics[roomId]) {
		return roomPics[roomId];
	}

	hash = stringUtils.hashCode(roomId);
	cover = parseInt((hash + "").slice(-2));
	picture = parseInt((hash + "").slice(-4).slice(0, 2));

	if (cover > 50) {
		cover = Math.round(cover / 2) + "";
	} else if (cover < 10) {
		cover = "0" + cover;
	}

	if (picture > 50) {
		picture = Math.round(picture / 2) + "";
	} else if (picture < 10) {
		picture = "0" + picture;
	}

	roomPics[roomId] = {
		cover: "/s/pictures/" + cover + ".jpg",
		picture: "/s/pictures/" + picture + ".jpg"
	};

	return roomPics[roomId];
}

module.exports = function(core, config, store) {
	var React = require("react"),
		RoomCard;

	RoomCard = React.createClass({
		showRoomMenu: function(e) {
			core.emit("room-menu", {
				origin: e.currentTarget,
				buttons: {},
				items: {},
				room: this.props.roomId
			}, function(err, menu) {
				showMenu("room-menu", menu);
			});
		},

		goToRoom: function(e) {
			if (/icon-more/.test(e.target.className)) {
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

		render: function() {
			var room = store.getRoom(this.props.roomId),
				roomCover = (room.guides && room.guides.customization && room.guides.customization.cover) ? room.guides.customization.cover : getRoomPics(this.props.roomId).cover,
				roomPicture = room.picture || getRoomPics(this.props.roomId).picture,
				user, menu, threads;

			threads = (store.getThreads(this.props.roomId, null, -(this.props.threadCount || 3)) || []).reverse().map(function(thread) {
				return (
					<div key={"room-card-thread-" + room.id + "-" + thread.id} className="card-thread">
						<span className="card-thread-message">{thread.title}</span>
						<span className="card-thread-by">{thread.from}</span>
					</div>
				);
			});

			user = store.get("user");

			if (!user || appUtils.isGuest(user)) {
				menu = [];
			} else {
				menu = <a className="card-header-icon card-header-icon-more card-cover-icon" onClick={this.showRoomMenu}></a>;
			}

			return (
				<div key={"room-card-" + room.id} className="card room-card" onClick={this.goToRoom}>
					<div className="card-cover" style={{ backgroundImage: "url(" + roomCover  + ")" }}>
						<div className="card-cover-header card-header">
							<span className="card-header-badge notification-badge notification-badge-mention">{room.mentions}</span>
							<span className="card-header-badge notification-badge notification-badge-messages">{room.messages}</span>
							{menu}
						</div>
						<div className="card-cover-logo" style={{ backgroundImage: "url(" + roomPicture  + ")" }}></div>
						<h3 className="card-cover-title">{room.id}</h3>
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
