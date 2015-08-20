/* eslint-env es6 */

"use strict";

module.exports = (core, config, store) => {
	const React = require("react"),
		  ShareDialog = require("./share.es6")(core, config, store),
		  StartThread = require("./start-thread.es6")(core, config, store);

	class CurrentDialog extends React.Component {
		constructor(props) {
			super(props);

			this.state = {
				dialog: store.get("nav", "dialog"),
				dialogState: store.get("nav", "dialogState")
			};
		}

		render() {
			switch (this.state.dialog) {
			case "share":
				return <ShareDialog dialogState={this.state.dialogState} />;
			case "start-thread":
				return <StartThread dialogState={this.state.dialogState} />;
			default:
				return <null />;
			}
		}

		onStateChange(changes) {
			if (changes.nav && ("dialog" in changes.nav || "dialogState" in changes.nav)) {
				this.setState({
					dialog: store.get("nav", "dialog"),
					dialogState: store.get("nav", "dialogState")
				});
			}
		}

		componentDidMount() {
			this.stateChangeHandler = this.onStateChange.bind(this);

			core.on("statechange", this.stateChangeHandler, 100);
		}

		componentWillUnmount() {
			core.off("statechange", this.onStateChange);
		}
	}

	return CurrentDialog;
};
