"use strict";

module.exports = function(core, config, store) {
	var React = require("react"),
		RoomCard = require("./room-card.js")(core, config, store),
		GridView = require("./grid-view.js")(core, config, store),
		RoomList;

	RoomList = React.createClass({
		render: function() {
			var titles = {
					visitor: "Recently visited",
					owner: "My rooms",
					moderator: "Moderated rooms",
					follower: "Following",
					featured: "Recommended by Scrollback"
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
				if (typeof room !== "object") {
					return;
				}

				let role = secs[room.role] ? room.role : "visitor";

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

			function sortByTime(a, b) {
				return (a.createTime || 0) - (b.createTime || 0);
			}

			for (var r in secs) {
				if (secs[r].items.length) {
					sections.push({
						key: "home-" + secs[r].key,
						header: secs[r].header,
						items: secs[r].items.sort(sortByTime)
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

		onStateChange: function(changes) {
			if ((changes.nav && changes.nav.mode) ||
			    (changes.indexes && changes.indexes.userRooms)) {
				this.setState({ show: (store.get("nav", "mode") === "home") });
			}
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
