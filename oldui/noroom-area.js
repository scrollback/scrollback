/* jshint browser: true */
/* global $, libsb */

libsb.on('navigate', function(state, next) {
	if (state.mode === 'profile') {
		$('#profile-view-name').text(state.roomName);
	}
	next();
}, 100);