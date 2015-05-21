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

							<ul className="div1">

								<li className="footer-item" >
								<a href="http://blog.scrollback.io/" target="_blank" >ABOUT US
								</a></li>

								<li className="footer-item" >
								<a href="http://blog.scrollback.io/" target="_blank" >CAREERS
								</a></li>

								<li className="footer-item" >
								<a href="http://blog.scrollback.io/" target="_blank" >PRIVACY
								</a></li>

								<li className="footer-item footer-itemtemp" >
								<a href="http://blog.scrollback.io/" target="_blank">BLOG
								</a></li>

							</ul>

							<ul className="div2">
								<li className="footer-social">
								<a href="https://www.facebook.com/scrollback" target="_blank">
								<img src="/s/assets/footer/facebook.png" >
								</img></a>

								</li>
								<li className="footer-social">
								<a href="https://twitter.com/Scrollbackio" target="_blank">
								<img src="/s/assets/footer/twitter.png" >
								</img></a>
								</li>

								<li className="footer-social">
								<a  href="https://www.linkedin.com/company/scrollback" target="_blank" >
								<img src="/s/assets/footer/linkedin.png" >
								</img></a>
								</li>

								<li className="footer-social"  >
								<a href="https://github.com/scrollback/scrollback" target="_blank" >
								<img src="/s/assets/footer/github.png" >
								</img></a>
								</li>

							</ul>
							<ul className="div3">

								<li className="footer-playstore">
								<a href="https://play.google.com/store/apps/details?id=io.scrollback.app" target="_blank">
								<img className="footer-playstore" src="/s/assets/footer/googleplay.png" ></img>GET THE APP</a>
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
