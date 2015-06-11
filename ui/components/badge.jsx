/* jshint esnext: true, browser: true */

"use strict";

module.exports = function(core, config, store) {
	const React = require("react");

	let Badge = React.createClass({
		getCount: function() {
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

			return all.length;
		},

		render: function() {
			return <span className={this.props.className + " badge"}>{this.state.count ? this.state.count : ""}</span>;
		},

		getInitialState: function() {
			return { count: this.getCount() };
		},

		onStateChange: function(changes) {
			if ("notes" in changes) {
				this.setState({ count: this.getCount() });
			}
		},

		componentDidMount: function() {
			core.on("statechange", this.onStateChange, 500);
		},

		componentWillUnmount: function() {
			core.off("statechange", this.onStateChange);
		}
	});

	return Badge;
};
