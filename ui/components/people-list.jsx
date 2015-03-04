/* jshint browser: true */

var getAvatar = require("../../lib/get-avatar.js"),
	stringUtils = require("../../lib/string-utils.js");

module.exports = function(core, config, store) {
	var React = require("react"),
		ListView = require("./list-view.jsx")(core, config, store),
		PeopleList;

	function getPeople(query) {
		var room = store.getRoom(),
			people = store.getRelatedUsers(),
			sections = {
				online: [],
				offline: []
			},
			arr = [],
			user, items, regex;

		try {
			regex = new RegExp(stringUtils.escapeRegExp(query));
		} catch (e) {
			return [];
		}

		for (var i = 0, l = people.length; i < l; i++) {
			if (sections[people[i].status]) {
				user = store.get("entities", people[i].user);

				if (regex.test(user.id)) {
					sections[people[i].status].push({
						key: "people-list-" + room.id + "-" + user.id,
						elem: (
							<div className="people-list-item">
								<img className="people-list-item-avatar" src={getAvatar(user.picture, 48)} />
								<span className="people-list-item-nick">{user.id}</span>
							</div>
						)
					});
				}
			}
		}

		for (var status in sections) {
			items = sections[status];

			if (items.length) {
				arr.push({
					key: "people-list-" + status,
					header: status.charAt(0).toUpperCase() + status.slice(1) + " (" + items.length + ")",
					items: items
				});
			}
		}

		return arr;
	}

	PeopleList = React.createClass({
		getInitialState: function() {
			return { query: "", };
		},

		onChange: function(e) {
			this.setState({ query: e.target.value });
		},

		render: function() {
			var sections = getPeople(this.state.query);

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
		}
	});

	return PeopleList;
};
