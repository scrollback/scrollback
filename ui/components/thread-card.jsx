/* jshint browser: true */

module.exports = function(core, config, store) {
	var React = require("react"),
		ThreadCard;

	ThreadCard = React.createClass({
		getInitialState: function () {
			return { texts: (store.getTexts(this.props.roomId, this.props.thread.id, null, -(this.props.textCount || 3)) || []).reverse() };
		},

		componentDidMount: function () {
			var self = this;

			core.on("statechange", function(changes, next) {
				if (self.isMounted() && "texts" in changes) {
					self.replaceState(self.getInitialState());
				}

				next();
			}, 500);
		},

		goToThread: function(e) {
			if (/(icon-more|reply)/.test(e.target.getAttribute("class"))) {
				return;
			}

			if (/active/.test(this.refs.quickReply.getDOMNode().getAttribute("class"))) {
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
			var DOMNode = this.refs.quickReply.getDOMNode();

			if (/active/.test(DOMNode.getAttribute("class"))) {
				return;
			}

			DOMNode.className += " active";

			setTimeout(function() {
				DOMNode.querySelector(".card-entry-reply").focus();
			}, 50);
		},

		hideQuickReply: function() {
			var DOMNode = this.refs.quickReply.getDOMNode(),
				classNames = DOMNode.getAttribute("class");

			if (!/active/.test(classNames)) {
				return;
			}

			classNames = classNames.replace(/\bactive\b/, "").trim();
		},

		render: function() {
			var thread = this.props.thread,
			  	chats;

			chats = this.state.texts.map(function(chat) {
				if (typeof chat === "object" && typeof chat.text === "string") {
					return (
						<div key={"thread-card-chat-" + thread.id + "-" + chat.id} className="card-chat">
							<span className="card-chat-nick">{chat.from}</span>
							<span className="card-chat-message">{chat.text}</span>
						</div>
					);
				}
			});

			return (
				<div  key={"thread-card-" + thread.id} className="card thread-card" data-color={thread.color} onClick={this.goToThread}>
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
