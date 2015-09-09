/* eslint-env browser */

"use strict";

module.exports = (core) => {
	const React = require("react");

	class RoomGenralSettings extends React.Component {
		constructor(props) {
			super(props);
		}

		onSave(room) {			
			room.description = this._desc.value || "";
			console.log(room.description)
		}

		componentDidMount() {
			this._desc.value = this.props.description;
			this.saveHandler = this.onSave.bind(this);
			core.on("conf-save", this.saveHandler, 500);
		}

		componentWillUnmount() {
			core.off("conf-save", this.saveHandler);
		}

		render() {
			return (
				<div className="settings-item">
					<div className="settings-label">Description</div>
					<div className="settings-action">
						<textarea ref={c => this._desc = React.findDOMNode(c)} onInput={() => {}}></textarea>
					</div>
				</div>
			);
		}
	}

	RoomGenralSettings.propTypes = {
		description: React.PropTypes.string.isRequired
	};

	core.on("conf-show", (tabs, next) => {

		let room = tabs.room,
			description = (room && room.description) ? room.description : "",
			container = document.createElement("div");
		React.render(<RoomGenralSettings description = {description} />, container);
		tabs.general = {
			text: "General settings",
			html: container
		};
		next();
	}, 900);
};
