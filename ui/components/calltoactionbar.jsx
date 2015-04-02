/* jshint browser: true */

var showMenu = require("../utils/show-menu.js");

module.exports = function(core, config, store) {
	var React = require("react"),
		CallToActionBar;

	CallToActionBar = React.createClass({
		hideSelf: function() {
			var cta = store.get("app", "cta"),
				dismissed = store.get("app", "dismissedCtas") || [];

			dismissed.push(cta);

			core.emit("setstate", {
				app: { dismissedCtas: dismissed }
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

		followRoom: function() {
			var room = store.get("nav", "room");

			core.emit("join-up",  {
				to: room,
				room: room
			});
		},

		installApp: function() {
			window.open("https://play.google.com/store/apps/details?id=io.scrollback.app", "_blank");
		},

		render: function() {
			var data = {
					signin: {
						text: "Personalize your profile",
						label: "Sign in",
						action: this.showUserMenu
					},

					follow: {
						text: "Stay in touch with this room",
						label: "Follow",
						action: this.followRoom
					},

					androidapp: {
						text: "Engage on the go",
						label: "Install app",
						action: this.installApp
					}
				},
				cta;

			cta = data[store.get("app", "cta")];

			if (!cta) {
				return <div className="call-to-action-bar hidden" />;
			}

			return (
				<div className="call-to-action-bar" ref="callToActionBar">
					<p className="call-to-action-bar-info">{cta.text}</p>
					<a className="call-to-action-bar-close" onClick={this.hideSelf}></a>
					<a className="call-to-action-bar-button button info" onClick={cta.action}>{cta.label}</a>
				</div>
			);
		}
	});

	return CallToActionBar;
};
