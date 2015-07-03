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
			let focus = this.state.focus;

			if (e.keyCode === 38 || (e.keyCode === 9 && e.shiftKey)) {
				// Up arrow / Shift + Tab pressed
				e.preventDefault();

				this.setState({ focus: focus - 1 });
			} else if (e.keyCode === 40 || e.keyCode === 9) {
				// Down arrow / Tab pressed
				e.preventDefault();

				this.setState({ focus: focus + 1 });
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
				<ul className="suggestions-list">
						{this.state.suggestions.map((user, i) => {
							return (
								<li
									ref={"suggestion-list-" + i} data-index={i}
									className={"suggestions-list-item" + (this.state.focus === i ? " focus" : "")}
									key={"suggestions-list-" + user.id}
									onClick={this.onClick.bind(this)}>
									<img className="suggestions-list-item-avatar" src={getAvatar(user.picture, 48)} />
									<span className="suggestions-list-item-nick">{userInfo.getNick(user.id)}</span>
									{userInfo.isGuest(user.id) ?
										<span className="suggestions-list-item-info">{user.id}</span>
									: null}
								</li>
								);
						})}
				</ul>
			);
		}

		getMatchingUsers() {
			let all = {};

			if (this.props.smart) {
				let texts = store.getTexts(store.get("nav", "room"), store.get("nav", "thread"), store.get("nav", "textRange", "time"), -30);

				for (let text of texts) {
					if (text) {
						if (all[text.from]) {
							continue;
						}

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
			}

			let related = store.getRelatedUsers();

			for (let user of related) {
				if (all[user.id]) {
					continue;
				}

				all[user.id] = user;
			}

			let current = store.get("user"),
				users = [];

			for (let user in all) {
				if (user === current) {
					continue;
				}

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
			}).slice(this.props.max * -1);

			this.setState({
				suggestions: suggestions,
				focus: suggestions.length - 1
			});

			// If we don't have data for some users, query the server
			if (suggestions.length) {
				let ids = suggestions.filter(user => typeof user.picture === "undefined").map(user => user.id);

				if (ids.length) {
					core.emit("getUsers", { ref: ids }, (err, res) => {
						if (err) {
							return;
						}

						let results = res.results,
							users = this.state.suggestions;

						if (!(users && users.length && results && results.length)) {
							return;
						}

						users = users.slice(0);

						for (let u of results) {
							for (let user of users) {
								if (user.id === u.id && typeof user.picture === "undefined") {
									user.picture === u.picture;
								}
							}
						}

						this.setState({ suggestions: users });
					});
				}
			}

			// If suggestions are less than the max, query the server
			if (suggestions.length < this.props.max && query.length > 0) {
				core.emit("getUsers", { ref: query + "*", limit: this.props.max - suggestions.length }, (err, res) => {
					if (err) {
						return;
					}

					// Check if the query is still the same
					if (query !== this.props.query) {
						return;
					}

					let results = res.results,
						users = this.state.suggestions;

					if (!(users && results && results.length)) {
						return;
					}

					let has = { [store.get("user")]: true }; // Ignore current user

					for (let u of results) {
						for (let user of users) {
							if (user.id === u.id && !has[u.id]) {
								has[u.id] = true;

								break;
							}
						}
					}

					users = users.slice(0);

					for (let u of results) {
						if (has[u.id]) {
							continue;
						}

						users.unshift(u);
					}

					this.setState({
						suggestions: users,
						focus: users.length - 1
					});
				});
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

		componentWillUpdate(nextProps, nextState) {
			let total = nextState.suggestions.length;

			if (nextState.focus < -1) {
				this.setState({ focus: -1 });
			} else if (nextState.focus > total) {
				this.setState({ focus: total });
			}
		}

		componentDidUpdate() {
			let active = React.findDOMNode(this).querySelector(".focus");

			if (active) {
				active.scrollIntoView(true);
			}
		}

		componentWillUnmount() {
			if (this.keyDownListener) {
				document.removeEventListener("keydown", this.keyDownListener);
			}
		}
	}

	Suggestions.defaultProps = {
		max: 5,
		smart: false
	};

	return Suggestions;
};
