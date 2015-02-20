module.exports = {
	isGuest: function(str) {
		return /^guest-/.test(str);
	},
	isInternalSession: function(str) {
		return /^internal-/.test(str);
	},
	isIRCSession: function(str) {
		return /^irc-/.test(str);
	}
};