/* jshint browser: true */

var showMenu = require("../utils/show-menu.js"),
	appUtils = require("../../lib/app-utils.js");

module.exports = function(core, config, store) {
	var React = require("react"),
		ProfileCard = require("./profile-card.jsx")(core, config, store),
		RoomList = require("./room-list.jsx")(core, config, store),
		ThreadList = require("./thread-list.jsx")(core, config, store),
		SidebarLeft;

	SidebarLeft = React.createClass({
		getInitialState: function() {
			return { buttons: {} };
		},

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

		showUserMenu: function(e) {
			core.emit("user-menu", {
				origin: e.currentTarget,
				buttons: {},
				items: {}
			}, function(err, menu) {
				showMenu("user-menu", menu);
			});
		},

		componentDidMount: function() {
			var self = this;

			core.emit("auth", { buttons: {} }, function(err, auth) {
				self.setState(auth);
			});
		},

		render: function() {
			var items = [],
				buttons = [],
				user;

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

			user = store.get("user");

			if (user && store.get("nav", "mode") === "home") {
				if (appUtils.isGuest(user) && this.state.buttons) {
					for (var button in this.state.buttons) {
						buttons.push(
						           <a  key={"sidebar-signin-button-" + button} className={"sidebar-signin-button button " + button}
										onClick={this.state.buttons[button].action}>
										{this.state.buttons[button].text}
									</a>
						           );
					}

					items.push(
					        <div className="sidebar-block sidebar-block-content" key={"sidebar-signin-buttons"}>
								<h4>Sign in to change username</h4>

								{buttons}
					        </div>
					           );
				} else {
					items.push(
					           <div className="sidebar-block sidebar-block-item" key="sidebar-account-settings" onClick={this.goToSettings}>
									<div className="sidebar-icon sidebar-icon-settings"></div>
									<div className="sidebar-label">Account settings</div>
					           </div>
					           );
				}
			}

			return (
				<div className="column sidebar sidebar-left">
					<div className="sidebar-content">
						<div className="profile" data-mode="home">

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

						<div className="sidebar-header" data-mode="room chat">
							<img className="sidebar-header-logo" src="/s/img/scrollback-logo-white.png" />
						</div>

						{items}

						<div className="room-list" data-mode="room">
							<RoomList />
						</div>

						<div className="thread-list" data-mode="chat">
							<ThreadList />
						</div>
					</div>
				</div>
			);

		}
	});

	return SidebarLeft;
};
