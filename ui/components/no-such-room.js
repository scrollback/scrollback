"use strict";

module.exports = (core) => {
	const React = require("react");

	class NoSuchRoom extends React.Component {
		constructor(props) {
			super(props);
		}

		goToHome() {
			core.emit("setstate", { nav: { room: null,mode:  "home"}});
		}

		render() {

			return (
				<div {...this.props} className={this.props.className + " blankslate-area blankslate-area-gray"}>
					<div className="blankslate-area-inner">
						<h2 className="blankslate-area-title">
							This room does not exist!
						</h2>

						<img className="blankslate-area-image" src="/s/assets/blankslate/still.png" />

						<p className="blankslate-area-actions">
							<button className="button" onClick={this.goToHome}>
								Go back to home screen
							</button>
						</p>
					</div>
				</div>
			);
		}
	}

	return NoSuchRoom;
};
