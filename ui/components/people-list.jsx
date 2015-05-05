/* jshint browser: true */

"use strict";

var getAvatar = require("../../lib/get-avatar.js"),
	appUtils = require("../../lib/app-utils.js"),
	stringUtils = require("../../lib/string-utils.js");

module.exports = function(core, config, store) {
	var React = require("react"),
		ListView = require("./list-view.jsx")(core, config, store),
		PeopleList;

	PeopleList = React.createClass({
		onChange: function(e) {
			this.setState({ query: e.target.value });
		},

		render: function() {
			var people = this.state.people,
				room = store.get("nav", "room"),
				headers = {
					online: [],
					offline: []
				},
				sections = [],
				user, rel, role, items, regex;

			try {
				regex = new RegExp(stringUtils.escapeRegExp(this.state.query));
			} catch (e) {
				return [];
			}

			for (var i = 0, l = people.length; i < l; i++) {
				if (!people[i]) {
					continue;
				}

				people[i].status = people[i].status || "offline";

				if (headers[people[i].status]) {
					user = store.get("entities", people[i].user);
					rel = store.getRelation(room, user.id);

					if (rel.role === "owner") {
						role = "owner";
					} else if (rel.role === "moderator") {
						role = "mod";
					} else {
						role = null;
					}

					if (regex.test(user.id)) {
						headers[people[i].status].push({
							key: "people-list-" + user.id,
							elem: (
								<div className="people-list-item">
									<img className="people-list-item-avatar" src={getAvatar(user.picture, 48)} />
									<span className="people-list-item-nick">{appUtils.formatUserName(user.id)}</span>
									{role ? <span className="people-list-item-role">{role}</span> : ""}
								</div>
							)
						});
					}
				}
			}

			for (var status in headers) {
				items = headers[status];

				if (items.length) {
					sections.push({
						key: "people-list-" + status,
						header: status.charAt(0).toUpperCase() + status.slice(1) + " (" + items.length + ")",
						items: items
					});
				}
			}

			return (
			        <div className="sidebar-people-list">
						<div className="searchbar">
							<input type="search" className="searchbar-input" placeholder="Filter people" required="true"
								   value={this.state.query} onChange={this.onChange} />
							<span className="searchbar-icon" />
						</div>
						<div className="people-list sidebar-content">
							<ListView sections={sections} />
						</div>
					</div>
					);
		},

		getInitialState: function() {
			return {
				people: [],
				query: ""
			};
		},

		onStateChange: function(changes, next) {
			if ((changes.nav && (changes.nav.mode || changes.nav.room)) ||
			    (changes.indexes && changes.indexes.roomUsers)) {

				if (/^(room|chat)$/.test(store.get("nav", "mode"))) {
					this.setState({
						people: store.getRelatedUsers()
					});
				}
			}

			next();
		},

		componentDidMount: function() {
			core.on("statechange", this.onStateChange, 500);
		},

		componentWillUnmount: function() {
			core.off("statechange", this.onStateChange);
		}
	});

	return PeopleList;
};
