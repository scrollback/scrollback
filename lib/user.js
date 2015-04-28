/**
 * Methods related to the user object
 */

module.exports = function(core, config, store) {
	return {
		getNick: function(userId) {
			var nick = (typeof userId === "string") ? userId.replace(/^guest-/, "") : "";

			return nick;
		},

		isGuest: function(userId) {
			return (/^guest-/.test(userId));
		},

		isAdmin: function(userId, roomId) {
			var rel = store.getRelation(roomId, userId);

			return (rel && /^(owner|moderator|su)$/.test(rel.role));
		}
	};
};
