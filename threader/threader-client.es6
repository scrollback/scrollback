/* eslint-env es6, browser */

"use strict";

module.exports = (core, config, store) => {
	const React = require("react"),
		  ToggleSwitch = require("../ui/components/toggle-switch.jsx")(core, config, store);

	class ThreadSettings extends React.Component {
		constructor(props) {
			super(props);

			this.state = {
				groupMessages: this.props.groupMessages,
				showAllMessages: this.props.showAllMessages
			};
		}

		onGroupMessagesUpdate() {
			this.setState({ showAllMessages: this.refs.groupMessages.checked });
		}

		onShowAllMessagesUpdate() {
			this.setState({ showAllMessages: this.refs.showAllMessages.checked });
		}

		render() {
			return (
				<div>
					<div className="settings-item">
						<div className="settings-label">Automatically group messages into discussions</div>
						<div className="settings-action">
							<ToggleSwitch ref="groupMessages" checked={this.state.groupMessages} onUpdate={this.onGroupMessagesUpdate.bind(this)}/>
						</div>
					</div>
					<div className="settings-item">
						<div className="settings-label">Display the "All messages" card</div>
						<div className="settings-action">
							<ToggleSwitch ref="showAllMessages" checked={this.state.showAllMessages} onUpdate={this.onShowAllMessagesUpdate.bind(this)}/>
						</div>
					</div>
				</div>
			);
		}

		onSave(room) {
			room.params.threader = {
				enabled: this.refs.groupMessages.checked,
				showAllMessages: this.refs.showAllMessages.checked
			};
		}

		componentDidMount() {
			this.saveHandler = this.onSave.bind(this);

			core.on("conf-save", this.saveHandler, 100);
		}

		componentWillUnmount() {
			core.off("conf-save", this.saveHandler);
		}
	}

	ThreadSettings.propTypes = {
		groupMessages: React.PropTypes.bool.isRequired,
		showAllMessages: React.PropTypes.bool.isRequired
	};

	core.on("conf-show", tabs => {
		let params = tabs.room.params,
			container = document.createElement("div"),
			groupMessages = params.threader && params.threader.enabled === true ? true : false,
			showAllMessages = params.threader && params.threader.showAllMessages === true ? true : false;

		React.render(<ThreadSettings showAllMessages={showAllMessages} groupMessages={groupMessages} />, container);

		tabs.threader = {
			text: "Discussions",
			html: container
		};
	}, 300);
};

