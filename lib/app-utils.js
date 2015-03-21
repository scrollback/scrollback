module.exports = {
	isGuest: function(str) {
		if (!str) {
			return true;
		}

		return /^guest-/.test(str);
	},
	isInternalSession: function(str) {
		return /^internal-/.test(str);
	},
	isIRCSession: function(str) {
		return /^irc:/.test(str);
	}
};
