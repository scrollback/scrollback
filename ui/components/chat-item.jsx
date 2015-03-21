/* jshint browser: true */

var format = require("../../lib/format.js"),
	showMenu = require("../utils/show-menu.js");

module.exports = function(core, config, store) {
	var React = require("react"),
		ChatItem;

	ChatItem = React.createClass({
		showChatMenu: function(e) {
			if (e.target.tagName === "A") {
				return;
			}

			core.emit("text-menu", {
				origin: e.currentTarget,
				buttons: {},
				items: {},
				arrow: true,
				textObj: this.props.text
			}, function(err, menu) {
				showMenu("text-menu", menu);
			});
		},

		render: function() {
			var nav =  store.get("nav"),
				text = format.formatTextToMD(this.props.text.text),
				time = format.friendlyTime(this.props.text.time, new Date().getTime()),
				timeStamp, nick, classNames = "chat-item";

			if (this.props.text.tags) {
				for (var i = 0, l = this.props.text.tags.length; i < l; i++) {
					classNames += " chat-item-tag-" + this.props.text.tags[i];
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
				<div className={classNames} key={"chat-item-" + nav.room + "-" + (nav.thread || "all") + "-" + this.props.text.id} onClick={this.showChatMenu}>
					{nick}
					<div className="chat-item-message markdown-text" dangerouslySetInnerHTML={{__html: text}}></div>
					{timeStamp}
				</div>
			);
		}
	});

	return ChatItem;
};
