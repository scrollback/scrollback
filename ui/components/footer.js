"use strict";

module.exports = function(core, config, store) {
	var React = require("react");

	class Footer extends React.Component {
		constructor(props, context) {
			super(props, context);
			this.onStateChange = this.onStateChange.bind(this);
			this.state = { show: false };
		}

		render() {
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
								<a href="https://www.facebook.com/scrollback" target="_blank">Facebook</a>

								</li>
								<li className="footer-social footer-social-twitter">
								<a href="https://twitter.com/Scrollbackio" target="_blank">Twitter</a>
								</li>

								<li className="footer-social footer-social-linkedin">
								<a  href="https://www.linkedin.com/company/scrollback" target="_blank">LinkedIn</a>
								</li>

								<li className="footer-social footer-social-github">
								<a href="https://github.com/scrollback/scrollback" target="_blank">GitHub</a>
								</li>
							</ul>

							<ul className="footer-playstore-container">
								<li className="footer-playstore">
								<a href="https://play.google.com/store/apps/details?id=io.scrollback.app" target="_blank">Get the app</a>
								</li>
							</ul>


						</div>
					</footer>


					);
		}

		onStateChange(changes) {
			if (changes.nav && changes.nav.mode) {
				this.setState({ show: (store.get("nav", "mode") === "home" && store.get("context", "env") !== "android") });
			}
		}

		componentDidMount() {
			core.on("statechange", this.onStateChange, 500);
		}

		componentWillUnmount() {
			core.off("statechange", this.onStateChange);
		}
	}

	return Footer;
};
