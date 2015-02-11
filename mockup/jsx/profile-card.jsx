/* jshint browser: true */
/* global $, state */

var React = require("react"),
	ProfileCard;

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

module.exports = function(core) {
	var container = $(".js-profile-card").get(0);

	core.on("statechange", function(changes, next) {
		var user;

		if ("entities" in changes) {
			user = state.get("entities", state.get("userId"));

			React.render(<ProfileCard user={user} />, container);
		}

		next();
	}, 500);


	$(".js-follow-room").on("click", function() {
	    $("body").toggleClass("role-follower");
	});
};
