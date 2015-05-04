/* jshint browser: true */

"use strict";

module.exports = function(core, config, store) {
	var React = require("react"),
		ConnectionStatus;

	ConnectionStatus = React.createClass({
		render: function() {
			return <div className="connection-status" data-state="offline connecting">{this.state.text}</div>;
		},

		getInitialState: function() {
			return { text: "" };
		},

		onStateChange: function(changes, next) {
			var connection, text;

			if (changes.app && "connectionStatus" in changes.app) {
			    connection = store.get("app", "connectionStatus");

			    if (connection === "offline") {
			    	text = "You're offline!";
			    } else if (connection === "connecting") {
			    	text = "Connecting...";
			    } else {
			    	text = "";
			    }

				this.setState({ text: text });
			}

			next();
		},

		componentDidMount: function() {
			core.on("statechange", this.onStateChange, 500);
		},

		componentWillUnmount: function() {
			core.off("statechange", this.onStateChange);
		}
	});

	return ConnectionStatus;
};
