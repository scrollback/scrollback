/* jshint browser: true */

var format = require("../../lib/format.js");

module.exports = function(core, config, store) {
	var React = require("react"),
		ChatItem;

	ChatItem = React.createClass({
		render: function() {
			var nav =  store.getNav(),
				text = format.formatTextToMD(this.props.text.text),
				time = format.friendlyTime(this.props.text.time, new Date().getTime()),
				classNames = "chat-item";

			if (this.props.text.labels) {
				for (var label in this.props.text.labels) {
					if (this.props.text.labels[label] === 1) {
						classNames += " chat-item-label-" + label;
					}
				}
			}

			return (
				<div className={classNames} key={"chat-item-" + nav.room + "-" + nav.thread + "-" + this.props.text.id}>
			 		<div className="chat-item-nick">{this.props.text.from}</div>
					<div className="chat-item-message markdown-text" dangerouslySetInnerHTML={{__html: text}}></div>
					<time className="chat-item-timestamp" dateTime={new Date(this.props.text.time).toISOString()}>{time}</time>
		 		</div>
			);
		}
	});

	return ChatItem;
};
