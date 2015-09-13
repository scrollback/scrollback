/* eslint-env es6 */

"use strict";

module.exports = (core, config, store) => {
	const React = require("react"),
		Suggestions = require("./suggestions.js")(core, config, store);

	class RoomNameEntry extends React.Component {
		constructor(props) {
			super(props);

			this.state = {
				query: null,
				error: false
			};
		}

		goToRoom(room) {
			if (room) {
				core.emit("setstate", {
					nav: {
						room,
						mode: "room",
						view: null,
						thread: null
					}
				});
			}
		}

		onSubmit(e) {
			this.setState({ error: true });

			e.preventDefault();

		}

		onDismissSuggestions() {
			this.setState({ query: null });
		}

		onSelectSuggestions(room) {
			this.setState({ query: null });

			this.goToRoom(room.id);
		}

		onInput(e) {
			this.setState({
				query: e.target.value.toLowerCase(),
				error: false
			});
		}

		render() {
			return (
				<div {...this.props} className={(this.props.className || "") + " room-name-entry"}>
					{this.state.query ?
						<Suggestions
							type="room" position="bottom" max={5}
							query={this.state.query}
							onDismiss={this.onDismissSuggestions.bind(this)}
							onSelect={this.onSelectSuggestions.bind(this)} /> :
						null}

					<form onSubmit={this.onSubmit.bind(this)}>
						<input
							className={"linked" + (this.state.error ? " error" : "")} type="text" placeholder="Type a room name" ref="entry"
							autoFocus onInput={this.onInput.bind(this)} />
					</form>
				</div>
			);
		}
	}

	RoomNameEntry.propTypes = {
		className: React.PropTypes.string
	};

	return RoomNameEntry;
};
