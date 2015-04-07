/* jshint browser: true */

module.exports = function(core, config, store) {
	var React = require("react"),
		RoomCard = require("./room-card.jsx")(core, config, store),
		RoomListItem = require("./room-list-item.jsx")(core, config, store),
		ListView = require("./list-view.jsx")(core, config, store),
		GridView = require("./grid-view.jsx")(core, config, store),
		RoomList;

	RoomList = React.createClass({
		render: function() {
			var titles = {
					visitor: "Recently visited",
					owner: "My rooms",
					moderator: "Moderated rooms",
					follower: "Following",
					featured: "Featured rooms"
				},
				secs = {}, sections = [],
				type = this.props.type || "list";

			if (store.get("nav", "mode") !== "home") {
				return <div />;
			}

			for (var t in titles) {
				secs[t] = {
					key: "home-feed-" + t,
					header: titles[t],
					items: []
				};
			}

			store.getRelatedRooms().forEach(function(room) {
				if (typeof room !== "object") {
					return;
				}

				room.role = room.role || "visitor";

				secs[room.role].items.push({
					key: "home-" + type + "-room-card-" + room.role + "-" + room.id,
					elem: (type === "feed") ? <RoomCard roomId={room.id} threadCount="3" /> : <RoomListItem roomId={room.id} />
				});
			});

			store.getFeaturedRooms().forEach(function(room) {
				if (typeof room !== "object") {
					return;
				}

				secs.featured.items.push({
					key: "home-" + type + "-room-card-featured-" + room.id,
					updateTime: room.updateTime,
					elem: (type === "feed") ? <RoomCard roomId={room.id} threadCount="3" /> : <RoomListItem roomId={room.id} />
				});
			});

			for (var role in secs) {
				if (secs[role].items.length) {
					sections.push({
						key: "home-" + type + "-" + secs[role].key + (type ? "-" + type : ""),
						header: secs[role].header,
						items: secs[role].items.sort(function(a, b) { return (a.createTime || 0) - (b.createTime || 0); })
					});
				}
			}

			if (type === "feed") {
				return (
						<div className="main-content-rooms" data-mode="home">
							<GridView sections={sections} />
						</div>
				);
			} else {
				return (<ListView sections={sections} />);
			}
		}
	});

	return RoomList;
};
