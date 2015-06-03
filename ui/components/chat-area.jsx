/* eslint-env es6, browser */

"use strict";

module.exports = function(core, config, store) {
	const React = require("react"),
		  ChatAreaMessages = require("./chat-area-messages.jsx")(core, config, store),
		  ScrollTo = require("./scroll-to.jsx")(core, config, store),
		  Compose = require("./compose.jsx")(core, config, store),
		  room = require("../../lib/room.js")(core, config, store);

	let ChatArea = React.createClass({
		scrollToBottom: function() {
			core.emit("setstate", {
				nav: {
					textRange: { time: null }
				}
			});
		},

		render: function() {
			if (!this.state.read) {
				return (
					<div className="chat-area-empty blankslate-area" data-mode="chat">
						<img src="/s/assets/blankslate/private-room.png" />
					</div>
					);
			}

			let chatAreaClassNames = "main-content-chat chat-area";

			// Enhance chat area layout in modern browsers
			if (window.CSS.supports("display", "flex")) {
				chatAreaClassNames += " flex-enhanced";
			}

			return (
					<div className={chatAreaClassNames} data-mode="chat">

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
				  userId = store.get("user");

			if (changes.entities && (changes.entities[roomId] || changes.entities[userId])) {
				this.setState({ read: room.isReadable() });
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
