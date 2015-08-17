
/* eslint-env browser */

"use strict";

module.exports = (core, config, store) => {
	const React = require("react"),
		  handleAuthErrors = require("./handleAuthErrors.es6"),
		  ToggleGroup = require("../ui/components/toggle-group.jsx")(core, config, store),
		  ToggleSwitch = require("../ui/components/toggle-switch.jsx")(core, config, store);

	class Authorizer extends React.Component {
		constructor(props) {
			super(props);
			this.state = {
				readLevel: this.props.readLevel,
				writeLevel: this.props.writeLevel,
				approvedFollow: !this.props.openRoom
			};
		}

		onReadLevelUpdate() {
			this.setState({ readLevel: this.refs.readLevel.value });
		}

		onWriteLevelUpdate() {
			this.setState({ writeLevel: this.refs.writeLevel.value });
		}

		onApprovedFollowUpdate() {
			this.setState({ approvedFollow: this.refs.approvedFollow.checked });
		}

		render() {
			var readLevelItems = [
					{ value: "guest", label: "Anyone" },
					{ value: "registered", label: "Logged in" },
					{ value: "follower", label: "Followers"}
				],
				writeLevelItems = [
					{ value: "guest", label: "Anyone" },
					{ value: "registered", label: "Logged in" },
					{ value: "follower", label: "Followers"}
				];
			
			for (const item of writeLevelItems) {
				if (item.value === this.state.readLevel) break;
				if (this.state.writeLevel === item.value) this.state.writeLevel = this.state.readLevel;
				item.disabled = true;
			}

			var div = <div>
					<div className="settings-item">
						<div className="settings-label">Who can read messages?</div>
						<div className="settings-action">
							<ToggleGroup ref="readLevel" className="toggle-group" name="readLevel" items={readLevelItems}  value={this.state.readLevel} onUpdate={this.onReadLevelUpdate.bind(this)}/>
						</div>
					</div>
					<div className="settings-item">
						<div className="settings-label">Who can write messages?</div>
						<div className="settings-action">
							<ToggleGroup ref="writeLevel" className="toggle-group" name="writeLevel" items={writeLevelItems}  value={this.state.writeLevel} onUpdate={this.onWriteLevelUpdate.bind(this)}/>
						</div>
					</div>
					<div className="settings-item">
						<div className="settings-label">Approval required to follow</div>
						<div className="settings-action">
							<ToggleSwitch ref="approvedFollow" checked={this.state.approvedFollow} onUpdate={this.onApprovedFollowUpdate.bind(this)}/>
						</div>
					</div>
				</div>;

			return (div);
		}

		onSave(room) {
			room.guides.authorizer = {
				readLevel: this.refs.readLevel.value,
				writeLevel: this.refs.writeLevel.value,
				openRoom: !this.refs.approvedFollow.checked
			};
		}

		componentDidMount() {
			this.saveHandler = this.onSave.bind(this);
			core.on("conf-save", this.saveHandler, 500);
		}

		componentWillUnmount() {
			core.off("conf-save", this.saveHandler);
		}
	}

	Authorizer.propTypes = {
		readLevel: React.PropTypes.string.isRequired,
		writeLevel: React.PropTypes.string.isRequired,
		approvedFollow: React.PropTypes.bool.isRequired
	};

	core.on("conf-show", tabs => {
		let guides = tabs.room.guides,
			container = document.createElement("div"),
			readLevel = (guides && guides.authorizer && guides.authorizer.readLevel) ? guides.authorizer.readLevel : "guest",
			writeLevel = (guides && guides.authorizer && guides.authorizer.writeLevel) ? guides.authorizer.writeLevel : "guest",
			openRoom = (guides && guides.authorizer && typeof guides.authorizer.openRoom === "boolean") ? guides.authorizer.openRoom : true;
		
		React.render(<Authorizer readLevel={readLevel} writeLevel={writeLevel} approvedFollow={openRoom}/>, container);

		tabs.authorizer = {
			text: "Permissions",
			html: container
		};
	}, 800);

	core.on("error-dn", error => {
		var errorActions = [ "admit", "expel", "edit", "part", "room", "user" ];

		if (error.message === "ERR_NOT_ALLOWED" && errorActions.indexOf(error.action) > -1) {
			handleAuthErrors(error);
			error.handled = true;
		}
	}, 1000);

};
