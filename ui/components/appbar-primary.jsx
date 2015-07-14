/* eslint-env es6, browser */
/* global $ */

"use strict";

const showMenu = require("../utils/show-menu.js"),
	  appUtils = require("../../lib/app-utils.js"),
	  getAvatar = require("../../lib/get-avatar.js"),
	  url = require("../../lib/url.js");

module.exports = function(core, config, store) {
	const React = require("react"),
		  Badge = require("./badge.jsx")(core, config, store),
		  NotificationCenter = require("../../notification/notification-center.jsx")(core, config, store),
		  FollowButton = require("./follow-button.jsx")(core, config, store);

	let AppbarPrimary = React.createClass({
		toggleSidebarRight: function() {
			core.emit("setstate", { nav: { view: "sidebar-right" }});
		},

		showJoinStatus: function() {
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
			window.open(url.build({ nav: store.get("nav") }), "_blank");
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
			}, (err, menu) => {
				if (err) {
					return;
				}

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

					<FollowButton data-embed="none" data-role="guest registered follower" data-mode="room chat" data-state="online"
						ref="followButton" className="appbar-icon appbar-icon-follow" />
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
				userObj;

			if ((changes.nav && changes.nav.mode) || changes.user ||
			    (changes.entities && changes.entities[user])) {

				userObj = store.getUser();

				this.setState({
					title: store.getPageTitle(true),
					username: appUtils.formatUserName(user),
					picture: userObj ? getAvatar(userObj.picture, 48) : ""
				});
			}
		},

		onJoin: function(action) {
			if (/^(room|chat)$/.test(store.get("nav", "mode")) && store.get("nav", "room") === action.to &&
				action.transitionType === "request" && action.transitionRole === "follower" action.user && action.user.to === store.get("user")) {
				this.showJoinStatus();
			}
		},

		componentDidMount: function() {
			core.on("statechange", this.onStateChange, 500);
			core.on("join-dn", this.onJoin, 100);
		},

		componentWillUnmount: function() {
			core.off("statechange", this.onStateChange);
			core.off("join-dn", this.onJoin);
		}
	});

	return AppbarPrimary;
};
