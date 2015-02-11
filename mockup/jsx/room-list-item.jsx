/* jshint browser: true */
/* global state, core */

var React = require("react"),
	RoomListItem;


RoomListItem = React.createClass({
	onClick: function() {
		core.emit("setstate", {
			nav: {
				room: this.props.roomId,
				mode: "room",
				view: null
			}
		});
	},

	render: function() {
		var room = state.get("entities", this.props.roomId);

		return (
		        <div className="card room-card">
		        	<div className="card-header">
		        		<h3 className="card-header-title">{room.id}</h3>
		        		<span className="card-header-badge notification-badge notification-badge-mention">{room.mentions}</span>
		        		<span className="card-header-badge notification-badge notification-badge-messages">{room.messages}</span>
	        		</div>
	        	</div>
    	);

	}
});


module.exports = RoomListItem;
