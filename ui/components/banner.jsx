/* jshint browser: true */

var appUtils = require("../../lib/app-utils.js");

module.exports = function(core, config, store) {
	var React = require("react"),
		Banner;

	Banner = React.createClass({
		onSubmit: function(e) {
			var roomNameEntry = this.refs.roomNameEntry.getDOMNode(),
				roomName;

			e.preventDefault();

			if (roomNameEntry) {
				roomName = roomNameEntry.value;
			} else {
				return;
			}

			if (roomName) {
				core.emit("setstate", {
					nav: {
						room: roomName,
						mode: "room",
						view: null,
						thread: null
					}
				});
			}

		},

		render: function() {
			var user = store.get("user");

			if (store.get("nav", "mode") === "home") {
				if (user && store.get("context", "env") !== "android" && appUtils.isGuest(user)) {
					return <iframe className="banner banner-iframe" src="https://scrollback.github.io/static/banner.html"></iframe>;
				} else {
					return (
					        <div className="banner banner-form-container">
								<form className="banner-form" onSubmit={this.onSubmit}>
									<input ref="roomNameEntry" className="banner-form-entry linked" type="text" placeholder="Type a room name" autofocus />
									<input className="banner-form-submit linked" type="submit" value="Go" />
								</form>
					        </div>
					        );
				}
			} else {
				return <div />;
			}

		}
	});

	return Banner;
};
