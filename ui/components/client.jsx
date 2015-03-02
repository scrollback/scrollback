/* jshint browser: true */

module.exports = function(core, config, store) {
	var React = require("react"),
		AppbarPrimary = require("./appbar-primary.jsx")(core, config, store),
		AppbarSecondary = require("./appbar-secondary.jsx")(core, config, store),
		SidebarLeft = require("./sidebar-left.jsx")(core, config, store),
		SidebarRight = require("./sidebar-right.jsx")(core, config, store),
		ChatMessageList = require("./chat-message-list.jsx")(core, config, store),
		Compose = require("./compose.jsx")(core, config, store),
		HomeFeed = require("./home-feed.jsx")(core, config, store),
		ThreadFeed = require("./thread-feed.jsx")(core, config, store),
		Client,
		clientEl = document.getElementById("app-client");

	Client = React.createClass({
		createRoom: function() {
			core.emit("setstate", { nav: { dialog: "createroom" }});
		},

		createThread: function() {
			core.emit("setstate", { nav: { dialog: "createthread" }});
		},

		closeSidebar: function() {
			core.emit("setstate", { nav: { view: null }});
		},

		render: function() {
			return (
			        <div className="app-container">
						<SidebarLeft />

					    <main id="main" className="main">
					        <AppbarPrimary />

					        <AppbarSecondary />

					        <div className="main-content" data-mode="home search room">
					            <div className="main-content-rooms" data-mode="home">
					            	<HomeFeed />
					            </div>

					            <div className="main-content-threads" data-mode="room">
					            	<ThreadFeed />
					            </div>
					        </div>

					        <div className="main-content-chat chat-area" data-mode="chat">
					            <div className="chat-area-messages">
					            	<ChatMessageList />
					            </div>

					            <Compose />
					        </div>

					        <a className="fab" data-mode="home" onClick={this.createRoom}></a>
					        <a className="fab" data-mode="room" onClick={this.createThread}></a>
					    </main>

					    <SidebarRight />

					    <div id="sidebar-overlay" className="sidebar-overlay" onClick={this.closeSidebar}></div>

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
