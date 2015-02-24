/* jshint browser: true */

module.exports = function(core, config, store) {
	var React = require("react"),
		AppbarPrimary,
		appbarprimary = document.getElementById("js-appbar-primary");

	AppbarPrimary = React.createClass({
		toggleSidebarLeft: function() {
			core.emit("setstate", { nav: { view: "sidebar-left" }});
		},

		toggleSidebarRight: function() {
			core.emit("setstate", { nav: { view: "sidebar-right" }});
		},

		toggleFollowRoom: function() {
			var room= store.getNav().room,
				relation = store.getRelation(room);

			if (relation && relation.role === "follower") {
				core.emit("part-up", { room: room });
			} else {
				core.emit("join-up", { room: room });
			}
		},

		render: function() {
			var user = store.getUser(),
				nav = store.getNav(),
				relation = store.getRelation(),
				title, following;

			switch (nav.mode) {
			case "room":
			case "chat":
			    title = nav.room;
			    break;
			case "home":
			    title = "My feed";
			    break;
			}

			following = (relation && relation.role === "follower") ? "following" : "";

			return (
		        <div key="appbar-primary">
		            <a data-mode="room chat" className="appbar-icon appbar-icon-left appbar-icon-menu" onClick={this.toggleSidebarLeft}></a>
		            <img data-mode="home" className="appbar-avatar" alt={user.id} src={user.picture} onClick={this.toggleSidebarLeft} />
		            <h1 className="appbar-title appbar-title-primary js-appbar-title">{title}</h1>
		            <a className="appbar-icon appbar-icon-more"></a>
		            <a data-mode="room chat" className="appbar-icon appbar-icon-people" onClick={this.toggleSidebarRight}></a>
		            <a data-role="user follower" data-mode="room chat" className="appbar-icon appbar-icon-follow {following}" onClick={this.toggleFollowRoom}></a>
		        </div>
	        );
		}
	});

	core.on("statechange", function(changes, next) {
		if ("nav" in changes && ("room" in changes.nav || "mode" in changes.nav) ||
		    "user" in changes || ("entities" in changes && store.get("user") in changes.entities)) {
			React.render(<AppbarPrimary />, appbarprimary);
		}

		next();
	}, 500);

	return AppbarPrimary;
};
