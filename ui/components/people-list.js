"use strict";

module.exports = function(core, config, store) {
	var React = require("react"),
		ListView = require("./list-view.js")(core, config, store),
		PeopleListItem = require("./people-list-item.js")(core, config, store);

	class PeopleList extends React.Component {
		constructor(props, context) {
			super(props, context);
			this.onChange = this.onChange.bind(this);
			this.onStateChange = this.onStateChange.bind(this);

			this.state = {
				people: [],
				query: ""
			};
		}

		onChange(e) {
			this.setState({ query: e.target.value });
		}

		render() {
			var people = this.state.people,
				headers = {
					online: [],
					offline: []
				},
				sections = [],
				user, items;

			for (var i = 0, l = people.length; i < l; i++) {
				if (!people[i]) {
					continue;
				}

				people[i].status = people[i].status || "offline";
				user = store.get("entities", people[i].user);

				if (headers[people[i].status]) {
					if (user && user.id && user.id.indexOf(this.state.query) > -1) {
						headers[people[i].status].push({
							key: "people-list-" + user.id,
							elem: <PeopleListItem user={user} />
						});
					}
				}
			}

			for (var status in headers) {
				items = headers[status];

				if (items.length) {
					sections.push({
						key: "people-list-" + status,
						header: status + " (" + (items.length > 180 ? "180+" : items.length) + ")",
						items: items
					});
				}
			}

			return (
					<div className="sidebar-people-list">
						<div className="searchbar custom-titlebar-bg">
							<input type="search" className="searchbar-input" placeholder="Filter people" required="true"
								   value={this.state.query} onChange={this.onChange} />
							<span className="searchbar-icon" />
						</div>
						<div className="people-list sidebar-content">
							<ListView sections={sections} />
						</div>
					</div>
					);
		}

		onStateChange(changes) {
			if ((changes.nav && (changes.nav.mode || changes.nav.room)) ||
				(changes.indexes && changes.indexes.roomUsers)) {

				if (/^(room|chat)$/.test(store.get("nav", "mode"))) {
					this.setState({
						people: store.getRelatedUsers()
					});
				}
			}
		}

		componentDidMount() {
			core.on("statechange", this.onStateChange, 500);
		}

		componentWillUnmount() {
			core.off("statechange", this.onStateChange);
		}
	}

	return PeopleList;
};
