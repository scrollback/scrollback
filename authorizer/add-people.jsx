/* eslint-env es6, browser */

"use strict";

const React = require("react"),
	  Validator = require("../../lib/validator.js");

module.exports = core => {

	core.on("conf-show", conf => {
		class AddPeoplePane extends React.Component {
			constructor(props) {
				super(props);

				this.state.invited = [];
				this.state.invalid = [];
			}

			inviteUsers() {
				let userlist = React.findDOMNode(this.refs.userlist).value;

				userlist.replace(/,\s+/g, ",").split(",").forEach(user => {
					let validator = new Validator(user);

					if (validator.isValid()) {
						core.emit("getUsers", { ref: user }, (err, res) => {
							if (err || (res && res.results && res.results.length)) {
								this.setState(this.getState.invalid.push(user));
							} else {
								core.emit("admit-up", {
									to: conf.room.id,
									ref: user,
									role: "follower"
								}), () =>  this.setState(this.getState.invited.push(user));
							}
						});
					}
				});
			}

			render() {
				return (
				        <div className="settings-page-content-pane">
					        <h3>Invite people to follow {conf.room.id}</h3>
					        <p>Enter usernames separated by comma.</p>
					        <textarea ref="userlist" className="block wide" />
					        {this.state.invited.length ? <div className="tip success">Invitation sent to users: {this.state.invited.join(", ")}</div> : null}
					        {this.state.invalid.length ? <div className="tip error">The usernames {this.state.invalid.join(", ")} are invalid.</div> : null}
					        <a className="button" onClick={this.inviteUsers.bind(this)}>Invite</a>
					    </div>
				        );
			}
		}

		let container = document.createElement("div");

		container.className = "settings-page-content";

		React.render(<AddPeoplePane />, container);

		conf.addpeople = {
			html: container,
			text: "Add people"
		};
	}, 700);
};
