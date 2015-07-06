/* eslint-env es6 */

"use strict";

module.exports = (core, config, store) => {
	const React = require("react"),
		  FollowButton = require("./follow-button.jsx")(core, config, store);

	class PrivateRoom extends React.Component {
		constructor(props) {
			super(props);
		}

		render() {
			return (
				<div {...this.props} className={this.props.className + " blankslate-area blankslate-area-gray"}>
					<div className="blankslate-area-inner">
						<h2 className="blankslate-area-title">
							Y u no follow the room?
						</h2>

						<p className="blankslate-area-message">
							This room is private. Follow the room to access it's content
						</p>

						<img className="blankslate-area-image" src="/s/assets/blankslate/private-room.png" />

						<p className="blankslate-area-actions">
							<FollowButton className="button">
								Follow {store.get("nav", "room")}
							</FollowButton>
						</p>
					</div>
				</div>
			);
		}
	}

	return PrivateRoom;
};
