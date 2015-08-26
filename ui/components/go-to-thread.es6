/* eslint-env es6 */

"use strict";

module.exports = (core, config, store) => {
	const React = require("react");

	class GoToThread extends React.Component {
		constructor(props) {
			super(props);

			this.state = { currentText: store.get("indexes", "textsById", store.get("app", "currentText")) };
		}

		goToThread() {
			core.emit("setstate", {
				nav: { thread: this.state.currentText.thread }
			});
		}

		render() {
			if (this.state.currentText && this.state.currentText.thread) {
				return (
					<div className="go-to-thread">
						<button className="info" onClick={this.goToThread.bind(this)}>Go to discussion to reply</button>
					</div>
					);
			}

			return <null />;
		}

		onStateChange(changes) {
			if (changes.app && "currentText" in changes.app) {
				this.setState({ currentText: store.get("indexes", "textsById", store.get("app", "currentText")) });
			}
		}

		componentDidMount() {
			this.stateChangeHandler = this.onStateChange.bind(this);

			core.on("statechange", this.stateChangeHandler, 100);
		}

		componentWillUnmount() {
			core.off("statechange", this.stateChangeHandler);
		}
	}

	return GoToThread;
};
