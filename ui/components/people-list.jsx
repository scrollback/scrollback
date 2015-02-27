/* jshint browser: true */

var getAvatar = require("../../lib/get-avatar.js");

module.exports = function(core, config, store) {
	var React = require("react"),
		ListView = require("./list-view.jsx")(core, config, store),
		PeopleList,
		peoplelistEl = document.getElementById("js-people-list");

	function getPeople(query) {
		var people, room, user, items,
			sections = {
				online: [],
				offline: []
			},
			arr = [];

		room = store.getRoom();
		people = store.getRelatedUsers();

		for (var i = 0, l = people.length; i < l; i++) {
			if (sections[people[i].status]) {
				user = store.get("entities", people[i].user);

				if ((new RegExp(query)).test(user.id)) {
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
					header: status.charAt(0).toUpperCase() + status.slice(1) + " (" + i + ")",
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
					<div className="people-list sidebar-content">
						<div className="searchbar">
							<input type="search" className="searchbar-input" placeholder="Find people" required="true"
								   value={this.state.query} onChange={this.onChange} />
							<span className="searchbar-icon" />
						</div>
						<ListView sections={sections} />
					</div>
					);
		}
	});

	core.on("statechange", function(changes, next) {
		if ((changes.indexes && "roomUsers" in changes.indexes) || (/^(room|chat)$/).test(store.get("nav", "mode"))) {
			React.render(<PeopleList />, peoplelistEl);
		}

		next();
	}, 500);

	return PeopleList;
};
