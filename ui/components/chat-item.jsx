/* jshint browser: true */

var format = require("../../lib/format.js");

module.exports = function(core, config, store) {
	var React = require("react"),
		ChatItem;

	ChatItem = React.createClass({
		render: function() {
			var nav =  store.getNav();

			return (
				<div className="chat-item" key={"chat-item-" + nav.room + "-" + nav.thread + "-" + this.props.text.id}>
			 		<div className="chat-item-nick">{this.props.text.from}</div>
					<div className="chat-item-message">{this.props.text.text}</div>
			 		<time className="chat-item-timestamp" dateTime={new Date(this.props.text.time).toISOString()}>
			 			{format.friendlyTime(this.props.text.time, new Date().getTime())}
			 		</time>
		 		</div>
			);
		}
	});

	return ChatItem;
};
