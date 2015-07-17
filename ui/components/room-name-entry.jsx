/* eslint-env es6 */

"use strict";

module.exports = (core, config, store) => {
	const React = require("react"),
		  Suggestions = require("./suggestions.jsx")(core, config, store);

	class RoomNameEntry extends React.Component {
		constructor(props) {
			super(props);

			this.state = { query: null };
		}

		goToRoom(room) {
			if (room) {
				core.emit("setstate", {
					nav: {
						room: room,
						mode: "room",
						view: null,
						thread: null
					}
				});
			}
		}

		onSubmit(e) {
			var entry = React.findDOMNode(this.refs.entry),
				room;

			e.preventDefault();

			if (entry) {
				room = entry.value.toLowerCase();
			} else {
				return;
			}

			this.goToRoom(room);

		}

		onDismissSuggestions() {
			this.setState({ query: null });
		}

		onSelectSuggestions(room) {
			this.setState({ query: null });

			this.goToRoom(room.id);
		}

		onInput(e) {
			this.setState({ query: e.target.value });
		}

		render() {
			return (
				<div {...this.props} className={this.props.className + " room-name-entry"}>
					{this.state.query ?
						<Suggestions
							type="room" position="bottom" max={5}
							query={this.state.query}
							onDismiss={this.onDismissSuggestions.bind(this)}
							onSelect={this.onSelectSuggestions.bind(this)} /> :
						null}

					<form onSubmit={this.onSubmit.bind(this)}>
						<input
							className="linked" type="text" placeholder="Type a room name" ref="entry"
							autofocus onInput={this.onInput.bind(this)} />
					</form>
				</div>
			);
		}
	}

	return RoomNameEntry;
};
