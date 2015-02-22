/* jshint browser: true */

module.exports = function(core, config, state) {
	var React = require("react"),
		AppbarSecondary,
		appbarsecondary = document.getElementById("js-appbar-secondary");

	AppbarSecondary = React.createClass({
		goToRoom: function() {
			core.emit("setstate", { nav: { mode: "room" }});
		},

		render: function() {
			var title = state.getNav().thread; // TODO: use thread title instead of ID

			return (
		        <div key="appbar-secondary">
		            <a className="appbar-icon appbar-icon-back appbar-icon-left" onClick={this.goToRoom}></a>
		            <h2 className="appbar-title appbar-title-secondary js-thread-title">{title}</h2>
		        </div>
	        );
		}
	});

	core.on("statechange", function(changes, next) {
		if (("nav" in changes && ("thread" in changes.nav || "mode" in changes.nav)) && state.getNav().mode === "chat") {
			React.render(<AppbarSecondary />, appbarsecondary);
		}

		next();
	}, 500);

	return AppbarSecondary;
};
