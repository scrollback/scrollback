/* jshint browser: true */

var stringUtils = require("../../lib/string-utils.js"),
	roomPics = {};

function getRoomPics(roomId) {
	var hash, cover, picture;

	if (roomPics[roomId]) {
		return roomPics[roomId];
	}

	hash = stringUtils.hashCode(roomId);
	cover = parseInt((hash + "").slice(-2));
	picture = parseInt((hash + "").slice(-4).slice(0,2));

	if (cover > 50) {
		cover = Math.round(cover / 2) + "";
	} else if (cover < 10) {
		cover = "0" + cover;
	}

	if (picture > 50) {
		picture = Math.round(picture / 2) + "";
	} else if (picture < 10) {
		picture = "0" + picture;
	}

	roomPics[roomId] = {
		cover: "/s/pictures/" + cover + ".jpg",
		picture: "/s/pictures/" + picture + ".jpg"
	};

	return roomPics[roomId];
}

module.exports = function(core, config, store) {
	var React = require("react"),
		RoomCard;

	RoomCard = React.createClass({
		// getCardState: function () {
		// 	return { threads: store.getThreads(room.roomId, null, -room.threadCount || -2).reverse() };
		// },
		// getInitialState: function () {
		// 	return this.getCardState();
		// },
		// componentDidMount: function () {
		// 	core.on('statechange', function(changes, next) {
		// 		if(changes.contains('content.' + room.roomId + '.threadRanges')) {
		// 			this.setstate (this.getCardState());
		// 		}

		// 		next();
		// 	}, 500);
		// },
		goToRoom: function() {
			core.emit("setstate", {
				nav: {
					room: this.props.roomId,
					mode: "room",
					view: null,
					thread: null
				}
			});
		},

		render: function() {
			var room = store.getRoom(this.props.roomId),
				roomCover = room.cover || getRoomPics(this.props.roomId).cover,
				roomPicture = room.picture || getRoomPics(this.props.roomId).picture,
				threads;

			threads = (store.getThreads(this.props.roomId, null, ((this.props.threadCount || 2) * -1)) || []).reverse().map(function(thread) {
				return (
			        <div key={"room-card-thread-" + room.id + "-" + thread.id} className="card-thread">
						<span className="card-thread-message">{thread.title}</span>
						<span className="card-thread-by">{thread.from}</span>
					</div>
				);
			});

			return (
			    <div key={"room-card-" + room.id} className="card room-card js-room-card" onClick={this.goToRoom}>
			      	<div className="card-cover" style={{ backgroundImage: "url(" + roomCover  + ")" }}>
			      		<div className="card-cover-header card-header">
			      			<span className="card-header-badge notification-badge notification-badge-mention">{room.mentions}</span>
			      			<span className="card-header-badge notification-badge notification-badge-messages">{room.messages}</span>
			      			<a className="card-header-icon card-header-icon-more card-cover-icon js-room-more"></a>
			  			</div>
			  			<div className="card-cover-logo" style={{ backgroundImage: "url(" + roomPicture  + ")" }}></div>
			  			<h3 className="card-cover-title">{room.id}</h3>
					</div>
					<div className="card-content card-content-big">
						<h4 className="card-content-title">Recent discussions</h4>
						{threads}
					</div>
				</div>
			);
		}
	});

	return RoomCard;
};
