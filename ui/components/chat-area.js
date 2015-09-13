/* eslint-env es6, browser */

"use strict";

module.exports = function(core, config, store) {
	const React = require("react"),
		  ChatAreaMessages = require("./chat-area-messages.js")(core, config, store),
		  ScrollTo = require("./scroll-to.js")(core, config, store),
		  Compose = require("./compose.js")(core, config, store),
		  PrivateRoom = require("./private-room.js")(core, config, store),
		  NoSuchRoom = require("./no-such-room.js")(core, config, store);

	let ChatArea = React.createClass({
		scrollToBottom: function() {
			core.emit("setstate", {
				nav: {
					textRange: { time: null }
				}
			});
		},

		render: function() {
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
		},

		getInitialState: function() {
			return { read: true };
		},

		onStateChange: function(changes) {
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
		},

		componentDidMount: function() {
			core.on("statechange", this.onStateChange, 500);
		},

		componentWillUnmount: function() {
			core.off("statechange", this.onStateChange);
		}
	});

	return ChatArea;
};
