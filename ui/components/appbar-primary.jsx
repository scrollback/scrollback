/* eslint-env es6, browser */
/* global $ */

"use strict";

const showMenu = require("../utils/show-menu.js"),
	  appUtils = require("../../lib/app-utils.js"),
	  stringUtils = require("../../lib/string-utils.js"),
	  getAvatar = require("../../lib/get-avatar.js");

module.exports = function(core, config, store) {
	const React = require("react"),
		  Badge = require("./badge.jsx")(core, config, store),
		  NotificationCenter = require("../../notification/notification-center.jsx")(core, config, store);

	let AppbarPrimary = React.createClass({
		toggleSidebarRight: function() {
			core.emit("setstate", { nav: { view: "sidebar-right" }});
		},

		showRequestStatus: function() {
			let popover = document.createElement("div"),
				message = document.createElement("div"),
				content = document.createElement("div"),
				action = document.createElement("a"),
				$popover = $(popover);

			message.textContent = "A request has been sent to follow the room.";

			content.classList.add("popover-content");
			content.appendChild(message);

			action.classList.add("popover-action");
			action.textContent = "Cancel request";

			action.addEventListener("click", () => {
				core.emit("part-up",  { to: store.get("nav", "room") });

				$popover.popover("dismiss");
			}, false);

			popover.appendChild(content);
			popover.appendChild(action);

			$popover.popover({ origin: React.findDOMNode(this.refs.followButton) });
		},

		toggleFollowRoom: function() {
			const room = store.get("nav", "room"),
				  rel = store.getRelation(room);

			if (rel && rel.transitionRole === "follower" && rel.transitionType === "request") {
				this.showRequestStatus();
			} else if (rel && rel.role === "follower") {
				core.emit("part-up",  { to: room });
			} else {
				core.emit("join-up",  { to: room }, () => {
					const roomObj = store.getRoom(room);

					if (roomObj && roomObj.guides && roomObj.guides.authorizer && roomObj.guides.authorizer.openRoom === false) {
						this.showRequestStatus();
					}
				});
			}
		},

		toggleMinimize: function(e) {
			if (e.target.tagName === "A" || e.target.parentNode.tagName === "A" ||
			    (e.target.className && e.target.className.indexOf && e.target.className.indexOf("user-area") > -1)) {
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

		badgeFilter: function(note) {
			return note.score >= 30;
		},

		showNotifications: function(event) {
			let center = document.createElement("div");

			center.className = "menu menu-notifications";

			React.render(<NotificationCenter />, center);

			$(center).popover({
				arrow: false,
				origin: event.currentTarget
			});
		},

		showUserMenu: function(e) {
			core.emit("user-menu", {
				origin: e.currentTarget,
				buttons: {},
				items: {}
			}, (err, menu) => showMenu("user-menu", menu));
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
			const rel = store.getRelation();

			let classNames = "appbar-icon appbar-icon-follow";

			if (rel) {
				if (rel.transitionRole === "follower" && rel.transitionType === "request") {
					classNames += " requested";
				} else if (rel.role === "follower") {
					classNames += " following";
				}
			}

			return (
				<div key="appbar-primary" className="appbar appbar-primary custom-titlebar-bg custom-titlebar-fg" onClick={this.toggleMinimize}>
					<a data-mode="room chat" className="appbar-icon appbar-icon-back appbar-icon-left" onClick={this.goBack}></a>
					<span data-mode="home" className="appbar-logotype appbar-title-logotype" />
					<div data-mode="room chat" className="appbar-title-container">
						<span className="appbar-logotype appbar-logotype-primary" />
						<h1 className="appbar-title appbar-title-primary">{this.state.title}</h1>
					</div>
					<div className="user-area" onClick={this.showUserMenu}>
						<img className="user-area-avatar" alt={this.state.username} src={this.state.picture} />
						<div className="user-area-nick">{this.state.username}</div>
					</div>
					<a className="appbar-bell appbar-icon appbar-icon-alert" onClick={this.showNotifications}>
						<Badge className="appbar-bell-badge" filter={this.badgeFilter} />
					</a>
					<a data-embed="toast canvas" className="appbar-icon appbar-icon-maximize" onClick={this.fullScreen}></a>
					<a data-mode="room chat" className="appbar-icon appbar-icon-people" onClick={this.toggleSidebarRight}></a>
					<a data-embed="none" data-role="user follower" data-mode="room chat" data-state="online"
						ref="followButton" className={classNames} onClick={this.toggleFollowRoom}></a>
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

		onStateChange: function(changes) {
			var user = store.get("user"),
				room = store.get("nav", "room"),
				userObj, threadObj, nav, title;

			if ((changes.nav && changes.nav.mode) || changes.user ||
			    (changes.indexes && changes.indexes.userRooms && changes.indexes.userRooms[room]) ||
			    (changes.entities && changes.entities[user])) {

				nav = store.get("nav");

				switch (nav.mode) {
				case "room":
					title = nav.room;
					break;
				case "chat":
					threadObj = store.get("indexes", "threadsById", nav.thread);

					if (threadObj) {
						title = threadObj.title;
					} else if (nav.thread) {
						title = "";
					} else {
						title = "All messages";
					}

					break;
				case "home":
					title = "My feed";
					break;
				}

				userObj = store.getUser();

				this.setState({
					title: title,
					username: appUtils.formatUserName(user),
					picture: userObj ? getAvatar(userObj.picture, 48) : ""
				});
			}
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
