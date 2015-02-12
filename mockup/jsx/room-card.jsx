/* jshint browser: true */

module.exports = function(core, config, state) {
	var React = require("react"),
		RoomCard;

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
		goToRoom: function() {
			core.emit("setstate", {
				nav: {
					room: this.props.roomId,
					mode: "room",
					view: null
				}
			});
		},

		render: function() {
			var room = state.getRoom(this.props.roomId),
			  	coverStyle = { backgroundImage: "url(" + room.cover + ")" },
			  	logoStyle = { backgroundImage: "url(" + room.picture + ")" },
			  	discussions;

			discussions = state.getThreads(this.props.roomId, null, ((this.props.discussionCount || 2) * -1)).reverse().map(function(thread) {
				return (
				        <div key={"thread-" + room.id + "-" + thread.id} className="card-discussion">
							<span className="card-discussion-message">{thread.title}</span>
							<span className="card-discussion-by">{thread.from}</span>
						</div>
				);
			});

			return (
			    <div className="card room-card js-room-card" onClick={this.goToRoom}>
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

	return RoomCard;
};
