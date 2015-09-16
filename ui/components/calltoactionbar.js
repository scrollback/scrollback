/* eslint-env browser */

"use strict";

var showMenu = require("../utils/show-menu.js");

module.exports = function(core, config, store) {
	var React = require("react");

	class CallToActionBar extends React.Component {
		constructor(props, context) {
			super(props, context);
			this.followRoom = this.followRoom.bind(this);
			this.hideSelf = this.hideSelf.bind(this);
			this.installApp = this.installApp.bind(this);
			this.onStateChange = this.onStateChange.bind(this);
			this.showUserMenu = this.showUserMenu.bind(this);

			this.state = {
				cta: {
					text: "",
					label: "",
					action: null
				}
			};
		}

		hideSelf() {
			core.emit("setstate", {
				app: { dismissedCtas: [ store.get("app", "cta") ] }
			});
		}

		showUserMenu(e) {
			core.emit("user-menu", {
				origin: e.currentTarget,
				buttons: {},
				items: {}
			}, function(err, menu) {
				showMenu("user-menu", menu);
			});
		}

		followRoom() {
			var room = store.get("nav", "room");

			core.emit("join-up",  {
				to: room,
				room: room
			});
		}

		installApp() {
			window.open("https://play.google.com/store/apps/details?id=io.scrollback.app", "_blank");

			this.hideSelf();
		}

		render() {
			if (this.state.cta && this.state.cta.action) {
				return (
					<div className="call-to-action-bar" ref="callToActionBar">
						<p className="call-to-action-bar-info">{this.state.cta.text}</p>
						<a className="call-to-action-bar-close" onClick={this.hideSelf}></a>
						<button className="call-to-action-bar-button info" onClick={this.state.cta.action}>{this.state.cta.label}</button>
					</div>
				);
			} else {
				return <null />;
			}
		}

		onStateChange(changes) {
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

				this.setState({ cta: data[store.get("app", "cta")] });
			}
		}

		componentDidMount() {
			core.on("statechange", this.onStateChange, 500);
		}

		componentWillUnmount() {
			core.off("statechange", this.onStateChange);
		}
	}

	return CallToActionBar;
};
