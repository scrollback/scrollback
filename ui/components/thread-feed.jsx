/* jshint browser: true */

module.exports = function(core, config, store) {
	var React = require("react"),
		threadListUtils = require("./thread-list-utils.jsx")(core, config, store),
		GridView = require("./grid-view.jsx")(core, config, store),
		ThreadFeed;

	ThreadFeed = React.createClass({
		onScroll: function (key, above, below) {
			var time = parseInt(key.split('-').pop());

			core.emit("setstate", {
				nav: {
					threadRange: {
						time: time,
						above: above,
						below: below
					}
				}
			});
		},

		render: function() {
			return (
					<div className="main-content-threads" data-mode="room">
						<GridView sections={threadListUtils.getSections("card")} endless={true} atTop={true} onScroll={this.onScroll} />
					</div>
			);
		}
	});

	return ThreadFeed;
};
