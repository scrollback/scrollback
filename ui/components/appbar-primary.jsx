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
			var relation = state.getRelation();

			if (relation && relation.role === "member") {
				core.emit("part", {});
			} else {
				core.emit("join", {});
			}
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
		        <div key="appbar-primary">
		            <a data-mode="room chat" className="appbar-icon appbar-icon-left appbar-icon-menu" onClick={this.openSidebarLeft}></a>
		            <img data-mode="home" className="appbar-avatar" alt={user.id} src={user.picture} onClick={this.openSidebarLeft} />
		            <h1 className="appbar-title appbar-title-primary js-appbar-title">{title}</h1>
		            <a data-role="user follower member" className="appbar-icon appbar-icon-more"></a>
		            <a data-mode="room chat" className="appbar-icon appbar-icon-people" onClick={this.openSidebarRight}></a>
		            <a data-mode="room chat" className="appbar-icon appbar-icon-follow" onClick={this.followRoom}></a>
		        </div>
	        );
		}
	});

	core.on("statechange", function(changes, next) {
		if ("nav" in changes && ("room" in changes.nav || "mode" in changes.nav) ||
		    "user" in changes || ("entities" in changes && state.get("user") in changes.entities)) {
			React.render(<AppbarPrimary />, appbarprimary);
		}

		next();
	}, 500);

	return AppbarPrimary;
};
