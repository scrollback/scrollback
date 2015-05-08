/* jshint esnext: true, browser: true */

"use strict";

module.exports = function(core, config, store) {
	const React = require("react");

	let Badge = React.createClass({
		render: function() {
			return <span className={this.props.className + " badge"}>{this.state.count ? this.state.count : ""}</span>;
		},

		getInitialState: function() {
			return { count: 0 };
		},

		onStateChange: function(changes) {
			if (changes.notifications) {
				let count = store.get("notifications").length;

				this.setState({ count });
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
