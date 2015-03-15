/* jshint browser: true */

var showMenu = require("../utils/show-menu.js"),
	appUtils = require("../../lib/app-utils.js");

module.exports = function(core, config, store) {
	var React = require("react"),
		CallToActionBar;

	CallToActionBar = React.createClass({
		getInitialState: function() {
			return { hidden: false };
		},

		hideSelf: function() {
			this.setState({ hidden: true });
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

		followRoom: function() {
			var room = store.getNav().room;

			core.emit("join-up",  {
				to: room,
				room: room
			});
		},

		render: function() {
			var nav = store.getNav(),
				user = store.get("user"),
				rel = store.getRelation(),
				info, label, action;

			if (appUtils.isGuest(user)) {
				info = "Personalize your profile";
				label = "Sign in";
				action = this.showUserMenu;
			} else if (/(room|chat)/.test(nav.mode) && !(rel && /(follower|moderator|owner)/.test(rel.role))) {
				info = "Stay in touch with this room";
				label = "Follow";
				action = this.followRoom;
			}

			if (this.state.hidden || !(info && label && action)) {
				return <div className="call-to-action-bar hidden" />;
			}

			return (
				<div className="call-to-action-bar" ref="callToActionBar">
					<p className="call-to-action-bar-info">{info}</p>
					<a className="call-to-action-bar-close" onClick={this.hideSelf}></a>
					<a className="call-to-action-bar-button button info" onClick={action}>{label}</a>
				</div>
			);
		}
	});

	return CallToActionBar;
};
