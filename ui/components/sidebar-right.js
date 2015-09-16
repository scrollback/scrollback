"use strict";

module.exports = function(core, config, store) {
	var React = require("react"),
		PeopleList = require("./people-list.js")(core, config, store);

	class SidebarRight extends React.Component {
		render() {
			return (
				<div data-mode="room chat" className="column sidebar sidebar-right">
					<PeopleList />
				</div>
			);

		}
	}

	return SidebarRight;
};
