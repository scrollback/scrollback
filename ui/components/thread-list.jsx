/* jshint browser: true */

module.exports = function(core, config, store) {
	var React = require("react"),
		threadListUtils = require("./thread-list-utils.jsx")(core, config, store),
		ListView = require("./list-view.jsx")(core, config, store),
		ThreadList;

	ThreadList = React.createClass({
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
			// Don't show
			if (store.getNav().mode !== "chat") {
				return <div />;
			}

			return (<ListView sections={threadListUtils.getSections("list")} endless={true} atTop={true} onScroll={this.onScroll} />);
		}
	});

	return ThreadList;
};
