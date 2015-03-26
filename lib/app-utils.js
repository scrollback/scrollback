module.exports = {
	formatUserName: function(id) {
		var name = (typeof id === "string") ? id.replace(/^guest-/, "") : "";

		return name;
	},
	isGuest: function(str) {
		return /^guest-/.test(str);
	},
	isInternalSession: function(str) {
		return /^internal-/.test(str);
	},
	isIRCSession: function(str) {
		return /^irc:/.test(str);
	}
};
