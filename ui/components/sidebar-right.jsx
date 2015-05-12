/* eslint-env es6, browser */

"use strict";

module.exports = function(core, config, store) {
	var React = require("react"),
		PeopleList = require("./people-list.jsx")(core, config, store),
		SidebarRight;

	SidebarRight = React.createClass({
		render: function() {
			return (
				<div data-mode="room chat" className="column sidebar sidebar-right">
					<div className="sidebar-touch-target sidebar-touch-target-right"></div>

					<PeopleList />
				</div>
			);

		}
	});

	return SidebarRight;
};
