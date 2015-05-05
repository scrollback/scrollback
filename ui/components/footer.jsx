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
						<div className="footer-inner">
							<div className="row">
								<div className="col large-4 medium-4 small-12">
									<h5>Contact us</h5>
									 <ul>
										 <li>Scrollback is a product of Askabt.</li>
										 <li>#05-16, 71 Ayer Rajah Crescent,</li>
										 <li>Tel - +91-98451 68036,</li>
										 <li>Mail - evans@scrollback.io</li>
									 </ul>
								</div>

								<div className="col large-4 medium-4 small-12">
									<ul>
										<li>
											<a href="http://web.scrollback.io/about/" target="_blank">About Us</a>
										</li>
										<li>
											<a href="http://web.scrollback.io/careers/" target="_blank">We are Hiring</a>
										</li>
										<li>
											<a href="http://web.scrollback.io/privacy-policy/" target="_blank">Privacy Policy</a>
										</li>
										<li>
											<a href="http://blog.scrollback.io/" target="_blank">Blog</a>
										</li>
										<li>
											<a className="footer-playstore" href="https://play.google.com/store/apps/details?id=io.scrollback.app" target="_blank">
												<img src="/s/assets/footer/google.png" />
											</a>
										</li>
									 </ul>
								</div>

								<div className="col large-4 medium-4 small-12">
									<h5>Connect with us on</h5>
									<p className="footer-social">
										<a href="https://www.facebook.com/scrollback" target="_blank" >
											<img src="/s/assets/footer/facebook.png"  ></img>
										</a>
										<a href="https://twitter.com/Scrollbackio" target="_blank" >
											<img src="/s/assets/footer/twitter.png"  ></img>
										</a>
										<a href="https://www.linkedin.com/company/scrollback" target="_blank" >
											<img src="/s/assets/footer/linkedin.png" ></img>
										</a>
										<a href="https://github.com/scrollback/scrollback" target="_blank" s>
											<img  src="/s/assets/footer/github.png"  ></img>
										</a>
									</p>
								</div>
							</div>
						</div>
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
