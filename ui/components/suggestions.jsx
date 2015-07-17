/* eslint-env es6, browser */

"use strict";

module.exports = function(core, config, store) {
	const React = require("react"),
		  userInfo = require("../../lib/user.js")(core, config, store),
		  getRoomPics = require("../utils/room-pics.js")(core, config, store),
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
				<ul className={"suggestions-list position-" + this.props.position}>
						{this.state.suggestions.map((entity, i) => {
							let name, avatar;

							if (this.props.type === "user") {
								name = userInfo.getNick(entity.id);
								avatar = getAvatar(entity.picture, 48);
							} else {
								name = entity.id;
								avatar = entity.picture || getRoomPics(name).picture;
							}

							return (
								<li
									ref={"suggestion-list-" + i} data-index={i}
									className={"suggestions-list-item" + (this.state.focus === i ? " focus" : "")}
									key={"suggestions-list-" + name}
									onClick={this.onClick.bind(this)}>
									<img className="suggestions-list-item-avatar" src={avatar} />
									<span className="suggestions-list-item-nick">{name}</span>

									{this.props.type === "user" && userInfo.isGuest(entity.id) ?
										<span className="suggestions-list-item-info">guest</span>
									: null}
								</li>
								);
						})}
				</ul>
			);
		}

		getMatchingUsers(query) {
			let all = {};

			if (this.props.smart && /^(chat|room)$/.test(store.get("nav", "mode"))) {
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

			return users.filter(user => user.id && userInfo.getNick(user.id).indexOf(query) === 0).sort((a, b) => {
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
			});
		}

		getMatchingRooms(query) {
			return store.getRelatedRooms().filter(room => room.id && room.id.indexOf(query) === 0);
		}

		getMatchingEntities(query) {
			switch (this.props.type) {
			case "user":
				return this.getMatchingUsers(query);
			case "room":
				return this.getMatchingRooms(query);
			default:
				return [];
			}
		}

		setSuggestions(query) {
			let suggestions = this.getMatchingEntities(query).slice(this.props.max * -1);

			this.setState({
				suggestions: suggestions,
				focus: this.props.position === "top" ? suggestions.length - 1 : 0
			});

			// If we don't have data for some entities, query the server
			if (suggestions.length) {
				let ids = suggestions.filter(entity => !!entity.picture).map(entity => entity.id);

				if (ids.length) {
					core.emit("getEntities", { ref: ids }, (err, res) => {
						if (err) {
							return;
						}

						let results = res.results,
							entities = this.state.suggestions;

						if (!(entities && entities.length && results && results.length)) {
							return;
						}

						entities = entities.slice(0);

						for (let e of results) {
							for (let entity of entities) {
								if (entity.id === e.id && typeof entity.picture === "undefined") {
									entity.picture === e.picture;
								}
							}
						}

						this.setState({ suggestions: entities });
					});
				}
			}

			// If suggestions are less than the max, query the server
			let queryName;

			switch (this.props.type) {
			case "user":
				queryName = "getUsers";
				break;
			case "room":
				queryName = "getRooms";
				break;
			default:
				queryName = "getEntities";
			}

			if (suggestions.length < this.props.max && query.length > 0) {
				core.emit(queryName, {
					ref: query + "*",
					limit: this.props.max - suggestions.length
				}, (err, res) => {
					if (err) {
						return;
					}

					// Check if the query is still the same
					if (query !== this.props.query) {
						return;
					}

					let results = res.results,
						entities = this.state.suggestions;

					if (!(entities && results && results.length)) {
						return;
					}

					let has = this.props.type === "room" ? {} : { [store.get("user")]: true }; // Ignore current user

					for (let e of results) {
						for (let entity of entities) {
							if (entity.id === e.id && !has[e.id]) {
								has[e.id] = true;

								break;
							}
						}
					}

					entities = entities.slice(0);

					for (let e of results) {
						if (has[e.id]) {
							continue;
						}

						entities.unshift(e);
					}

					this.setState({
						suggestions: entities,
						focus: this.props.position === "top" ? entities.length - 1 : 0
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

		componentWillUnmount() {
			if (this.keyDownListener) {
				document.removeEventListener("keydown", this.keyDownListener);
			}
		}
	}

	Suggestions.defaultProps = {
		max: 5,
		smart: false,
		position: "bottom"
	};

	return Suggestions;
};
