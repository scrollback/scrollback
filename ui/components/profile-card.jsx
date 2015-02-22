/* jshint browser: true */

module.exports = function(core, config, state) {
	var React = require("react"),
		ProfileCard,
		profilecard = document.getElementById("js-profile-card");

	ProfileCard = React.createClass({
		render: function() {
			var user = state.getUser();

			return (
			    <div key="profile-card" className="profile-card">
		            <a className="profile-scrollback-logo"></a>
		            <img className="profile-avatar js-user-avatar" alt="satya164" src={user.picture} />
		            <div className="profile-details">
		                <h3 className="profile-username js-user-nick">{user.id}</h3>
		                <p className="profile-bio js-user-description">{user.description}</p>
		            </div>
		            <a className="profile-settings"></a>
		        </div>
	        );
		}
	});

	core.on("statechange", function(changes, next) {
		if ("user" in changes || ("entities" in changes && state.get("user") in changes.entities)) {
			React.render(<ProfileCard />, profilecard);
		}

		next();
	}, 500);

	return ProfileCard;
};
