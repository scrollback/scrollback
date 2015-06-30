/* eslint-env es6, browser */

"use strict";

module.exports = function(core, config, store) {
	const React = require("react"),
		  userInfo = require("../../lib/user.js")(core, config, store),
		  getAvatar = require("../../lib/get-avatar.js");

	class Suggestions extends React.Component {
		constructor(props) {
			super(props);

			this.state = {
				suggestions: [],
				focus: -1
			};
		}

		onClick(e) {
			let i = e.currentTarget.getAttribute("data-index");

			if (this.state.focus === i) {
				if (typeof this.props.onSelect === "function") {
					this.props.onSelect(this.state.suggestions[i]);
				}
			} else {
				this.setState({ focus: i });
			}
		}

		onKeyDown(e) {
			let focus = this.state.focus,
				total = this.state.suggestions.length;

			if (focus < -1) {
				focus = -1;
			} else if (focus > this.state.suggestions.length) {
				focus = this.state.focus;
			}

			if (e.keyCode === 38 || (e.keyCode === 9 && e.shiftKey)) {
				// Up arrow / Shift + Tab pressed
				e.preventDefault();

				this.setState({ focus: Math.max(focus - 1, -1) });
			} else if (e.keyCode === 40 || e.keyCode === 9) {
				// Down arrow / Tab pressed
				e.preventDefault();

				this.setState({ focus: Math.min(focus + 1, total) });
			} else if (e.keyCode === 13) {
				// Return key pressed
				if (focus > -1 && typeof this.props.onSelect === "function") {
					e.preventDefault();

					this.props.onSelect(this.state.suggestions[focus]);
				}
			} else if (e.keyCode === 27) {
				// Escape key pressed
				if (typeof this.props.onDismiss === "function") {
					e.preventDefault();

					this.props.onDismiss();
				}
			}
		}

		render() {
			return (
				<ul className="suggestions-list" onKeyDown={this.onKeyDown.bind(this)}>
						{this.state.suggestions.map((user, i) => {
							return (
								<li
									ref={"suggestion-list-" + i}
									className="suggestions-list-item"
									key={"suggestions-list-" + user.id}
									onClick={this.onClick.bind(this)}
									data-index={i}>
									<img className="suggestions-list-item-avatar" src={getAvatar(user.picture, 48)} />
									<span className="suggestions-list-item-nick">{userInfo.getNick(user.id)}</span>
								</li>
								);
						})}
				</ul>
			);
		}

		setSuggestions(query) {
			let users = store.getRelatedUsers() || [],
				suggestions = users.filter(user => user.id.indexOf(query) === 0);

			this.setState({
				suggestions: suggestions,
				focus: suggestions.length - 1
			});
		}

		componentDidUpdate() {
			let node = React.findDOMNode(this),
				active = node.querySelector(".focus");

			if (active) {
				active.classList.remove("focus");
			}

			if (this.state.focus > -1) {
				let current = React.findDOMNode(this.refs["suggestion-list-" + this.state.focus]);

				if (current) {
					current.classList.add("focus");
				}
			}
		}

		componentDidMount() {
			this.keyDownListener = this.onKeyDown.bind(this);

			document.addEventListener("keydown", this.keyDownListener, false);

			this.setSuggestions(this.props.query);
		}

		componentWillReceiveProps(nextProps) {
			this.setSuggestions(nextProps.query);
		}

		componentWillUnmount() {
			if (this.keyDownListener) {
				document.removeEventListener("keydown", this.keyDownListener);
			}
		}
	}

	return Suggestions;
};
