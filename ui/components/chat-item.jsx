/* jshint browser: true */

module.exports = function() {
	var React = require("react"),
		ChatItem;

	ChatItem = React.createClass({
		render: function() {
			return (
	         	<div className="chat-item" key={"chat-item-" + this.props.textId}>
	         		<div className="chat-item-nick">{this.props.nick}</div>
	         		<div className="chat-item-message">{this.props.text}</div>
         		</div>
	        );
		}
	});

	return ChatItem;
};
