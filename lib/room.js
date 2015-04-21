/**
 * Methods related to the room object
 */

module.exports = function(core, config, store) {
	return {
		follow: function(roomId) {
			core.emit("join-up", { to: roomId });
		},

		unFollow: function(roomId) {
			core.emit("part-up", { to: roomId });
		},

		toggleFollow: function(roomId, userId) {
			var rel = store.getRelation(roomId, userId);

			if (rel && rel.role === "follower") {
				this.follow();
			} else {
				this.unFollow();
			}
		}
	};
};
