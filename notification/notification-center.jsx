/* eslint-env es6, browser */

"use strict";

const React = require("react");

module.exports = (core, config, store) => {
	const NotificationCenterItem = require("./notification-center-item.jsx")(core, config, store);

	class NotificationCenter extends React.Component {
		constructor(props) {
			super(props);
		}

		clearAll() {
			core.emit("note-up", { dismissTime: Date.now() });

			this.setState({ notes: [] });
		}

		render() {
			let notes = store.get("notes").filter(n => n.score >= 30),
				items = [];

			for (let note of notes) {
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
