/* jshint browser: true */

module.exports = function(core, config, store) {
	var React = require("react"),
		ThreadCard;

	ThreadCard = React.createClass({
		goToThread: function(e) {
			if (/(icon-more|reply)/.test(e.target.className)) {
				return;
			}

			if (/has-quickreply/.test(e.currentTarget.className)) {
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
				to: store.getNav().room,
				from: store.get("user"),
				text: text,
				time: new Date().getTime(),
				threads: [{ id: this.props.thread }]
			});

			e.currentTarget.value = "";
		},

		showQuickReply: function() {
			var quickReply = this.refs.quickReply.getDOMNode();

			if (/active/.test(quickReply.className)) {
				return;
			}

			quickReply.className += " active";

			quickReply.querySelector(".card-entry-reply").focus();

			// Set a flag on threadCard so we can prevent click
			this.refs.threadCard.getDOMNode().className += " has-quickreply";
		},

		hideQuickReply: function() {
			var quickReply = this.refs.quickReply.getDOMNode(),
				threadCard = this.refs.threadCard.getDOMNode();

			if (!/active/.test(quickReply.className)) {
				return;
			}

			quickReply.className = quickReply.className.replace(/\bactive\b/, "").trim();

			// Remove the flag on threadCard
			setTimeout(function() {
				threadCard.className = threadCard.className.replace(/\bhas-quickreply\b/, "").trim();
			}, 300);
		},

		render: function() {
			var thread = this.props.thread,
			  	chats;

			chats = (store.getTexts(this.props.roomId, this.props.thread.id, null, -(this.props.textCount || 3)) || []).reverse().map(function(chat) {
				if (typeof chat === "object" && typeof chat.text === "string") {
					return (
						<div key={"thread-card-chat-" + store.getNav().room + "-" + thread.id + "-" + chat.id} className="card-chat">
							<span className="card-chat-nick">{chat.from}</span>
							<span className="card-chat-message">{chat.text}</span>
						</div>
					);
				}
			});

			return (
				<div ref="threadCard" key={"thread-card-" + thread.id} className="card thread-card" data-color={thread.color} onClick={this.goToThread}>
					<div className="card-header">
						<h3 className="card-header-title">{thread.title}</h3>
			  			<span className="card-header-badge notification-badge notification-badge-mention">{thread.mentions}</span>
			  			<span className="card-header-badge notification-badge notification-badge-messages">{thread.messages}</span>
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
