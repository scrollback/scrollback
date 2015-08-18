/* eslint-env browser */

"use strict";

module.exports = (core, config, store) => {
	const React = require("react"),
		  ToggleGroup = require("../ui/components/toggle-group.jsx")(core, config, store),
		  ToggleSwitch = require("../ui/components/toggle-switch.jsx")(core, config, store);

	class EmailConfig extends React.Component {
		constructor(props) {
			super(props);
		}

		render() {
			let frequencyItems = [
					{ value: "daily", label: "Daily" },
					{ value: "never", label: "Never" }
				];

			return (
				<div>
					<div className="settings-item">
						<div className="settings-label">Mention notifications via email</div>
						<div className="settings-action">
							<ToggleSwitch ref="notifications" checked={this.props.notifications} />
						</div>
					</div>
					<div className="settings-item">
						<div className="settings-label">Email digest frequency</div>
						<div className="settings-action">
							<ToggleGroup ref="frequency" className="toggle-group" name="frequency" items={frequencyItems} value={this.props.frequency} />
						</div>
					</div>
				</div>
			);
		}

		onSave(user) {
			user.params.email = {
				frequency: this.refs.frequency.value,
				notifications: this.refs.notifications.checked
			};
		}

		componentDidMount() {
			this.saveHandler = this.onSave.bind(this);

			core.on("pref-save", this.saveHandler, 100);
		}

		componentWillUnmount() {
			core.off("pref-save", this.saveHandler);
		}
	}

	EmailConfig.propTypes = {
		frequency: React.PropTypes.string.isRequired,
		notifications: React.PropTypes.bool.isRequired
	};

	core.on("pref-show", tabs => {
		let params = tabs.user.params,
			container = document.createElement("div"),
			frequency = (params && params.email && params.email.frequency) ? params.email.frequency : "daily",
			notifications = (params && params.email && typeof params.email.notifications === "boolean") ? params.email.notifications : true;

		React.render(<EmailConfig frequency={frequency} notifications={notifications} />, container);

		tabs.email = {
			text: "Email",
			html: container
		};
	}, 600);
};

