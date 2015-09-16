/* eslint-env browser */

"use strict";

module.exports = function(core, config, store) {
	const React = require("react"),
		  ChatAreaMessages = require("./chat-area-messages.js")(core, config, store),
		  ScrollTo = require("./scroll-to.js")(core, config, store),
		  Compose = require("./compose.js")(core, config, store),
		  PrivateRoom = require("./private-room.js")(core, config, store),
		  NoSuchRoom = require("./no-such-room.js")(core, config, store);

	class ChatArea extends React.Component {
		constructor(props, context) {
			super(props, context);
			this.onStateChange = this.onStateChange.bind(this);
			this.scrollToBottom = this.scrollToBottom.bind(this);
			this.state = { read: true };
		}

		scrollToBottom() {
			core.emit("setstate", {
				nav: {
					textRange: { time: null }
				}
			});
		}

		render() {
			// Don't show
			if (!this.state.show) {
				return <div data-mode="none" />;
			}

			if (!this.state.read) {
				return <PrivateRoom data-mode="chat" />;
			}

			if (store.getRoom() === "missing") {
				return <NoSuchRoom data-mode="chat" />;
			}

			return (
					<div className="main-content-chat chat-area" data-mode="chat">

						<ChatAreaMessages />

						<div className="chat-area-actions">
							<ScrollTo type="bottom" onClick={this.scrollToBottom} />

							<Compose />
						</div>
					</div>
			);
		}

		onStateChange(changes) {
			const roomId = store.get("nav", "room"),
				  userId = store.get("user"),
				  rel = roomId + "_" + userId;

			if ((changes.nav && (changes.nav.mode || changes.nav.room || "thread" in changes.nav)) ||
				(changes.entities && (changes.entities[roomId] || changes.entities[userId] || changes.entities[rel])) || changes.user) {

				this.setState({
					show: (store.get("nav", "mode") === "chat"),
					read: store.isRoomReadable()
				});
			}
		}

		componentDidMount() {
			core.on("statechange", this.onStateChange, 500);
		}

		componentWillUnmount() {
			core.off("statechange", this.onStateChange);
		}
	}

	return ChatArea;
};
