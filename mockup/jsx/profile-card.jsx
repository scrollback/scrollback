/* jshint browser: true */

module.exports = function(core, config, state) {
	var React = require("react"),
		ProfileCard,
		profilecard = document.getElementById("js-profile-card");

	ProfileCard = React.createClass({
		render: function() {
			return (
			    <div className="profile-card">
		            <a className="profile-scrollback-logo"></a>
		            <img className="profile-avatar js-user-avatar" alt="satya164" src={this.props.user.picture} />
		            <div className="profile-details">
		                <h3 className="profile-username js-user-nick">{this.props.user.id}</h3>
		                <p className="profile-bio js-user-description">{this.props.user.description}</p>
		            </div>
		            <a className="profile-settings"></a>
		        </div>
	        );
		}
	});

	core.on("statechange", function(changes, next) {
		var user;

		if ("entities" in changes) {
			user = state.get("entities", state.get("userId"));

			React.render(<ProfileCard user={user} />, profilecard);
		}

		next();
	}, 500);

	return ProfileCard;
};
