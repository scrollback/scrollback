/* jshint browser: true */
/* global $, libsb, currentState */

var currentConfig,
	renderSettings = require("./render-settings.js");

$(".conf-save").on("click", function () {
	if (currentState.mode == 'pref') {
		var userObj = {
			id: libsb.user.id,
			description: '',
			identities: [],
			params: {},
			guides: {}
		};

		libsb.emit('pref-save', userObj, function (err, user) {
			libsb.emit('user-up', {
				user: user
			}, function () {
				currentConfig = null;

				libsb.emit('navigate', {
					mode: "normal",
					tab: "info",
					source: "conf-save"
				});
			});
		});
	}
});

$(".conf-cancel").on("click", function () {
	currentConfig = null;

	$('.pref-area').empty();

	libsb.emit('navigate', {
		mode: "normal",
		tab: "info",
		source: "conf-cancel"
	});
});

function getUsers() {
	libsb.emit('getUsers', {
		ref: "me"
	}, function (err, data) {
		var user = data.results[0];

		if (!user.params) user.params = {};
		if (!user.guides) user.guides = {};

		var userObj = {
			user: user
		};

		libsb.emit('pref-show', userObj, function (err, tabs) {
			delete tabs.user;
			currentConfig = tabs;
			renderSettings(tabs, user);
		});
	});
}

libsb.on('navigate', function (state, next) {
	if (state.old && state.old.mode !== state.mode && state.mode === "pref") {
		if (!currentConfig) {
			if (libsb.user.id.indexOf('guest-') === 0) {
				libsb.emit('navigate', {
					mode: 'normal'
				});
			}
			getUsers();
		}
	}
	next();
}, 500);