/* jshint esnext: true, browser: true */

"use strict";

module.exports = function(core, config, store) {
	const React = require("react");

	class Badge extends React.Component {
		constructor(props, context) {
			super(props, context);
			this.onStateChange = this.onStateChange.bind(this);
			this.state = { count: this.getCount() };
		}

		getCount() {
			let all = store.get("notes");

			all = all.filter(n => typeof n.readTime !== "number");

			if (all.length === 0) {
				return all.length;
			}

			if (this.props.type) {
				all = all.filter(n => n.noteType === this.props.type);
			}

			if (typeof this.props.filter === "function") {
				all = all.filter(this.props.filter);
			}

			if (this.props.groupCount) {
				return all.length;
			}

			let count = 0;

			for (let n of all) {
				if (n.count) {
					count += n.count;
				} else {
					count++;
				}
			}

			return count;
		}

		render() {
			return <span className={this.props.className + " badge"}>{this.state.count ? this.state.count : ""}</span>;
		}

		onStateChange(changes) {
			if ("notes" in changes) {
				this.setState({ count: this.getCount() });
			}
		}

		componentDidMount() {
			core.on("statechange", this.onStateChange, 500);
		}

		componentWillUnmount() {
			core.off("statechange", this.onStateChange);
		}
	}

	return Badge;
};
