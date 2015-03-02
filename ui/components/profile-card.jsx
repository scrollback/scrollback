/* jshint browser: true */

var getAvatar = require("../../lib/get-avatar.js");

module.exports = function(core, config, store) {
	var React = require("react"),
		ProfileCard;

	ProfileCard = React.createClass({
		render: function() {
			var user = store.getUser();

			return (
				<div key="profile-card" className="profile-card">
					<a className="profile-scrollback-logo"></a>
					<img className="profile-avatar" alt="{this.props.user.id}" src={getAvatar(user.picture, 280)} />
					<div className="profile-details">
						<h3 className="profile-username">{user.id}</h3>
						<p className="profile-bio">{user.description}</p>
					</div>
					<a className="profile-settings"></a>
				</div>
			);
		}
	});

	return ProfileCard;
};
