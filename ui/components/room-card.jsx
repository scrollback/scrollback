/* jshint browser: true */

var appUtils = require("../../lib/app-utils.js"),
	showMenu = require("../utils/show-menu.js");

module.exports = function(core, config, store) {
	var React = require("react"),
		getRoomPics = require("../utils/room-pics.js")(core, config, store),
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
			var room = this.props.roomId,
				user = store.get("user"),
				pics = getRoomPics(room),
				menu, threads;

			threads = (store.getThreads(room, null, -(this.props.threadCount || 3)) || []).reverse().map(function(thread) {
				return (
					<div key={"room-card-thread-" + room + "-" + thread.id} className="card-thread">
						<span className="card-thread-message">{thread.title}</span>
						<span className="card-thread-by">{appUtils.formatUserName(thread.from)}</span>
					</div>
				);
			});

			if (user && !appUtils.isGuest(user)) {
				menu = <a className="card-header-icon card-header-icon-more card-cover-icon" onClick={this.showRoomMenu}></a>;
			} else {
				menu = [];
			}

			return (
				<div key={"room-card-" + room} className="card room-card" onClick={this.goToRoom}>
					<div className="card-cover" style={{ backgroundImage: "url(" + pics.cover  + ")" }}>
						<div className="card-cover-header card-header">
							<span className="card-header-badge notification-badge notification-badge-mention"></span>
							<span className="card-header-badge notification-badge notification-badge-messages"></span>
							{menu}
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
