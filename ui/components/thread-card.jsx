/* jshint browser: true */

var appUtils = require("../../lib/app-utils.js"),
	showMenu = require("../utils/show-menu.js");

module.exports = function(core, config, store) {
	var React = require("react"),
		ThreadCard;

	ThreadCard = React.createClass({
		getInitialState: function() {
		    return { quickReplyShown: false };
		},

		showThreadMenu: function(e) {
			var self = this;

			core.emit("thread-menu", {
				origin: e.currentTarget,
				buttons: {},
				items: {},
				threadObj: self.props.thread
			}, function(err, menu) {
				showMenu("thread-menu", menu);
			});
		},

		goToThread: function(e) {
			if (/(icon-more|reply)/.test(e.target.className)) {
				return;
			}

			if (this.state.quickReplyShown) {
				return;
			}

			core.emit("setstate", {
				nav: {
					thread: this.props.thread.id,
					mode: "chat",
					view: null
				}
			});
		},

		sendMessage: function(e) {
			var text;

			if (e.keyCode !== 13) {
				return;
			}

			text = e.currentTarget.value.trim();

			if (!text) {
				return;
			}

			core.emit("text-up", {
				to: store.get("nav", "room"),
				from: store.get("user"),
				text: text,
				time: new Date().getTime(),
				thread: this.props.thread.id
			});

			e.currentTarget.value = "";
		},

		showQuickReply: function() {
			var quickReply = React.findDOMNode(this.refs.quickReply);

			if (/active/.test(quickReply.className)) {
				return;
			}

			quickReply.className += " active";

			quickReply.querySelector(".card-entry-reply").focus();

			// Set a flag so we can prevent click
			this.setState({ quickReplyShown: true });
		},

		hideQuickReply: function() {
			var quickReply = React.findDOMNode(this.refs.quickReply);

			if (!/active/.test(quickReply.className)) {
				return;
			}

			quickReply.className = quickReply.className.replace(/\bactive\b/, "").trim();

			// Remove the flag on threadCard
			setTimeout(function() {
				this.setState({ quickReplyShown: false });
			}.bind(this), 300);
		},

		render: function() {
			var thread = this.props.thread,
				rel = store.getRelation(),
				menu, chats = [];

			(store.getTexts(this.props.roomId, this.props.thread.id, null, -(this.props.textCount || 3)) || []).forEach(function(chat) {
				if (chat.tags && (chat.tags.indexOf("hidden") > -1 || chat.tags.indexOf("abusive") > -1)) {
					return;
				}

				if (typeof chat === "object" && typeof chat.text === "string") {
					chats.push((
						<div key={"thread-card-chat-" + store.get("nav", "room") + "-" + thread.id + "-" + chat.id} className="card-chat">
							<span className="card-chat-nick">{appUtils.formatUserName(chat.from)}</span>
							<span className="card-chat-message">{chat.text}</span>
						</div>
					));
				}
			});

			if (rel && /(owner|moderator)/.test(rel.role)) {
				menu = <a className="card-header-icon card-header-icon-more" onClick={this.showThreadMenu}></a>;
			} else {
				menu = [];
			}

			return (
				<div key={"thread-card-" + thread.id} className="card thread-card" data-color={thread.color} onClick={this.goToThread}>
					<div className="card-header">
						<h3 className="card-header-title">{thread.title}</h3>
						<span className="card-header-badge notification-badge notification-badge-mention">{thread.mentions}</span>
						<span className="card-header-badge notification-badge notification-badge-messages">{thread.messages}</span>
						{menu}
					</div>
					<div className="card-content">{chats}</div>
					<div ref="quickReply" className="card-quick-reply" onClick={this.showQuickReply}>
						<div className="card-quick-reply-content">
							<div className="card-button card-button-reply">Quick reply</div>
							<input type="text" className="card-entry card-entry-reply" onKeyDown={this.sendMessage} onBlur={this.hideQuickReply} />
						</div>
					</div>
				</div>
			);
		}
	});

	return ThreadCard;
};
