/* jshint browser: true */

var format = require("../../lib/format.js");

module.exports = function(core, config, store) {
	var React = require("react"),
		ChatItem;

	ChatItem = React.createClass({
		render: function() {
			var nav =  store.get("nav"),
				text = format.formatTextToMD(this.props.text.text),
				time = format.friendlyTime(this.props.text.time, new Date().getTime()),
				timeStamp, nick, classNames = "chat-item";

			if (this.props.text.labels) {
				for (var label in this.props.text.labels) {
					if (this.props.text.labels[label] === 1) {
						classNames += " chat-item-label-" + label;
					}
				}
			}

			if (this.props.showtime) {
				timeStamp = <time className="chat-item-timestamp" dateTime={new Date(this.props.text.time).toISOString()}>{time}</time>;
			}

			if (this.props.continues) {
				classNames += " chat-item-continues";
			}

			if (this.props.continuation) {
				classNames += " chat-item-continuation";
			} else {
				nick = <div className="chat-item-nick">{format.username(this.props.text.from)}</div>;
			}

			return (
				<div className={classNames} key={"chat-item-" + nav.room + "-" + (nav.thread || "all") + "-" + this.props.text.id}>
					{nick}
					<div className="chat-item-message markdown-text" dangerouslySetInnerHTML={{__html: text}}></div>
					{timeStamp}
				</div>
			);
		}
	});

	return ChatItem;
};
