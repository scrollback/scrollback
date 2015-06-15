/* eslint-env es6, browser */

"use strict";

const React = require("react");

module.exports = (core, config, store) => {
	const NotificationCenterItem = require("./notification-center-item.jsx")(core, config, store);

	class NotificationCenter extends React.Component {
		constructor(props) {
			super(props);

			this.state = { notes: store.get("notes") };
		}

		clearAll() {
			core.emit("note-up", { dismissTime: Date.now() });
		}

		render() {
			let notes = this.state.notes.filter(n => n.score >= 30),
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

		onStateChange(changes) {
			if (changes.notes) {
				this.setState({ notes: store.get("notes") });
			}
		}

		componentDidMount() {
			core.on("statechange", this.onStateChange.bind(this), 500);
		}

		componentWillUnmount() {
			core.off("statechange", this.onStateChange.bind(this));
		}
	}

	return NotificationCenter;
};
