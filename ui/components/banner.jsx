/* jshint browser: true */

var appUtils = require("../../lib/app-utils.js");

module.exports = function(core, config, store) {
	var React = require("react"),
		Banner;

	Banner = React.createClass({
		render: function() {
			if (store.get("nav", "mode") === "home" && appUtils.isGuest(store.get("user"))) {
				return <iframe className="banner" src="http://web.scrollback.io/banner/"></iframe>;
			} else {
				return <div />;
			}

		}
	});

	return Banner;
};
