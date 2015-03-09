/* jshint browser: true */

var showMenu = require("../utils/show-menu.js"),
	getAvatar = require("../../lib/get-avatar.js");

module.exports = function(core, config, store) {
	var React = require("react"),
		AppbarPrimary;

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
				origin: e.currentTarget,
				buttons: {},
				items: {}
			}, function(err, menu) {
				showMenu("user-menu", menu);
			});
		},

		render: function() {
			var user, nav, relation, title, following;

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

			return (
				<div key="appbar-primary" className="appbar appbar-primary">
					<a data-mode="room chat" className="appbar-icon appbar-icon-left appbar-icon-menu" onClick={this.toggleSidebarLeft}></a>
					<img data-mode="home" className="appbar-avatar" alt={user.id} src={getAvatar(user.picture, 48)} onClick={this.toggleSidebarLeft} />
					<h1 className="appbar-title appbar-title-primary">{title}</h1>
					<a className="appbar-icon appbar-icon-more" onClick={this.showUserMenu}></a>
					<a data-mode="room chat" className="appbar-icon appbar-icon-people" onClick={this.toggleSidebarRight}></a>
					<a data-role="user follower" data-mode="room chat" className="appbar-icon appbar-icon-follow {following}" onClick={this.toggleFollowRoom}></a>
				</div>
			);
		}
	});

	return AppbarPrimary;
};
