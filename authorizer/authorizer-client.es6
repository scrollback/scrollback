
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
				readLevelItems: [
					{ value: "guest", label: "Anyone" },
					{ value: "registered", label: "Logged in" },
					{ value: "follower", label: "Followers"}
				],
				writeLevelItems: [
					{ value: "guest", label: "Anyone" },
					{ value: "registered", label: "Logged in" },
					{ value: "follower", label: "Followers"}
				]
			};
		}

		onReadLevelUpdate(value) {
			
			if (value === "guest") {
				this.setState({writeLevelItems: [
					{ value: "guest", label: "Anyone"},
					{ value: "registered", label: "Logged in"},
					{ value: "follower", label: "Followers"}
				]});
			}
			else if (value === "registered") {
				this.setState({writeLevelItems: [
					{ value: "guest", label: "Anyone", disabled: true},
					{ value: "registered", label: "Logged in"},
					{ value: "follower", label: "Followers"}
				]});
			} else if (value === "follower") {
				this.setState({writeLevelItems: [
					{ value: "guest", label: "Anyone", disabled: true},
					{ value: "registered", label: "Logged in", disabled: true},
					{ value: "follower", label: "Followers"}
				]});
			}
		}

		render() {

			var div = <div>
					<div className="settings-item">
						<div className="settings-label">Who can read messages?</div>
						<div className="settings-action">
							<ToggleGroup ref="readLevel" className="toggle-group" name="readLevel" items={this.state.readLevelItems}  value={this.props.readLevel} onUpdate={this.onReadLevelUpdate.bind(this)}/>
						</div>
					</div>
					<div className="settings-item">
						<div className="settings-label">Who can write messages?</div>
						<div className="settings-action">
							<ToggleGroup ref="writeLevel" className="toggle-group" name="writeLevel" items={this.state.writeLevelItems}  value={this.props.writeLevel} />
						</div>
					</div>
					<div className="settings-item">
						<div className="settings-label">Anyone can follow without request?</div>
						<div className="settings-action">
							<ToggleSwitch ref="openRoom" checked={this.props.openRoom} />
						</div>
					</div>
				</div>;

			return (div);
		}
		
		onSave(room) {
			room.guides.authorizer = {
				readLevel: this.refs.readLevel.value,
				writeLevel: this.refs.writeLevel.value,
				openRoom: this.refs.openRoom.checked
			};
		}
		
		componentWillMount(){
			this.onReadLevelUpdate(this.props.readLevel);
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
		openRoom: React.PropTypes.bool.isRequired
	};

	core.on("conf-show", tabs => {
		let guides = tabs.room.guides,
			container = document.createElement("div"),
			readLevel = (guides && guides.authorizer && guides.authorizer.readLevel) ? guides.authorizer.readLevel : "guest",
			writeLevel = (guides && guides.authorizer && guides.authorizer.writeLevel) ? guides.authorizer.writeLevel : "guest",
			openRoom = (guides && guides.authorizer && typeof guides.authorizer.openRoom === "boolean") ? guides.authorizer.openRoom : true;
//			console.log(guides.authorizer);
		React.render(<Authorizer readLevel={readLevel} writeLevel={writeLevel} openRoom={openRoom}/>, container);

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
