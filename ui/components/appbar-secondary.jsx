/* jshint browser: true */

module.exports = function(core, config, store) {
	var React = require("react"),
		AppbarSecondary,
		appbarsecondaryEl = document.getElementById("js-appbar-secondary");

	AppbarSecondary = React.createClass({
		goToRoom: function() {
			core.emit("setstate", { nav: { mode: "room" }});
		},

		render: function() {

			return (
		        <div key="appbar-secondary">
		            <a className="appbar-icon appbar-icon-back appbar-icon-left" onClick={this.goToRoom}></a>
		            <h2 className="appbar-title appbar-title-secondary js-thread-title">{this.props.title}</h2>
		        </div>
	        );
		}
	});

	core.on("statechange", function(changes, next) {
		var title;

		if (("nav" in changes && ("thread" in changes.nav || "mode" in changes.nav)) && store.getNav().mode === "chat") {
			title = store.getNav().thread; // TODO: use thread title instead of ID

			React.render(<AppbarSecondary title={title} />, appbarsecondaryEl);
		}

		next();
	}, 500);

	return AppbarSecondary;
};
