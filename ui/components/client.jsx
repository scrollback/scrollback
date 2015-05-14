/* eslint-env es6, browser */

"use strict";

module.exports = function(core, config, store) {
	var React = require("react"),
		Landing = require("./landing.jsx")(core, config, store),
		Banner = require("./banner.jsx")(core, config, store),
		AppbarPrimary = require("./appbar-primary.jsx")(core, config, store),
		CallToActionBar = require("./calltoactionbar.jsx")(core, config, store),
		ConnectionStatus = require("./connectionstatus.jsx")(core, config, store),
		SidebarRight = require("./sidebar-right.jsx")(core, config, store),
		ChatArea = require("./chat-area.jsx")(core, config, store),
		RoomList = require("./room-list.jsx")(core, config, store),
		ThreadList = require("./thread-list.jsx")(core, config, store),
		Footer = require("./footer.jsx")(core, config, store),
		Dialogs = require("../dialogs/all.jsx")(core, config, store),
		Client;

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

						<main className="main">
							<AppbarPrimary />

							<CallToActionBar />

							<ConnectionStatus />

							<div className="main-content" data-mode="home search room">
								<div className="main-content-inner-wrap">

									<Landing />

									<Banner />

									<div className="main-content-inner">
										<RoomList />

										<ThreadList />
									</div>

									<Footer />
								</div>
							</div>

							<ChatArea />

							<button className="fab" data-state="online" data-mode="home" onClick={this.createRoom}>
								<span className="fab-label">Create room</span>
							</button>
							<button className="fab" data-state="online" data-mode="room" onClick={this.createThread}>
								<span className="fab-label">Start discussion</span>
							</button>
						</main>

						<SidebarRight />

						<Dialogs />

						<div data-mode="room chat" className="sidebar-overlay" onClick={this.closeSidebar}></div>

						<div className="progressbar loading"></div>
					</div>
			);

		}
	});

	React.render(<Client />, document.getElementById("app-client"));

	return Client;
};
