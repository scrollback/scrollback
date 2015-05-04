/* jshint browser: true */

"use strict";

module.exports = function(core) {
	var React = require("react"),
		ThreadListItem;

	ThreadListItem = React.createClass({
		goToThread: function() {
			core.emit("setstate", {
				nav: {
					thread: this.props.thread.id,
					mode: "chat",
					view: null
				}
			});
		},

		render: function() {
			return (
				<div className="card thread-card" onClick={this.goToThread}>
					<div className="card-header">
						<h3 className="card-header-title">{this.props.thread.title}</h3>
						<span className="card-header-badge notification-badge notification-badge-mention">{this.props.thread.mentions}</span>
						<span className="card-header-badge notification-badge notification-badge-messages">{this.props.thread.messages}</span>
					</div>
				</div>
			);

		}
	});

	return ThreadListItem;
};
