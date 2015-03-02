/* jshint browser: true */

module.exports = function(core, config, store) {
	var React = require("react"),
		roomListUtils = require("./room-list-utils.jsx")(core, config, store),
		ListView = require("./list-view.jsx")(core, config, store),
		RoomList;

	RoomList = React.createClass({
		render: function() {
			return (<ListView sections={roomListUtils.getSections("list")} />);
		}
	});

	return RoomList;
};
