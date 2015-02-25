/* jshint browser: true */

module.exports = function(core, config, store) {
	var React = require("react"),
		appUtils = require("../../lib/app-utils.js"),
		showMenu = require("../helpers/show-menu.js"),
		AppbarPrimary,
		appbarprimaryEl = document.getElementById("js-appbar-primary");

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

		showUserMenu: function(e) {
			core.emit("user-menu", {
				origin: e.target,
				buttons: {},
				items: {},
				title: appUtils.isGuest(store.get("user")) ? "Sign in to Scrollback with" : null
			}, function(err, menu) {
				showMenu("user-menu", menu);
			});
		},

		render: function() {
			return (
		        <div key="appbar-primary">
		            <a data-mode="room chat" className="appbar-icon appbar-icon-left appbar-icon-menu" onClick={this.toggleSidebarLeft}></a>
		            <img data-mode="home" className="appbar-avatar" alt={this.props.user.id} src={this.props.user.picture} onClick={this.toggleSidebarLeft} />
		            <h1 className="appbar-title appbar-title-primary js-appbar-title">{this.props.title}</h1>
		            <a className="appbar-icon appbar-icon-more" onClick={this.showUserMenu}></a>
		            <a data-mode="room chat" className="appbar-icon appbar-icon-people" onClick={this.toggleSidebarRight}></a>
		            <a data-role="user follower" data-mode="room chat" className="appbar-icon appbar-icon-follow {this.props.following}" onClick={this.toggleFollowRoom}></a>
		        </div>
	        );
		}
	});

	core.on("statechange", function(changes, next) {
		var user, nav, relation, title, following;

		if ("nav" in changes && ("room" in changes.nav || "mode" in changes.nav) ||
		    "user" in changes || ("entities" in changes && store.get("user") in changes.entities)) {

			user = store.getUser();
			nav = store.getNav();
			relation = store.getRelation();

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

			React.render(<AppbarPrimary title={title} user={user} following={following} />, appbarprimaryEl);
		}

		next();
	}, 500);

	return AppbarPrimary;
};
