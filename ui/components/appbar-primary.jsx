/* jshint browser: true */
/* global $ */

"use strict";

var NotificationCenter = require("../utils/notification-center.js"),
	showMenu = require("../utils/show-menu.js"),
	appUtils = require("../../lib/app-utils.js"),
	stringUtils = require("../../lib/string-utils.js"),
	getAvatar = require("../../lib/get-avatar.js");

module.exports = function(core, config, store) {
	var React = require("react"),
		Badge = require("./badge.jsx")(core, config, store),
		AppbarPrimary;

	AppbarPrimary = React.createClass({
		toggleSidebarRight: function() {
			core.emit("setstate", { nav: { view: "sidebar-right" }});
		},

		toggleFollowRoom: function() {
			var room = store.get("nav", "room"),
				rel = store.getRelation(room);

			if (rel && rel.role === "follower") {
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

		toggleMinimize: function(e) {
			if (e.target.tagName === "A" || (e.target.className && e.target.className.indexOf && e.target.className.indexOf("user-area") > -1)) {
				return;
			}

			if (store.get("context", "env") === "embed" && store.get("context", "embed", "form") === "toast") {
				core.emit("setstate", {
					context: {
						embed: { minimize: !store.get("context", "embed", "minimize") }
					}
				});
			}
		},

		fullScreen: function() {
			window.open(stringUtils.stripQueryParam(window.location.href, "embed"), "_blank");
		},

		showNotifications: function(e) {
			var notifications = new NotificationCenter(),
				$overview;

			notifications.add("scrollback", {
				texts: 5,
				mentions: -1
			});

			notifications.add("scrollback", { threads: 4 });

			notifications.add("numix", {
				threads: -1,
				mentions: 5
			});

			notifications.add("gallifrey", {
				texts: 3,
				mentions: 5
			});

			notifications.add("noroom", { mentions: 5 });

			$overview = $(notifications.overview);

			$overview.on("click", "[data-room]", function(e) {
				var $this = $(this),
					room = $this.attr("data-room");

				if (/close/.test(e.target.className)) {
					$this.addClass("out");

					setTimeout(function() {
						var rel;

						$this.remove().removeClass("out");

						rel = {};

						rel[room + "_" + store.get("user")] = {
							lastVisitedAt: Date.now()
						};

						core.emit("setstate", { entities: rel });
					}, 300);
				} else {
					$overview.popover("dismiss");

					core.emit("setstate", {
						nav: {
							room: room,
							mode: "room",
							time: null
						}
					});
				}
			});

			$overview.popover({
				arrow: false,
				origin: e.currentTarget
			});
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

		goBack: function() {
			var mode = store.get("nav", "mode");

			if (mode === "chat") {
				core.emit("setstate", {
					nav: { mode: "room" }
				});
			} else if (mode === "room") {
				core.emit("setstate", {
					nav: { mode: "home" }
				});
			}
		},

		render: function() {
			var classNames = "appbar-icon appbar-icon-follow";

			classNames += this.state.following ? " following" : "";

			return (
				<div key="appbar-primary" className="appbar appbar-primary" onClick={this.toggleMinimize}>
					<a data-mode="room chat" className="appbar-icon appbar-icon-back appbar-icon-left" onClick={this.goBack}></a>
					<img data-mode="home" className="appbar-title-logotype" src="/s/assets/logo/scrollback-logo-white.png" />
					<div data-mode="room chat" className="appbar-title-container">
						<img className="appbar-logotype appbar-logotype-primary" src="/s/assets/logo/scrollback-logo.png" />
						<h1 className="appbar-title appbar-title-primary">{this.state.title}</h1>
					</div>
					<div className="user-area" onClick={this.showUserMenu}>
						<img className="user-area-avatar" alt={this.state.username} src={this.state.picture} />
						<div className="user-area-nick">{this.state.username}</div>
					</div>
					<a className="appbar-bell appbar-icon appbar-icon-alert" onClick={this.showNotifications}>
						<Badge className="appbar-bell-badge" />
					</a>
					<a data-embed="toast canvas" className="appbar-icon appbar-icon-maximize" onClick={this.fullScreen}></a>
					<a data-mode="room chat" className="appbar-icon appbar-icon-people" onClick={this.toggleSidebarRight}></a>
					<a data-embed="none" data-role="user follower" data-mode="room chat" data-state="online" className={classNames} onClick={this.toggleFollowRoom}></a>
				</div>
			);
		},

		getInitialState: function() {
			return {
				title: "",
				username: "",
				picture: "",
				following: false
			};
		},

		onStateChange: function(changes, next) {
			var user = store.get("user"),
				room = store.get("nav", "room"),
				userObj, threadObj, nav, relation, title;

			if ((changes.nav && changes.nav.mode) || changes.user ||
			    (changes.indexes && changes.indexes.userRooms && changes.indexes.userRooms[room]) ||
			    (changes.entities && changes.entities[user])) {

				nav = store.get("nav");
				relation = store.getRelation();

				switch (nav.mode) {
				case "room":
					title = nav.room;
					break;
				case "chat":
					threadObj = store.get("indexes", "threadsById", nav.thread);
					title = threadObj ? threadObj.title : nav.thread ? "" : "All messages";
					break;
				case "home":
					title = "My feed";
					break;
				}

				userObj = store.getUser();

				this.setState({
					title: title,
					username: appUtils.formatUserName(user),
					picture: userObj ? getAvatar(userObj.picture, 48) : "",
					following: !!(relation && relation.role === "follower")
				});
			}

			next();
		},

		componentDidMount: function() {
			core.on("statechange", this.onStateChange, 500);
		},

		componentWillUnmount: function() {
			core.off("statechange", this.onStateChange);
		}
	});

	return AppbarPrimary;
};
