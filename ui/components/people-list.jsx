/* jshint browser: true */

var getAvatar = require("../../lib/get-avatar.js"),
	appUtils = require("../../lib/app-utils.js"),
	stringUtils = require("../../lib/string-utils.js");

module.exports = function(core, config, store) {
	var React = require("react"),
		ListView = require("./list-view.jsx")(core, config, store),
		PeopleList;

	PeopleList = React.createClass({
		getInitialState: function() {
			return { query: "" };
		},

		onChange: function(e) {
			this.setState({ query: e.target.value });
		},

		render: function() {
			var room = store.getRoom(),
				people = store.getRelatedUsers(),
				headers = {
					online: [],
					offline: []
				},
				sections = [],
				user, items, regex;

			try {
				regex = new RegExp(stringUtils.escapeRegExp(this.state.query));
			} catch (e) {
				return [];
			}

			for (var i = 0, l = people.length; i < l; i++) {
				people[i].status = people[i].status || "offline";

				if (headers[people[i].status]) {
					user = store.get("entities", people[i].user);

					if (regex.test(user.id)) {
						headers[people[i].status].push({
							key: "people-list-" + room.id + "-" + user.id,
							elem: (
								<div className="people-list-item">
									<img className="people-list-item-avatar" src={getAvatar(user.picture, 48)} />
									<span className="people-list-item-nick">{appUtils.formatUserName(user.id)}</span>
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
		}
	});

	return PeopleList;
};
