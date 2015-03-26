/* jshint browser: true */

module.exports = function(core, config, store) {
	var React = require("react"),
		AppbarSecondary;

	AppbarSecondary = React.createClass({
		goToRoom: function() {
			core.emit("setstate", { nav: { mode: "room" }});
		},

		render: function() {
			var threadId = store.get("nav", "thread"),
				threadObj = store.get("indexes", "threadsById", threadId),
				title = threadObj ? threadObj.title : threadId ? threadId : "All messages";

			return (
				<div key="appbar-secondary" className="appbar appbar-secondary" data-mode="chat">
					<a className="appbar-icon appbar-icon-back appbar-icon-left" onClick={this.goToRoom}></a>
					<h2 className="appbar-title appbar-title-secondary">{title}</h2>
				</div>
			);
		}
	});

	return AppbarSecondary;
};
