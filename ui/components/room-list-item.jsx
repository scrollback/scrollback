/* jshint browser: true */

module.exports = function(core, config, store) {
	var React = require("react"),
		RoomListItem;

	RoomListItem = React.createClass({
		goToRoom: function() {
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
			var room = store.get("entities", this.props.roomId);

			return (
				<div key={"room-list-" + room.id} className="card room-card" onClick={this.goToRoom}>
					<div className="card-header">
						<h3 className="card-header-title">{room.id}</h3>
						<span className="card-header-badge notification-badge notification-badge-mention">{room.mentions}</span>
						<span className="card-header-badge notification-badge notification-badge-messages">{room.messages}</span>
					</div>
				</div>
			);

		}
	});

	return RoomListItem;
};
