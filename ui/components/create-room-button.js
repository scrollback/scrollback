/* eslint-env es6 */

"use strict";

module.exports = core => {
	const React = require("react");

	class CreateRoomButton extends React.Component {
		constructor(props) {
			super(props);
		}

		onClick(e) {
			core.emit("setstate", {
				nav: {
					dialog: "createroom",
					dialogState: {
						prefill: this.props.prefill,
						roomIdentity: this.props.identity
					}
				}
			});

			if (typeof this.props.onClick === "function") {
				this.props.onClick(e);
			}
		}

		render() {
			return (
				<a {...this.props} onClick={this.onClick.bind(this)}>
					{this.props.children}
				</a>
			);
		}
	}

	return CreateRoomButton;
};
