/* jshint browser: true */

module.exports = function(core, config, state) {
	var React = require("react"),
		ListView = require("./list-view.jsx")(core, config, state),
		PeopleList,
		peoplelist = document.getElementById("js-people-list");

	PeopleList = React.createClass({
		render: function() {
			var people, room, user, items,
				sections = {
					online: [],
					offline: []
				},
				arr = [];

			room = state.get("nav", "room");
			people = state.get("indexes", "roomUsers", state.get("nav", "room"));

			for (var i = 0, l = people.length; i < l; i++) {
				if (sections[people[i].status]) {
					user = state.get("entities", people[i].user);

					sections[people[i].status].push({
						key: room + "-" + user.id,
						elem: (
						    <div className="people-list-item">
						      	<img className="people-list-item-avatar" src={user.picture} />
						      	<span className="people-list-item-nick">{user.id}</span>
						    </div>
						)
					});
				}
			}

			for (var status in sections) {
				items = sections[status];

				if (items.length) {
					arr.push({
						key: "people-" + status,
						header: status.charAt(0).toUpperCase() + status.slice(1) + " (" + items.length + ")",
						items: items
					});
				}
			}

			return (<ListView sections={arr} />);
		}
	});

	core.on("statechange", function(changes, next) {
		if ((changes && changes.indexes && changes.indexes.roomsUsers) || (/^(room|chat)$/).test(state.get("nav", "mode"))) {
			React.render(<PeopleList />, peoplelist);
		}

		next();
	}, 500);

	return PeopleList;
};
