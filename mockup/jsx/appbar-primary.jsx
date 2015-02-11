/* jshint browser: true */

module.exports = function(core, config, state) {
	var React = require("react"),
		AppbarPrimary,
		appbarprimary = document.getElementById("js-appbar-primary");

	AppbarPrimary = React.createClass({
		openSidebarLeft: function() {
			core.emit("setstate", { nav: { view: "sidebar-left" }});
		},

		openSidebarRight: function() {
			core.emit("setstate", { nav: { view: "sidebar-right" }});
		},

		followRoom: function() {

		},

		render: function() {
			var user = state.get("entities", state.get("userId"));

			return (
		        <div>
		            <a data-mode="room chat" className="appbar-icon appbar-icon-left appbar-icon-menu" onClick={this.openSidebarLeft}></a>
		            <img data-mode="home" className="appbar-avatar" alt={user.id} src={user.picture} onClick={this.openSidebarLeft} />
		            <h1 className="appbar-title appbar-title-primary js-appbar-title">{this.props.title}</h1>
		            <a className="appbar-icon appbar-icon-more"></a>
		            <a className="appbar-icon appbar-icon-search"></a>
		            <a data-mode="room chat" className="appbar-icon appbar-icon-people" onClick={this.openSidebarRight}></a>
		            <a data-mode="room chat" className="appbar-icon appbar-icon-follow" onClick={this.followRoom}></a>
		        </div>
	        );
		}
	});

	core.on("statechange", function(changes, next) {
		var title;

		if ("nav" in changes && ("room" in changes.nav || "mode" in changes.nav)) {
			switch (state.get("nav", "mode")) {
			case "room":
			case "chat":
			    title = state.get("nav", "room");
			    break;
			case "home":
			    title = "My feed";
			    break;
			}

			React.render(<AppbarPrimary title={title} />, appbarprimary);
		}

		next();
	}, 500);

	return AppbarPrimary;
};
