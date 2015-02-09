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



RoomCard = React.createClass({displayName: "RoomCard",
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
			        React.createElement("div", {className: "card-discussion"}, 
						React.createElement("span", {className: "card-discussion-message"}, thread.title), 
						React.createElement("span", {className: "card-discussion-by"}, thread.from)
					)
			);
		});

		return (
		    React.createElement("div", {className: "card room-card js-room-card", "data-color": this.props.color, "data-room": this.props.room}, 
		      	React.createElement("div", {className: "card-cover", style: coverStyle}, 
		      		React.createElement("div", {className: "card-cover-header card-header"}, 
		      			React.createElement("span", {className: "card-header-badge notification-badge notification-badge-mention"}, this.props.mentions), 
		      			React.createElement("span", {className: "card-header-badge notification-badge notification-badge-messages"}, this.props.messages), 
		      			React.createElement("a", {className: "card-header-icon card-header-icon-more card-cover-icon js-room-more"})
		  			), 
		  			React.createElement("div", {className: "card-cover-logo", style: logoStyle}), 
		  			React.createElement("h3", {className: "card-cover-title"}, this.props.room)
				), 
				React.createElement("div", {className: "card-content card-content-big"}, 
					React.createElement("h4", {className: "card-content-title"}, "Recent discussions"), 
					discussions
				)
			)
		);
	}
});

module.exports = RoomCard;
