/* eslint-env browser */

"use strict";

var format = require("../../lib/format.js"),
	friendlyTime = require("../../lib/friendly-time.js"),
	userUtils = require("../../lib/user-utils.js"),
	showMenu = require("../utils/show-menu.js");

module.exports = function(core, config, store) {
	var React = require("react");

	class ChatItem extends React.Component {
		constructor(props, context) {
			super(props, context);
			this.selectMessage = this.selectMessage.bind(this);
		}

		showChatMenu(e) {
			if (/\bchat-item-nick\b/.test(e.target.className)) {
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
		}

		selectMessage(e) {
			var appChanges = {},
				index, currentText, selectedTexts,
				selection = window.getSelection();

			if (e.target.tagName === "A" || (selection && selection.type === "Range")) {
				return;
			}

			currentText = store.get("app", "currentText");

			if (!/\bchat-item-nick\b/.test(e.target.className)) {
				selectedTexts = store.get("app", "selectedTexts");

				selectedTexts = Array.isArray(selectedTexts) ? selectedTexts.slice(0) : [];

				index = selectedTexts.indexOf(this.props.text.id);

				if (index > -1) {
					selectedTexts.splice(index, 1);
				} else {
					selectedTexts.push(this.props.text.id);
				}

				appChanges.selectedTexts = selectedTexts;
			}

			if (currentText === this.props.text.id) {
				currentText = null;
			} else {
				currentText = this.props.text.id;

				this.showChatMenu(e);
			}

			appChanges.currentText = currentText;

			core.emit("setstate", { app: appChanges });
		}

		render() {
			var nav =  store.get("nav"),
				text = format.mdToHtml(this.props.text.text),
				time = friendlyTime(this.props.text.time),
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
				nick = <div className="chat-item-nick">{userUtils.getNick(this.props.text.from)}</div>;
			}

			return (
				<div className={classNames} key={"chat-item-" + nav.room + "-" + (nav.thread || "all") + "-" + this.props.text.id} onClick={this.selectMessage}>
					{nick}
					<div className="chat-item-message markdown-text" dangerouslySetInnerHTML={{__html: text}}></div>
					{timeStamp}
				</div>
			);
		}
	}

	return ChatItem;
};
