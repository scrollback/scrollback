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

			if (typeof this.props.onSelect === "function") {
				this.props.onSelect(this.state.suggestions[i]);
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
			} else if (e.keyCode === 13 && !(e.altKey || e.shiftKey || e.ctrlKey)) {
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

		getMatchingUsers() {
			let related = store.getRelatedUsers(),
				texts = store.getTexts(store.get("nav", "room"), store.get("nav", "thread"), store.get("nav", "textRange", "time"), -50),
				all = {};

			for (let text of texts) {
				if (text) {
					let user = store.get("entities", text.from);

					if (user) {
						all[user.id] = {
							id: user.id,
							picture: user.picture,
							time: text.time
						};
					} else {
						all[text.from] = {
							id: text.from,
							time: text.time
						};
					}
				}
			}

			for (let user of related) {
				if (all[user.id]) {
					continue;
				}

				all[user.id] = user;
			}

			let users = [];

			for (let user in all) {
				users.push(all[user]);
			}

			return users;
		}

		setSuggestions(query) {
			let suggestions = this.getMatchingUsers().filter(user => user.id && userInfo.getNick(user.id).indexOf(query) === 0).sort((a, b) => {
				if (typeof a.time === "number" && typeof b.time === "number") {
					if (a.time < b.time) {
						return -1;
					} else if (a.time > b.time) {
						return 1;
					} else {
						return 0;
					}
				} else {
					if (typeof a.time !== "number" && typeof b.time === "number") {
						return -1;
					} else if (typeof a.time === "number" && typeof b.time !== "number") {
						return 1;
					} else {
						return 0;
					}
				}
			}).slice(-10);

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
					current.scrollIntoView(true);
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
