/* jshint browser: true */

var appUtils = require("../../lib/app-utils.js");

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

		goToSettings: function() {
			core.emit("setstate", {
				nav: { dialog: "pref" }
			});
		},

		render: function() {
			var items = [];

			if ("embed" in store.get("context")) {
				return <div data-embed="none" />;
			}

			if (store.get("nav", "mode") !== "home") {
				items.push(
				           <div className="sidebar-block sidebar-block-item" key="sidebar-my-feed" onClick={this.goToHome}>
								<div className="sidebar-icon sidebar-icon-grid"></div>
								<div className="sidebar-label">My feed</div>
				           </div>
				           );
			}

			if (store.get("nav", "mode") === "home" && !appUtils.isGuest(store.get("user"))) {
				items.push(
				           <div className="sidebar-block sidebar-block-item" key="sidebar-account-settings" onClick={this.goToSettings}>
								<div className="sidebar-icon sidebar-icon-settings"></div>
								<div className="sidebar-label">Account settings</div>
				           </div>
				           );
			}

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
					<div className="sidebar-header" data-mode="room chat">
						<img className="sidebar-header-logo" src="/s/img/scrollback-logo-white.png" />
					</div>

					{items}

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
