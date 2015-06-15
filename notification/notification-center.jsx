/* eslint-env es6, browser */

"use strict";

const React = require("react");

module.exports = (core, ...args) => {
	const NotificationCenterItem = require("./notification-center-item.jsx")(core, ...args);

	class NotificationCenter extends React.Component {
		constructor(props) {
			super(props);

			this.state = { notes: props.notes };
		}

		clearAll() {
			core.emit("note-up", { dismissTime: Date.now() });

			this.setState({ notes: [] });
		}

		render() {
			let items = [];

			for (let note of this.state.notes) {
				items.push(<NotificationCenterItem note={note} key={note.ref + "_" + note.noteType} />);
			}

			return (
					<div className="notification-center-wrapper">
						<div className="notification-center">{items}</div>
						<a onClick={this.clearAll.bind(this)} className="notification-center-clear">Clear all</a>
					</div>
					);
		}
	}

	return NotificationCenter;
};
