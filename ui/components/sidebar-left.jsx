/* jshint browser: true */

module.exports = function(core, config, store) {
	var React = require("react"),
		ProfileCard = require("./profile-card.jsx")(core, config, store),
		RoomList = require("./room-list.jsx")(core, config, store),
		ThreadList = require("./thread-list.jsx")(core, config, store),
		SidebarLeft;

	SidebarLeft = React.createClass({
		goToHome: function() {
			core.emit("setstate", {
				nav: {
					mode: "home",
					view: null
				}
			});
		},

		render: function() {
			return (
				<div className="column sidebar sidebar-left">
					<div className="sidebar-content" data-mode="home">
						<div className="profile">

							<ProfileCard user={store.getUser()} />

							{/*
							<div className="profile-last-seen sidebar-block">
								<span className="profile-last-seen-icon"></span>
								<p>Last seen 2 hours ago</p>
							</div>
							<div className="profile-points sidebar-block">
								<div className="profile-points-block profile-points-block-xp">
									<h3>34</h3>
									<p>xp</p>
								</div>
								<div className="profile-points-block profile-points-block-cookies">
									<h3>34</h3>
									<p>cookies</p>
								</div>
								<div className="profile-points-block profile-points-block-posts">
									<h3>34</h3>
									<p>messages</p>
								</div>
							</div>
							*/}
						</div>
					</div>
					<div className="sidebar-header" data-mode="room chat" onClick={this.goToHome}>
						<img className="sidebar-header-logo" src="/s/img/scrollback-logo.png" />
						<a className="sidebar-header-icon sidebar-header-icon sidebar-header-icon-grid"></a>
					</div>

					<div className="room-list sidebar-content" data-mode="room">
						<RoomList />
					</div>

					<div className="thread-list sidebar-content" data-mode="chat">
						<ThreadList />
					</div>
				</div>
			);

		}
	});

	return SidebarLeft;
};
