/* jshint browser: true */

module.exports = function(core, config, store) {
	var React = require("react"),
		ProfileCard,
		profilecardEl = document.getElementById("js-profile-card");

	ProfileCard = React.createClass({
		render: function() {
			return (
			    <div key="profile-card" className="profile-card">
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
		if ("user" in changes || ("entities" in changes && store.get("user") in changes.entities)) {
			React.render(<ProfileCard user={store.getUser()} />, profilecardEl);
		}

		next();
	}, 500);

	return ProfileCard;
};
