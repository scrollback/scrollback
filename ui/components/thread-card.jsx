/* eslint-env browser */

"use strict";

const userUtils = require("../../lib/user-utils.js"),
	  format = require("../../lib/format.js"),
	  showMenu = require("../utils/show-menu.js");

module.exports = function(core, config, store) {
	var React = require("react"),
		Badge = require("./badge.jsx")(core, config, store),
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
			if (/(card-header-icon|reply)/.test(e.target.className)) {
				return;
			}

			if (this.state.quickReplyShown) {
				return;
			}

			core.emit("setstate", {
				nav: {
					thread: this.props.thread.id,
					mode: "chat",
					view: null,
					textRange:{
						time: null,
						before: 25
					}
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
				// Cannot set state if component is unmounted
				if (this.isMounted()) {
					this.setState({ quickReplyShown: false });
				}
			}.bind(this), 300);
		},

		onBlur: function() {
			if (store.get("app", "focusedInput") === "quick-reply-" + this.props.thread.id) {
				core.emit("setstate", {
					app: { focusedInput: null }
				});
			}

			this.hideQuickReply();
		},

		onFocus: function() {
			core.emit("setstate", {
				app: { focusedInput: "quick-reply-" + this.props.thread.id }
			});
		},

		shareThread: function() {
			// Life would be easier if we had a function to convert a state object to URL
			let url = window.location.protocol + "//" + window.location.host + "/" + store.get("nav", "room") + "/" + this.props.thread.id,
				text = "Let's talk about " + this.props.thread.title;

			if (window.Android && typeof window.Android.shareItem === "function") {
				window.Android.shareItem("Share discussion via", text + " - " + url);

				return;
			}

			core.emit("setstate", {
				nav: {
					dialog: "share",
					dialogState: {
						shareText: text,
						shareUrl: url,
						shareType: "discussion"
					}
				}
			});
		},

		badgeFilter: function(note) {
			return note.group.split("/")[1] === this.props.thread.id;
		},

		render: function() {
			var thread = this.props.thread,
				classNames = "card thread-card",
				rel = store.getRelation(),
				icons = [],
				chats = [];

			if (this.props.thread.tags) {
				for (var i = 0, l = this.props.thread.tags.length; i < l; i++) {
					classNames += " card-tag-" + this.props.thread.tags[i];
				}
			}

			(store.getTexts(this.props.roomId, this.props.thread.id, null, -(this.props.textCount || 3)) || []).forEach(function(chat) {
				if (chat.tags && chat.tags.indexOf("hidden") > -1 ) {
					return;
				}

				if (typeof chat === "object" && typeof chat.text === "string") {
					chats.push((
						<div key={"thread-card-chat-" + store.get("nav", "room") + "-" + thread.id + "-" + chat.id} className="card-chat">
							<span className="card-chat-nick">{userUtils.getNick(chat.from)}</span>
							<span className="card-chat-message">{format.mdToText(chat.text)}</span>
						</div>
					));
				}
			});

			if (!(this.props.thread.tags && this.props.thread.tags.indexOf("thread-hidden") > -1)) {
				icons.push(<a className="card-header-icon card-header-icon-share" key={"card-share-" + this.props.thread.id} onClick={this.shareThread}></a>);
			}

			if (rel && /(owner|moderator|su)/.test(rel.role)) {
				icons.push(<a className="card-header-icon card-header-icon-more" key={"card-more-" + this.props.thread.id} onClick={this.showThreadMenu}></a>);
			}

			return (
				<div key={"thread-card-" + thread.id} className={classNames} data-color={thread.color} onClick={this.goToThread}>
					<div className="card-header">
						<h3 className="card-header-title">{thread.title}</h3>
						<Badge className="card-header-badge notification-badge" filter={this.badgeFilter} />
						{icons}
					</div>
					<div className="card-content">{chats}</div>
					<div ref="quickReply" className="card-quick-reply" onClick={this.showQuickReply}>
						<div className="card-quick-reply-content">
							<div className="card-button card-button-reply">Quick reply</div>
							<input type="text" className="card-entry card-entry-reply" onKeyDown={this.sendMessage} onBlur={this.onBlur} onFocus={this.onFocus} />
						</div>
					</div>
				</div>
			);
		}
	});

	return ThreadCard;
};
