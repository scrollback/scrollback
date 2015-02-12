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
			var user = state.getUser(),
				nav = state.getNav(),
				title;

			switch (nav.mode) {
			case "room":
			case "chat":
			    title = nav.room;
			    break;
			case "home":
			    title = "My feed";
			    break;
			}

			return (
		        <div>
		            <a data-mode="room chat" className="appbar-icon appbar-icon-left appbar-icon-menu" onClick={this.openSidebarLeft}></a>
		            <img data-mode="home" className="appbar-avatar" alt={user.id} src={user.picture} onClick={this.openSidebarLeft} />
		            <h1 className="appbar-title appbar-title-primary js-appbar-title">{title}</h1>
		            <a className="appbar-icon appbar-icon-more"></a>
		            <a className="appbar-icon appbar-icon-search"></a>
		            <a data-mode="room chat" className="appbar-icon appbar-icon-people" onClick={this.openSidebarRight}></a>
		            <a data-mode="room chat" className="appbar-icon appbar-icon-follow" onClick={this.followRoom}></a>
		        </div>
	        );
		}
	});

	core.on("statechange", function(changes, next) {
		if ("nav" in changes && ("room" in changes.nav || "mode" in changes.nav) ||
		    "userId" in changes || ("entities" in changes && state.get("userId") in changes.entities)) {
			React.render(<AppbarPrimary />, appbarprimary);
		}

		next();
	}, 500);

	return AppbarPrimary;
};
