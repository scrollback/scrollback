/* jshint browser: true */

module.exports = function(core, config, store) {
	var React = require("react"),
		threadListUtils = require("./thread-list-utils.jsx")(core, config, store),
		GridView = require("./grid-view.jsx")(core, config, store),
		ThreadFeed;

	ThreadFeed = React.createClass({
		onScroll: threadListUtils.onScroll,

		getCols: function() {
			var container = document.querySelector(".main-content-threads"),
				card = document.querySelector(".main-content-threads .grid-item");

			if (!(container && card)) {
				return 1;
			}

			return (Math.floor(container.offsetWidth / card.offsetWidth) || 1);

		},

		render: function() {
			var sections;

			// Don't show
			if (store.getNav().mode !== "room") {
				return <div />;
			}

			sections = threadListUtils.getSections("card", this.getCols());

			return (
					<div className="main-content-threads" data-mode="room">
						<GridView sections={sections} endless={true} atTop={true} onScroll={this.onScroll} />
					</div>
			);
		}
	});

	return ThreadFeed;
};
