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
				     <footer className="footer" >
				     	<div className="footer-inner">

							<ul className="footer-item-container">
								<li className="footer-item" >
								<a href="http://web.scrollback.io/about" target="_blank" >About us
								</a></li>

								<li className="footer-item" >
								<a href="http://web.scrollback.io/careers" target="_blank" >Careers
								</a></li>

								<li className="footer-item" >
								<a href="http://web.scrollback.io/privacy" target="_blank" >Privacy
								</a></li>

								<li className="footer-item" >
								<a href="http://blog.scrollback.io/" target="_blank">Blog
								</a></li>

							</ul>

							<ul className="footer-social-container">
								<li className="footer-social footer-social-facebook">
								<a href="https://www.facebook.com/pages/Hey-Neighbour/855094421226090?fref=ts" target="_blank">Facebook</a>

								</li>
								<li className="footer-social footer-social-twitter">
								<a href="https://twitter.com/neighbour_hey" target="_blank">Twitter</a>
								</li>

							</ul>
							
							<ul className="footer-playstore-container">
								<li className="footer-playstore">
								<a href="https://play.google.com/store/apps/details?id=io.scrollback.neighborhoods" target="_blank">Get the app</a>
								</li>
							</ul>

	
						</div>
    				</footer>
		

					);
		},

		getInitialState: function() {
			return { show: false };
		},

		onStateChange: function(changes) {
			if (changes.nav && changes.nav.mode) {
				this.setState({ show: (store.get("nav", "mode") === "home" && store.get("context", "env") !== "android") });
			}
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
