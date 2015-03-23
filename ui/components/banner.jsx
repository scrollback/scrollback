/* jshint browser: true */

var appUtils = require("../../lib/app-utils.js");

module.exports = function(core, config, store) {
	var React = require("react"),
		Banner;

	Banner = React.createClass({
		render: function() {
			var user = store.get("user");

			if (user && store.get("context", "env") !== "android" && (store.get("nav", "mode") === "home" && appUtils.isGuest(user))) {
				return <iframe className="banner" src="http://web.scrollback.io/banner/"></iframe>;
			} else {
				return <div />;
			}

		}
	});

	return Banner;
};
