/* jshint browser: true */

"use strict";

module.exports = function(core, config, store) {
	var React = require("react"),
		RoomCard = require("./room-card.jsx")(core, config, store),
		GridView = require("./grid-view.jsx")(core, config, store),
		RoomList;

	RoomList = React.createClass({
		render: function() {
			var titles = {
					visitor: "Recently visited",
					owner: "My rooms",
					moderator: "Moderated rooms",
					follower: "Following",
					featured: "Recommened by Scrollback"
				},
				secs = {}, sections = [],
				relatedRooms;

			// Don't show
			if (!this.state.show) {
				return <div data-mode="none" />;
			}

			for (var t in titles) {
				secs[t] = {
					key: "home-feed-" + t,
					header: titles[t],
					items: []
				};
			}

			relatedRooms = store.getRelatedRooms();

			relatedRooms.forEach(function(room) {
				var role;

				if (typeof room !== "object") {
					return;
				}

				role = room.role || "visitor";

				secs[role].items.push({
					key: "home-room-card-" + role + "-" + room.id,
					elem: <RoomCard roomId={room.id} threadCount="3" />
				});
			});

			store.getFeaturedRooms().filter(function(room) {
				if (typeof room !== "object") {
					return false;
				}

				for (var i = 0, l = relatedRooms.length; i < l; i++) {
					if (room.id === relatedRooms[i].id) {
						return false;
					}
				}

				return true;
			}).forEach(function(room) {
				secs.featured.items.push({
					key: "home-room-card-featured-" + room.id,
					updateTime: room.updateTime,
					elem: <RoomCard roomId={room.id} threadCount="3" />
				});
			});

			for (var role in secs) {
				if (secs[role].items.length) {
					sections.push({
						key: "home-" + secs[role].key,
						header: secs[role].header,
						items: secs[role].items.sort(function(a, b) { return (a.createTime || 0) - (b.createTime || 0); })
					});
				}
			}

			return (
				<div className="main-content-rooms" data-mode="home">
					<GridView sections={sections} />
				</div>
			);
		},

		getInitialState: function() {
			return { show: false };
		},

		onStateChange: function(changes, next) {
			if ((changes.nav && changes.nav.mode) ||
			    (changes.indexes && changes.indexes.userRooms)) {
				this.setState({ show: (store.get("nav", "mode") === "home") });
			}

			next();
		},

		componentDidMount: function() {
			core.on("statechange", this.onStateChange, 500);
		},

		componentWillUnmount: function() {
			core.off("statechange", this.onStateChange);
		}
	});

	return RoomList;
};
