/* jshint browser: true */

module.exports = function(core, config, store) {
	var React = require("react"),
		Banner = require("./banner.jsx")(core, config, store),
		AppbarPrimary = require("./appbar-primary.jsx")(core, config, store),
		AppbarSecondary = require("./appbar-secondary.jsx")(core, config, store),
		CallToActionBar = require("./calltoactionbar.jsx")(core, config, store),
		SidebarLeft = require("./sidebar-left.jsx")(core, config, store),
		SidebarRight = require("./sidebar-right.jsx")(core, config, store),
		ChatArea = require("./chat-area.jsx")(core, config, store),
		RoomList = require("./room-list.jsx")(core, config, store),
		ThreadList = require("./thread-list.jsx")(core, config, store),
		Client,
		clientEl = document.getElementById("app-client");

	Client = React.createClass({
		createRoom: function() {
			core.emit("setstate", {
				nav: {
					dialog: "createroom",
					dialogState: null
				}
			});
		},

		createThread: function() {
			core.emit("setstate", {
				nav: { dialog: "createthread" }
			});
		},

		closeSidebar: function() {
			core.emit("setstate", {
				nav: { view: null }
			});
		},

		render: function() {
			return (
					<div className="app-container">
						<SidebarLeft />

						<main className="main">
							<AppbarPrimary />

							<CallToActionBar />

							<AppbarSecondary />

							<div className="main-content" data-mode="home search room">
								<div className="main-content-inner-wrap">
									<Banner />

									<div className="main-content-inner">
										<RoomList type="feed" />

										<ThreadList type="feed" />
									</div>
								</div>
							</div>

							<ChatArea />

							<a className="fab" data-mode="home" onClick={this.createRoom}><span className="fab-label">Create room</span></a>
							<a className="fab" data-mode="room" onClick={this.createThread}><span className="fab-label">Create discussion</span></a>
						</main>

						<SidebarRight />

						<div className="sidebar-overlay" onClick={this.closeSidebar}></div>

						<div className="progressbar loading"></div>
					</div>
			);

		}
	});

	core.on("statechange", function(changes, next) {
		React.render(<Client />, clientEl);

		next();
	}, 500);

	return Client;
};
