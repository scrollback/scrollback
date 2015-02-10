/* global state */

var React = require("react"),
	RoomCard;

/**
 * RoomCard component.
 *
 * room: {
 * 	room: "somename",
 * 	cover: "http://example.com/cover.jpg",
 * 	picture: "http://example.com/logo.jpg",
 * 	mentions: 23,
 * 	messages: 54,
 * 	color: "#00aaff",
 * 	discussions: [
 * 		{ title: "Thread title 1", from: "someone" },
 * 		{ title: "Thread title 2", from: "someother" }
 * 	]
 * }
 */


RoomCard = React.createClass({
	// getCardState: function () {
	// 	return { threads: state.getThreads(room.roomId, null, -room.discussionCount || -2).reverse() };
	// },
	// getInitialState: function () {
	// 	return this.getCardState();
	// },
	// componentDidMount: function () {
	// 	core.on('statechange', function(changes, next) {
	// 		if(changes.contains('content.' + room.roomId + '.threadRanges')) {
	// 			this.setState (this.getCardState());
	// 		}

	// 		next();
	// 	}, 500);
	// },
	render: function() {
		var discussions = [],
			room = state.get("entities", this.props.roomId),
		  	coverStyle = { backgroundImage: "url(" + room.cover + ")" },
		  	logoStyle = { backgroundImage: "url(" + room.picture + ")" };

		// discussions = this.state.threads.map(function (thread) {
		// 	return (
		// 	        <div className="card-discussion">
		// 				<span className="card-discussion-message">{thread.title}</span>
		// 				<span className="card-discussion-by">{thread.from}</span>
		// 			</div>
		// 	);
		// });

		return (
		    <div className="card room-card js-room-card" data-color={room.color} data-room={room.room}>
		      	<div className="card-cover" style={coverStyle}>
		      		<div className="card-cover-header card-header">
		      			<span className="card-header-badge notification-badge notification-badge-mention">{room.mentions}</span>
		      			<span className="card-header-badge notification-badge notification-badge-messages">{room.messages}</span>
		      			<a className="card-header-icon card-header-icon-more card-cover-icon js-room-more"></a>
		  			</div>
		  			<div className="card-cover-logo" style={logoStyle}></div>
		  			<h3 className="card-cover-title">{room.id}</h3>
				</div>
				<div className="card-content card-content-big">
					<h4 className="card-content-title">Recent discussions</h4>
					{discussions}
				</div>
			</div>
		);
	}
});

module.exports = RoomCard;
