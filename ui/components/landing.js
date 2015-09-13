"use strict";

var userUtils = require("../../lib/user-utils.js");

module.exports = function(core, config, store) {
	var React = require("react"),
		RoomNameEntry = require("./room-name-entry.js")(core, config, store),
		Landing;

	Landing = React.createClass({
		render: function() {
			if (this.state.showLanding) {
				return (
						<div data-state="online" className="banner banner-landing">
							<div className="banner-landing-content">
								<div className="banner-landing-content-inner">
									<img src="https://scrollback.github.io/static/assets/banner/scrollback-large.png" />
									<p>Where communities hang out</p>

									<RoomNameEntry className="banner-entry banner-landing-entry" />

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
		},

		getInitialState: function() {
			return { showLanding: false };
		},

		onStateChange: function(changes) {
			var mode, user, env;

			if ((changes.nav && changes.nav.mode) ||
			    (changes.context && changes.context.env) || changes.user) {
				mode = store.get("nav", "mode");
				user = store.get("user");
				env = store.get("context", "env");

				this.setState({
					showLanding: !!(mode === "home" && env !== "embed" && env !== "android" && user && userUtils.isGuest(user))
				});
			}
		},

		componentDidMount: function() {
			core.on("statechange", this.onStateChange, 500);
		},

		componentWillUnmount: function() {
			core.off("statechange", this.onStateChange);
		}
	});

	return Landing;
};
