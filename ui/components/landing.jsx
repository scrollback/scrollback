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
			if (this.state.showLanding) {
				return (
						<div className="banner banner-landing">
							<div className="banner-landing-content">
								<div className="banner-landing-content-inner">
									<img src="http://scrollback.github.io/static/assets/banner/scrollback-large.png" />
									<p>Where communities hang out</p>
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
		},

		getInitialState: function() {
			return { showLanding: false };
		},

		onStateChange: function(changes, next) {
			var mode, user, env;

			if ((changes.nav && changes.nav.mode) ||
			    (changes.context && changes.context.env) || changes.user) {
				mode = store.get("nav", "mode");
				user = store.get("user");
				env = store.get("context", "env");

				this.setState({
					showLanding: !!(mode === "home" && user && env !== "android" && appUtils.isGuest(user))
				});
			}

			next();
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
