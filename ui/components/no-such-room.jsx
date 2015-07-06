/* eslint-env es6 */

"use strict";

module.exports = (core, config, store) => {
	const React = require("react"),
		  CreateRoomButton = require("./create-room-button.jsx")(core, config, store);

	class NoSuchRoom extends React.Component {
		constructor(props) {
			super(props);
		}

		render() {
			let room = store.get("nav", "room"),
				identity, prefill;

			if (room && room.indexOf(":") > -1) {
				identity = room;
				prefill = room.split(":")[1];
			} else {
				prefill = room;
			}

			return (
				<div {...this.props} className={this.props.className + " blankslate-area blankslate-area-gray"}>
					<div className="blankslate-area-inner">
						<h2 className="blankslate-area-title">
							This room does not exist!
						</h2>

						<p className="blankslate-area-message">
							May be create it?
						</p>

						<img className="blankslate-area-image" src="/s/assets/blankslate/private-room.png" />

						<p className="blankslate-area-actions">
							<CreateRoomButton className="button" prefill={prefill} identity={identity}>
								Create room
							</CreateRoomButton>
						</p>
					</div>
				</div>
			);
		}
	}

	return NoSuchRoom;
};
