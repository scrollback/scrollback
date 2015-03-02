/* jshint browser: true */

module.exports = function(core, config, store) {
	var React = require("react"),
		PeopleList = require("./people-list.jsx")(core, config, store),
		SidebarRight;

	SidebarRight = React.createClass({
		render: function() {
			return (
				<div data-mode="room chat" id="sidebar-right" className="column sidebar sidebar-right">
				    <div class="sidebar-people-list">
				    	<PeopleList />
				    </div>
				</div>
			);

		}
	});

	return SidebarRight;
};
