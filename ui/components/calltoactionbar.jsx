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

			this.hideSelf();
		},

		render: function() {
			if (!this.state.action) {
				return <div data-mode="none" className="call-to-action-bar" />;
			} else {
				return (
					<div className="call-to-action-bar" ref="callToActionBar">
						<p className="call-to-action-bar-info">{this.state.text}</p>
						<a className="call-to-action-bar-close" onClick={this.hideSelf}></a>
						<button className="call-to-action-bar-button info" onClick={this.state.action}>{this.state.label}</button>
					</div>
				);
			}
		},

		getInitialState: function() {
			return {
				text: "",
				label: "",
				action: null
			};
		},

		onStateChange: function(changes, next) {
			var data;

			if (changes.app && "cta" in changes.app) {
				data = {
					signin: {
						text: "Change your username",
						label: "Sign up",
						action: this.showUserMenu
					},

					follow: {
						text: "Stay in touch with " + store.get("nav", "room"),
						label: "Follow",
						action: this.followRoom
					},

					androidapp: {
						text: "Get messages instantly",
						label: "Install app",
						action: this.installApp
					}
				};

				this.setState(data[store.get("app", "cta")] || this.getInitialState());
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

	return CallToActionBar;
};
