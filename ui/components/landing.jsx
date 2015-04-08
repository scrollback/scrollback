/* jshint browser: true */

var appUtils = require("../../lib/app-utils.js");

module.exports = function(core, config, store) {
	var React = require("react"),
		Landing;

	Landing = React.createClass({
		onSubmit: function(e) {
			var roomNameEntry = React.findDOMNode(this.refs.roomNameEntry),
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
			var mode = store.get("nav", "mode"),
				user = store.get("user");

			if (mode === "home" && user && store.get("context", "env") !== "android" && appUtils.isGuest(user)) {
				return (
						<div className="banner banner-landing">
							<div className="banner-landing-content">
								<div className="banner-landing-content-inner">
									<img src="http://scrollback.github.io/static/assets/banner/scrollback-large.png" />
									<h2>Where communities hang out</h2>
									<form className="banner-landing-form" onSubmit={this.onSubmit}>
										<input ref="roomNameEntry" type="text" className="linked go-to-room" placeholder="Type a room name" autofocus />
										<input type="submit" className="linked" value="Go" />
									</form>
									<ul className="banner-landing-nav">
										<li><a href="http://blog.scrollback.io" target="_blank">Blog</a></li>
										<li><a href="http://scrollback.github.io/static/features.html" target="_blank">Features</a></li>
									</ul>
								</div>
							</div>
						</div>
						);
			} else {
				return <div data-mode="home" />;
			}
		}
	});

	return Landing;
};
