module.exports = function(self) {
	return function() {
		/*
			widget.signin({nick: 'jace'}, callback) attempts to change the guest nickname to jace, and calls back when done.
			widget.signing({jws: '…', nick: 'jace'}) attempts to sign in using the email address in the jws, and suggests the nickname ‘jace’ if the user is new. The user is always given an option to change this before his/her account is created.
			Security: User consent (not blacklisted) required for jws login.
		*/
		self.emit("signin", arguments[0], arguments[1]);
	};
};