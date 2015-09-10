/* eslint-env browser */
/* global $ */

"use strict";

module.exports = (core, config, store) => {
	let React = require("react"),
		ToggleSwitch = require("../ui/components/toggle-switch.jsx")(core, config, store);

	class Notifications extends React.Component {
		constructor(props) {
			super(props);
		}

		onSave(user) {
			user.params.notifications = {
				sound: this.refs.soundNotification.checked,
				desktop: this.refs.desktopNotification.checked
			};
		}

		componentDidMount() {
			this.saveHandler = this.onSave.bind(this);

			core.on("pref-save", this.saveHandler, 100);
		}

		componentWillUnmount() {
			core.off("pref-save", this.saveHandler);
		}

		desktopNotificationUpdate() {
			if (window.Notification.permission === "denied") {
				$("<div>").text("Permission for desktop notifications denied!").alertbar({
					type: "error",
					id: "desktopnotify-err-perm-denied"
				});
			}
		}

		render() {
			return (
				<div>
					<div className="settings-item">
						<div className="settings-label">Sound Notifications</div>
						<div className="settings-action">
							<ToggleSwitch ref="soundNotification" checked={this.props.soundNotification} />
						</div>
					</div>
					<div className="settings-item">
						<div className="settings-label">Desktop Notifications</div>
						<div className="settings-action">
							<ToggleSwitch ref="desktopNotification" checked={this.props.desktopNotification}
				onUpdate={this.desktopNotificationUpdate.bind(this)} />
						</div>
					</div>
				</div>
			);
		}
	}

	Notifications.propTypes = {
		soundNotification: React.PropTypes.bool.isRequired,
		desktopNotification: React.PropTypes.bool.isRequired
	};

	core.on("pref-show", (tabs)=> {
		let params = tabs.user.params,
			container = document.createElement("div"),
			desktopNotification = (params && params.notifications && typeof params.notifications.desktop === "boolean") ? params.notifications.desktop : true,
			soundNotification = (params && params.notifications && typeof params.notifications.sound === "boolean") ? params.notifications.sound : true;

		if (window.Notification.permission === "denied") desktopNotification = false;

		React.render(<Notifications desktopNotification={desktopNotification} soundNotification={soundNotification} />, container);

		tabs.notifications = {
			text: "Notifications",
			html: container
		};
	}, 500);
};
