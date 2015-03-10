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
				core.emit("part-up",  {
					to: room,
					room: room
				});
			} else {
				core.emit("join-up",  {
					to: room,
					room: room
				});
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
			var user, nav, relation, title,
				classNames = "appbar-icon appbar-icon-follow";

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

			classNames += (relation && relation.role === "follower") ? " following" : "";

			return (
				<div key="appbar-primary" className="appbar appbar-primary">
					<a data-mode="room chat" data-embed="none" className="appbar-icon appbar-icon-left appbar-icon-menu" onClick={this.toggleSidebarLeft}></a>
					<img data-mode="home" className="appbar-avatar" alt={user.id} src={getAvatar(user.picture, 48)} onClick={this.toggleSidebarLeft} />
					<img data-embed="toast canvas" className="appbar-logotype appbar-logotype-primary" src="/s/img/scrollback-logo-white.png" />
					<h1 data-embed="none" className="appbar-title appbar-title-primary">{title}</h1>
					<a className="appbar-icon appbar-icon-more" onClick={this.showUserMenu}></a>
					<a data-mode="room chat" className="appbar-icon appbar-icon-people" onClick={this.toggleSidebarRight}></a>
					<a data-role="user follower" data-mode="room chat" className={classNames} onClick={this.toggleFollowRoom}></a>
				</div>
			);
		}
	});

	return AppbarPrimary;
};
