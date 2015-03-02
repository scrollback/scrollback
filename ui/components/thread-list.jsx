/* jshint browser: true */

module.exports = function(core, config, store) {
	var React = require("react"),
		threadListUtils = require("./thread-list-utils.jsx")(core, config, store),
		ListView = require("./list-view.jsx")(core, config, store),
		ThreadList;

	ThreadList = React.createClass({
		render: function() {
			return (<ListView sections={threadListUtils.getSections("list")} />);
		}
	});

	return ThreadList;
};
