/* jshint browser: true */

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
			            <div className="container">
			                <div className="row-footer">
			                    <div className="col large-4 medium-4 small-12" >
			                    <h4 className="h4-footer">CONTACT US</h4>

			        			     <ul className="ul-footer">

			        			     <li className="li-footer">Scrollback is a product of Askabt.</li>
			        			     <li className="li-footer">s#05-16, 71 Ayer Rajah Crescent,</li>
			        			     <li className="li-footer">Tel - +91-98451 68036,</li>
			        			     <li className="li-footer">Mail - evans@scrollback.io</li>
			        			     </ul>
			                    </div>
			                    <div className="col large-4 medium-4 small-12">
			                    <ul className="ul-footer">
			                        <li className="li-footer">
			                            <a className="a-footer" href="http://web.scrollback.io/about/" target="_blank">About Us</a>
			                        </li>
			                        <li className="li-footer">
			                            <a className="a-footer" href="http://web.scrollback.io/careers/"  target="_blank">We are Hiring</a>
			                        </li>
			                        <li className="li-footer">
			                            <a className="a-footer" href="http://web.scrollback.io/privacy-policy/" target="_blank" >Privacy Policy</a>
			                        </li>
			                        <li className="li-footer">
			                            <a className="a-footer" href="http://blog.scrollback.io/" target="_blank" >Blog</a>
			                        </li>
			                        <li className="li-footer">
			                            <a className="a-image" href="https://play.google.com/store/apps/details?id=io.scrollback.app" target="_blank">
			                                <img className="google-link" src="/s/pictures/footer/google.png" width="40%" />
			                            </a>
			                        </li>
			                     </ul>
			                    </div>

			                <div className="col large-4 medium-4 small-12">
			                    <h4 className="h4-footer"> Connect with us on</h4>
			                    <p>
			                        <a className="a-image" href="https://www.facebook.com/scrollback" target="_blank" >
			                            <img src="/s/pictures/footer/facebook.png" height="40px" width="40px" ></img>
			                        </a>
			                        <a className="a-image" href="https://twitter.com/Scrollbackio" target="_blank" >
			                            <img src="/s/pictures/footer/twitter.png" height="40px" width="40px" ></img>
			                        </a>
			                        <a className="a-image" href="https://www.linkedin.com/company/scrollback" target="_blank" >
			                            <img src="/s/pictures/footer/linkedin.png" height="40px" width="40px"></img>
			                        </a>
			                        <a className="a-image" href="https://github.com/scrollback/scrollback" target="_blank" s>
			                            <img  src="/s/pictures/footer/github.png" height="40px" width="40px" ></img>
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
				this.setState({ show: (store.get("nav", "mode") === "home") });
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
