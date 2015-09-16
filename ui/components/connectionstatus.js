"use strict";

module.exports = function(core, config, store) {
	var React = require("react");

	class ConnectionStatus extends React.Component {
		constructor(props, context) {
			super(props, context);
			this.onStateChange = this.onStateChange.bind(this);
			this.state = { text: "" };
		}

		render() {
			return <div className="connection-status" data-state="offline connecting">{this.state.text}</div>;
		}

		onStateChange(changes) {
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
		}

		componentDidMount() {
			core.on("statechange", this.onStateChange, 500);
		}

		componentWillUnmount() {
			core.off("statechange", this.onStateChange);
		}
	}

	return ConnectionStatus;
};
