var React = require("react"),
	RoomCard;

/**
 * RoomCard component.
 *
 * {
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

/* global state, core */



RoomCard = React.createClass({
	getCardState: function () {
		return { threads: state.getThreads(this.props.roomId, null, -this.props.discussionCount || -2).reverse() };
	},
	getInitialState: function () {
		return this.getCardState();
	},
	componentDidMount: function () {
		core.on('stateChanged', function (changes) {
			if(changes.contains('content.' + this.props.roomId + '.threadRanges')) {
				this.setState (this.getCardState());
			}
		});
	},
	render: function() {
		var discussions = [],
		  	coverStyle = { backgroundImage: "url(" + this.props.cover + ")" },
		  	logoStyle = { backgroundImage: "url(" + this.props.picture + ")" };

		discussions = this.state.threads.map(function (thread) {
			return (
			        <div className="card-discussion">
						<span className="card-discussion-message">{thread.title}</span>
						<span className="card-discussion-by">{thread.from}</span>
					</div>
			);
		});

		return (
		    <div className="card room-card js-room-card" data-color={this.props.color} data-room={this.props.room}>
		      	<div className="card-cover" style={coverStyle}>
		      		<div className="card-cover-header card-header">
		      			<span className="card-header-badge notification-badge notification-badge-mention">{this.props.mentions}</span>
		      			<span className="card-header-badge notification-badge notification-badge-messages">{this.props.messages}</span>
		      			<a className="card-header-icon card-header-icon-more card-cover-icon js-room-more"></a>
		  			</div>
		  			<div className="card-cover-logo" style={logoStyle}></div>
		  			<h3 className="card-cover-title">{this.props.room}</h3>
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
