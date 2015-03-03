/* jshint browser: true */

module.exports = function(core, config, store) {
	var React = require("react"),
		threadListUtils = require("./thread-list-utils.jsx")(core, config, store),
		GridView = require("./grid-view.jsx")(core, config, store),
		ThreadFeed;

	ThreadFeed = React.createClass({
		render: function() {
			return (
					<div className="main-content-threads" data-mode="room">
						<GridView sections={threadListUtils.getSections("card")} />
					</div>
			);
		}
	});

	return ThreadFeed;
};
