/* jshint browser: true */

module.exports = function(core, config, store) {
	var React = require("react"),
		threadListUtils = require("./thread-list-utils.jsx")(core, config, store),
		GridView = require("./grid-view.jsx")(core, config, store),
		ThreadFeed;

	ThreadFeed = React.createClass({
		onScroll: function (key, before, after) {
			var time;

			if (key === "top") {
				time = 1;
			} else if (key === "bottom") {
				time = null;
			} else {
				time = parseInt(key.split("-").pop());
			}

			core.emit("setstate", {
				nav: {
					threadRange: {
						time: time,
						before: before,
						after: after
					}
				}
			});
		},

		render: function() {
			// Don't show
			if (store.getNav().mode !== "room") {
				return <div />;
			}

			return (
					<div className="main-content-threads" data-mode="room">
						<GridView sections={threadListUtils.getSections("card")} endless={true} atTop={true} onScroll={this.onScroll} />
					</div>
			);
		}
	});

	return ThreadFeed;
};
