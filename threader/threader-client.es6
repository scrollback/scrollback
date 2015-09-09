/* eslint-env es6, browser */

"use strict";

module.exports = (core, config, store) => {
	const React = require("react"),
		  ToggleSwitch = require("../ui/components/toggle-switch.jsx")(core, config, store);

	class ThreadSettings extends React.Component {
		constructor(props) {
			super(props);

			this.state = { allMessages: this.props.allMessages };
		}

		onAllMessagesUpdate() {
			this.setState({ allMessages: this.refs.allMessages.checked });
		}

		render() {
			return (
				<div>
					<div className="settings-item">
						<div className="settings-label">Display all messages card</div>
						<div className="settings-action">
							<ToggleSwitch ref="allMessages" checked={this.state.allMessages} onUpdate={this.onAllMessagesUpdate.bind(this)}/>
						</div>
					</div>
				</div>
			);
		}

		onSave(room) {
			room.params.threader = {
				enabled: false,
				showAllMessages: this.refs.allMessages.checked
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
		allMessages: React.PropTypes.bool.isRequired
	};

	core.on("conf-show", tabs => {
		let params = tabs.room.params,
			container = document.createElement("div"),
			allMessages = params.threader && params.threader.showAllMessages === true ? true : false;

		React.render(<ThreadSettings allMessages={allMessages}/>, container);

		tabs.threader = {
			text: "Discussions",
			html: container
		};
	}, 300);
};

