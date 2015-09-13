/* eslint-env browser */

"use strict";

module.exports = function(core, config, store) {
	var React = require("react"),
		Landing = require("./landing.js")(core, config, store),
		Banner = require("./banner.js")(core, config, store),
		AppbarPrimary = require("./appbar-primary.js")(core, config, store),
		CallToActionBar = require("./calltoactionbar.js")(core, config, store),
		ConnectionStatus = require("./connectionstatus.js")(core, config, store),
		SidebarRight = require("./sidebar-right.js")(core, config, store),
		ChatArea = require("./chat-area.js")(core, config, store),
		RoomList = require("./room-list.js")(core, config, store),
		ThreadList = require("./thread-list.js")(core, config, store),
		Footer = require("./footer.js")(core, config, store),
		CreateRoomButton = require("./create-room-button.js")(core, config, store),
		CurrentDialog = require("../dialogs/current-dialog.js")(core, config, store),
		Client;

	Client = React.createClass({
		startThread: function() {
			core.emit("setstate", {
				nav: { dialog: "start-thread" }
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

							<CreateRoomButton className="fab fab-room" data-state="online" data-mode="home">
								<span className="fab-label">Create room</span>
							</CreateRoomButton>

							<a className="fab fab-thread" data-state="online" data-mode="room" data-permission="write" onClick={this.startThread}>
								<span className="fab-label">Start discussion</span>
							</a>
						</main>

						<SidebarRight />

						<CurrentDialog />

						<div data-mode="room chat" className="sidebar-overlay" onClick={this.closeSidebar}></div>
					</div>
			);

		}
	});

	React.render(<Client />, document.getElementById("app-client"));

	return Client;
};
