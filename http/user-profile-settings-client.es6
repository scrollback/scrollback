/* eslint-env browser */

"use strict";

module.exports = (core) => {
	const React = require("react"),
		  getAvatar = require("../lib/get-avatar.js");

	class ProfileSettings extends React.Component {
		constructor(props) {
			super(props);

			this.state = { currentPicture: this.props.currentPicture };
		}

		onSave(user) {
			user.picture = this.state.currentPicture;
			user.description = this._desc.value;
		}

		componentDidMount() {
			this._desc.value = this.props.description;

			this.saveHandler = this.onSave.bind(this);

			core.on("pref-save", this.saveHandler, 500);
		}

		componentWillUnmount() {
			core.off("pref-save", this.saveHandler);
		}

		render() {
			return (
				<div>
					<div className="settings-item">
						<div className="settings-label">Picture</div>
						<div className="settings-action">
							<div className="profile-picture-list">
								{this.props.pictures.map(pic => {
									return (
										<div key={pic} className={"profile-user-avatar profile-picture-list" +
										((this.state.currentPicture === pic) ? " current" : "")} onClick={() => this.setState({ currentPicture: pic })}>
											<img src={getAvatar(pic, 80)} url={pic}/>
										</div>
									);
								})}
							</div>
						</div>
					</div>
					<div className="settings-item">
						<div className="settings-label">About me</div>
						<div className="settings-action">
							<textarea ref={c => this._desc = React.findDOMNode(c)} onInput={() => {}}></textarea>
						</div>
					</div>
				</div>
			);
		}
	}

	ProfileSettings.propTypes = {
		pictures: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
		description: React.PropTypes.string.isRequired,
		currentPicture: React.PropTypes.string.isRequired
	};

	core.on("pref-show", tabs => {
		let user = tabs.user,
			container = document.createElement("div"),
			pictures = (user && user.params.pictures && user.params.pictures.length) ? user.params.pictures : [],
			description = (user && user.description) ? user.description : "",
			currentPicture = user.picture || "";

		React.render(<ProfileSettings pictures={pictures} description={description} currentPicture={currentPicture}/>, container);

		tabs.profile = {
			text: "Profile",
			html: container
		};
	}, 800);
};
