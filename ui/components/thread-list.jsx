/* jshint browser: true */

module.exports = function(core, config, store) {
	var React = require("react"),
		threadListUtils = require("./thread-list-utils.jsx")(core, config, store),
		ListView = require("./list-view.jsx")(core, config, store),
		ThreadList;

	ThreadList = React.createClass({
		onScroll: threadListUtils.onScroll,

		render: function() {
			var key, nav = store.getNav();
			// Don't show
			if (nav.mode !== "chat") {
				return <div />;
			}
			
			key = 'thread-list-' + nav.room;
			return (<ListView endlesskey={key} sections={threadListUtils.getSections("list")} endless={true} onScroll={this.onScroll} />);
		}
	});

	return ThreadList;
};
