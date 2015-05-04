/* jshint browser: true */

"use strict";

module.exports = function(core, config, store) {
	var React = require("react"),
		PeopleList = require("./people-list.jsx")(core, config, store),
		SidebarRight;

	SidebarRight = React.createClass({
		render: function() {
			return (
				<div data-mode="room chat" className="column sidebar sidebar-right">
					<PeopleList />
				</div>
			);

		}
	});

	return SidebarRight;
};
