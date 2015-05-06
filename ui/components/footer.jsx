/* jshint browser: true */

"use strict";

module.exports = function(core, config, store) {
	var React = require("react"),
		Footer;

	Footer = React.createClass({

		render: function() {
			if (!this.state.show) {
				return <div data-mode="none" />;
			}

			return (
					<footer className="footer">
						<ul className="footer-section footer-nav">
							<li><a href="">About us</a></li>
							<li><a href="">Privacy</a></li>
							<li><a href="">Careers</a></li>
							<li><a href="">Blog</a></li>
						</ul>
						<ul className="footer-section footer-social">
							<li>
								<a href="" className="footer-social-icon">
									<img src="/s/assets/footer/facebook.png" />
								</a>
							</li>
							<li>
								<a href="" className="footer-social-icon">
									<img src="/s/assets/footer/twitter.png" />
								</a>
							</li>
							<li>
								<a href="" className="footer-social-icon">
									<img src="/s/assets/footer/linkedin.png" />
								</a>
							</li>
							<li>
								<a href="" className="footer-social-icon">
									<img src="/s/assets/footer/github.png" />
								</a>
							</li>
						</ul>
						<a href="" className="footer-section footer-playstore">
							<img src="/s/assets/footer/playstore.png" />
							<span>Get the app</span>
						</a>
					</footer>

					);
		},

		getInitialState: function() {
			return { show: false };
		},

		onStateChange: function(changes, next) {
			if (changes.nav && changes.nav.mode) {
				this.setState({ show: (store.get("nav", "mode") === "home" && store.get("context", "env") !== "android") });
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

	return Footer;
};
